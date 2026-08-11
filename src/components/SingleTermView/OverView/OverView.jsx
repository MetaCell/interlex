// SingleTermView/OverView/OverView.jsx
import { Box, Divider, Grid } from "@mui/material";
import PropTypes from "prop-types";
import RawDataViewer from "./RawDataViewer";
import { useCallback, useContext, useEffect, useRef } from "react";
import {
  getMatchTerms,
  getRawData,
  getTermHierarchies,
  getTermPredicates,
  getTermVersion,
} from "../../../api/endpoints/apiService";
import termParser from "../../../parsers/termParser";
import { adaptVersionJsonLd } from "../../../parsers/versionAdapter";
import { buildPredicateGroupsForFocus } from "../../../parsers/predicateParser";
import { shortenIri, getObjectInputKind } from "../../../configuration/predicateConfig";
import {
  toHierarchyOptionsFromTriples,
  buildChildrenTreeFromTriples,
  buildSuperclassesTreeFromTriples,
  dedupePredicateGroups,
} from "../../../parsers/hierarchies-parser";
import { createOverviewStore } from "./overviewStore";
import { DetailsSection, HierarchySection, PredicatesSection } from "./OverviewSections";
import OverviewSideNav from "./OverviewSideNav";
import { reportApiError } from "../../../api/apiErrorBus";
import ApiErrorDialog from "../../common/ApiErrorDialog";
import { GlobalDataContext } from "../../../contexts/DataContext";
import { useEditSession } from "../../../contexts/editSession";

// Reserved minimum heights while a section loads, so content arriving in one
// section can't shove a section the user is already scrolled to.
const DETAILS_MIN_HEIGHT = 240;
const HIERARCHY_MIN_HEIGHT = 420;
const PREDICATES_MIN_HEIGHT = 320;

const SIDE_NAV_ITEMS = [
  { id: "overview-section-details", label: "Details" },
  { id: "overview-section-hierarchy", label: "Hierarchy & relations" },
  { id: "overview-section-predicates", label: "Predicates" },
];

const META_TITLES = new Set(["isabout", "ilx.isabout", "owl:versioniri"]);
const norm = (t) => String(t || "").trim().toLowerCase();

// Surface a failed backend request (with its URL + backend message) to the
// shared error dialog.
const reportFetchFailure = (context, e) => {
  reportApiError({
    context,
    url: e?.url || "",
    status: e?.status,
    message: e?.body || e?.message || "Request failed",
  });
};

// normalize ID for API calls
const toILX = (curieLike) => {
  const t = (curieLike || "").split("/").pop() || curieLike;
  return t.replace(/^ilx_/i, "ILX:");
};

// Normalize a predicate group's title + row predicates from full IRIs to
// curies, preferring the app's live (user/org) curies over the hardcoded ones.
const shortenGroup = (g, curies) => ({
  ...g,
  title: shortenIri(g.title, curies),
  tableData: Array.isArray(g.tableData)
    ? g.tableData.map((r) => ({ ...r, predicate: shortenIri(r.predicate, curies) }))
    : g.tableData,
});

// Pure assembly of the predicate groups shown in the table/graph.
//
// TODO(predicates-freshness): TEMPORARY WORKAROUND. The transitive-query
// endpoint (getTermPredicates) does not reflect the term head right after a
// PATCH, so edited literal predicates would still show the old value. Until the
// backend serves head-consistent data, the editable literal predicates are
// overridden with the fresh .jsonld groups. Once fixed, return
// dedupePredicateGroups(predicateGroups.map(shortenGroup)).
const mergePredicates = ({ versionHash, jsonData, predicateGroups, focusCurie, searchTerm, curies }) => {
  const termId = focusCurie ? toILX(focusCurie) : searchTerm;
  const shorten = (g) => shortenGroup(g, curies);

  if (versionHash) {
    if (!jsonData) return [];
    // isAbout / owl:versionIRI are synthetic markers the snapshot parser adds
    // for termParser + Details; they are not real term predicates.
    return dedupePredicateGroups(
      buildPredicateGroupsForFocus(jsonData, termId)
        .filter((g) => !META_TITLES.has(norm(g.title)))
        .map(shorten)
    );
  }

  const freshGroups = jsonData
    ? buildPredicateGroupsForFocus(jsonData, termId).map(shorten)
    : [];
  const freshLiteralTitles = new Set(
    freshGroups.filter((g) => getObjectInputKind(g.title) === "text").map((g) => norm(g.title))
  );
  const freshLiterals = freshGroups.filter((g) => freshLiteralTitles.has(norm(g.title)));
  const transitive = (Array.isArray(predicateGroups) ? predicateGroups : [])
    .map(shorten)
    .filter((g) => !freshLiteralTitles.has(norm(g.title)));

  return dedupePredicateGroups([...freshLiterals, ...transitive]);
};

// Fetch + parse both hierarchy directions for a focus id.
const fetchHierarchiesData = async (curieLike, group) => {
  const termId = toILX(curieLike);
  const [childRes, superRes] = await Promise.all([
    getTermHierarchies({ groupname: group, termId, objToSub: true }),
    getTermHierarchies({ groupname: group, termId, objToSub: false }),
  ]);
  const childTriples = childRes?.triples || [];
  const superTriples = superRes?.triples || [];
  return {
    treeChildren: buildChildrenTreeFromTriples(childTriples, termId),
    treeSuperclasses: buildSuperclassesTreeFromTriples(superTriples, termId),
    options: {
      children: toHierarchyOptionsFromTriples(childTriples),
      superclasses: toHierarchyOptionsFromTriples(superTriples),
    },
  };
};

const OverView = ({ searchTerm, isCodeViewVisible = false, selectedDataFormat, group = "base", versionHash }) => {
  const { curies } = useContext(GlobalDataContext);
  // Edit mode is owned by the term header; the sections below only stage
  // mutations into it, and the single PATCH happens on Save.
  const { isEditing, stageMutation, setFocus, registerReload } = useEditSession();
  // Per-instance rxjs streams; each section subscribes to its own.
  const storeRef = useRef();
  if (!storeRef.current) storeRef.current = createOverviewStore();
  const store = storeRef.current;

  // Guards against stale async writes after the term/group changed.
  const loadTokenRef = useRef(0);
  // Latest raw inputs to the predicate merge (arrive independently).
  const jsonDataRef = useRef(null);
  const groupsRef = useRef([]);
  const jsonReadyRef = useRef(false);
  const groupsReadyRef = useRef(false);

  // Push merged predicates once both inputs (fresh .jsonld + transitive groups)
  // are ready; until then the section stays in its loading state.
  const maybePushPredicates = useCallback(
    (focus, token) => {
      if (token != null && token !== loadTokenRef.current) return;
      const ready = jsonReadyRef.current && groupsReadyRef.current;
      const focusId = focus?.id || null;
      if (!ready) {
        store.predicates$.next({ loading: true, data: [], focusId });
        return;
      }
      const data = mergePredicates({
        versionHash: null,
        jsonData: jsonDataRef.current,
        predicateGroups: groupsRef.current,
        focusCurie: focusId,
        searchTerm,
        curies: curies?.base,
      });
      store.predicates$.next({ loading: false, data, focusId });
    },
    [store, searchTerm, curies]
  );

  // Live (head) load. Each fetch resolves and writes its own stream.
  useEffect(() => {
    if (versionHash) return undefined;
    const token = ++loadTokenRef.current;
    const isStale = () => token !== loadTokenRef.current;

    jsonDataRef.current = null;
    groupsRef.current = [];
    jsonReadyRef.current = false;
    groupsReadyRef.current = false;

    store.details$.next({ loading: true, data: null, jsonData: null });
    store.hierarchy$.next({
      loading: true,
      options: { children: [], superclasses: [] },
      treeChildren: [],
      treeSuperclasses: [],
    });
    store.predicates$.next({ loading: true, data: [], focusId: null });
    store.selectedValue$.next(null);

    // React to focus changes: hierarchy + transitive predicates.
    const sub = store.selectedValue$.subscribe((sv) => {
      if (isStale()) return;
      if (!sv?.id) {
        store.hierarchy$.next({
          loading: false,
          options: { children: [], superclasses: [] },
          treeChildren: [],
          treeSuperclasses: [],
        });
        groupsReadyRef.current = true;
        maybePushPredicates(null, token);
        return;
      }

      store.hierarchy$.next({ ...store.hierarchy$.getValue(), loading: true });
      fetchHierarchiesData(sv.id, group)
        .then((res) => {
          if (isStale()) return;
          store.hierarchy$.next({ loading: false, ...res });
        })
        .catch((e) => {
          if (isStale()) return;
          console.error("fetchHierarchies error:", e);
          reportFetchFailure("Loading hierarchy", e);
          store.hierarchy$.next({
            loading: false,
            options: { children: [], superclasses: [] },
            treeChildren: [],
            treeSuperclasses: [],
          });
        });

      groupsReadyRef.current = false;
      store.predicates$.next({ ...store.predicates$.getValue(), loading: true, focusId: sv.id });
      getTermPredicates({ groupname: group, termId: toILX(sv.id) })
        .then((groups) => {
          if (isStale()) return;
          groupsRef.current = groups || [];
          groupsReadyRef.current = true;
          maybePushPredicates(sv, token);
        })
        .catch((e) => {
          if (isStale()) return;
          console.error("fetchPredicates error:", e);
          reportFetchFailure("Loading predicates", e);
          groupsRef.current = [];
          groupsReadyRef.current = true;
          maybePushPredicates(sv, token);
        });
    });

    // term match -> details data + the initial focus
    (async () => {
      if (!searchTerm) {
        if (isStale()) return;
        store.details$.next({ loading: false, data: null, jsonData: null });
        store.selectedValue$.next(null);
        return;
      }
      try {
        const apiData = await getMatchTerms(group, searchTerm);
        if (isStale()) return;
        const first = apiData?.results?.[0] || null;
        const id =
          first?.curie || first?.ilx || first?.id || first?.termId || first?.identifier || null;
        const label =
          first?.label || first?.rdfsLabel || first?.prefLabel || first?.term || first?.name || id;
        store.details$.next({ loading: false, data: first, jsonData: jsonDataRef.current });
        store.selectedValue$.next(id ? { id, label } : null);
      } catch (e) {
        if (isStale()) return;
        console.error("term match error:", e);
        store.details$.next({ loading: false, data: null, jsonData: jsonDataRef.current });
        store.selectedValue$.next(null);
      }
    })();

    // .jsonld -> details.jsonData + fresh literal predicates
    (async () => {
      try {
        const raw = await getRawData(group, searchTerm, "jsonld");
        if (isStale()) return;
        jsonDataRef.current = raw;
        jsonReadyRef.current = true;
        store.details$.next({ ...store.details$.getValue(), jsonData: raw });
        maybePushPredicates(store.selectedValue$.getValue(), token);
      } catch (e) {
        if (isStale()) return;
        console.error("jsonld fetch error:", e);
        jsonReadyRef.current = true; // don't block predicates forever
        maybePushPredicates(store.selectedValue$.getValue(), token);
      }
    })();

    return () => {
      sub.unsubscribe();
      // Invalidate any in-flight async writes from this load.
      // eslint-disable-next-line react-hooks/exhaustive-deps
      loadTokenRef.current++;
    };
  }, [group, searchTerm, versionHash, store, maybePushPredicates]);

  // Version mode: load a single term-version snapshot through the same pipeline.
  useEffect(() => {
    if (!versionHash || !searchTerm) return undefined;
    const token = ++loadTokenRef.current;
    const isStale = () => token !== loadTokenRef.current;

    store.details$.next({ loading: true, data: null, jsonData: null });
    store.hierarchy$.next({
      loading: true,
      options: { children: [], superclasses: [] },
      treeChildren: [],
      treeSuperclasses: [],
    });
    store.predicates$.next({ loading: true, data: [], focusId: null });
    store.selectedValue$.next(null);

    // Hierarchy still comes from the live graph for the selected focus.
    const sub = store.selectedValue$.subscribe((sv) => {
      if (isStale() || !sv?.id) {
        if (!isStale() && !sv?.id) {
          store.hierarchy$.next({
            loading: false,
            options: { children: [], superclasses: [] },
            treeChildren: [],
            treeSuperclasses: [],
          });
        }
        return;
      }
      store.hierarchy$.next({ ...store.hierarchy$.getValue(), loading: true });
      fetchHierarchiesData(sv.id, group)
        .then((res) => {
          if (!isStale()) store.hierarchy$.next({ loading: false, ...res });
        })
        .catch((e) => {
          if (isStale()) return;
          console.error("fetchHierarchies error:", e);
          reportFetchFailure("Loading hierarchy", e);
          store.hierarchy$.next({
            loading: false,
            options: { children: [], superclasses: [] },
            treeChildren: [],
            treeSuperclasses: [],
          });
        });
    });

    (async () => {
      try {
        const raw = await getTermVersion(group, searchTerm, versionHash);
        if (isStale()) return;

        const jsonld = adaptVersionJsonLd(raw);
        const first = termParser(jsonld, searchTerm)?.results?.[0] || null;
        store.details$.next({ loading: false, data: first, jsonData: jsonld });
        const sv = { id: first?.id || searchTerm, label: first?.label || searchTerm };
        store.selectedValue$.next(sv);
        const data = mergePredicates({
          versionHash,
          jsonData: jsonld,
          predicateGroups: [],
          focusCurie: sv.id,
          searchTerm,
          curies: curies?.base,
        });
        store.predicates$.next({ loading: false, data, focusId: sv.id });
      } catch (e) {
        if (isStale()) return;
        console.error("loadVersion error:", e);
        store.details$.next({ loading: false, data: null, jsonData: null });
        store.predicates$.next({ loading: false, data: [], focusId: null });
      }
    })();

    return () => {
      sub.unsubscribe();
      // Invalidate any in-flight async writes from this load.
      // eslint-disable-next-line react-hooks/exhaustive-deps
      loadTokenRef.current++;
    };
  }, [versionHash, searchTerm, group, store, curies]);

  const handleSelect = useCallback(
    (value) => {
      store.selectedValue$.next(value);
    },
    [store]
  );

  // Refresh .jsonld + term data + transitive predicates after a structural
  // (add/delete) mutation, without disturbing hierarchy/focus or scroll.
  const reloadAfterMutation = useCallback(async () => {
    const focus = store.selectedValue$.getValue();
    try {
      const raw = await getRawData(group, searchTerm, "jsonld");
      jsonDataRef.current = raw;
      jsonReadyRef.current = true;
      store.details$.next({ ...store.details$.getValue(), jsonData: raw });
    } catch (e) {
      console.error("reload jsonld error:", e);
    }
    try {
      const apiData = await getMatchTerms(group, searchTerm);
      const first = apiData?.results?.[0] || null;
      store.details$.next({ ...store.details$.getValue(), data: first });
    } catch (e) {
      console.error("reload term match error:", e);
    }
    if (focus?.id) {
      try {
        const groups = await getTermPredicates({ groupname: group, termId: toILX(focus.id) });
        groupsRef.current = groups || [];
        groupsReadyRef.current = true;
        maybePushPredicates(focus, null);
      } catch (e) {
        console.error("reload predicates error:", e);
      }
    }
  }, [store, group, searchTerm, maybePushPredicates]);

  // The session saves against the focus term (which the hierarchy can move) and
  // refreshes these sections once its PATCH lands.
  useEffect(() => {
    registerReload(reloadAfterMutation);
    return () => registerReload(null);
  }, [registerReload, reloadAfterMutation]);

  useEffect(() => {
    const sub = store.selectedValue$.subscribe((sv) => setFocus(sv));
    return () => sub.unsubscribe();
  }, [store, setFocus]);

  // Editing is off outside edit mode and on a read-only version snapshot; the
  // sections read `onMutate` being present as "this is editable".
  const onMutate = versionHash || !isEditing ? undefined : stageMutation;

  return (
    <Box p="2.5rem 5rem" sx={{ overflow: "auto" }}>
      {isCodeViewVisible ? (
        <RawDataViewer dataId={searchTerm} dataFormat={selectedDataFormat} group={group} versionHash={versionHash} />
      ) : (
        <>
          <OverviewSideNav items={SIDE_NAV_ITEMS} />
          <Box id="overview-section-details">
            <DetailsSection
              subject={store.details$}
              group={group}
              onMutate={onMutate}
              reserveHeight={DETAILS_MIN_HEIGHT}
            />
          </Box>
          <Box p="5rem 0">
            <Divider />
            <Grid container pt="5.25rem" spacing="2.75rem">
              <Grid item xs={12} lg={4} id="overview-section-hierarchy">
                <HierarchySection
                  subject={store.hierarchy$}
                  selectedSubject={store.selectedValue$}
                  detailsSubject={store.details$}
                  onSelect={handleSelect}
                  group={group}
                  onMutate={onMutate}
                  reserveHeight={HIERARCHY_MIN_HEIGHT}
                />
              </Grid>
              <Grid item xs={12} lg={8} id="overview-section-predicates">
                <PredicatesSection
                  subject={store.predicates$}
                  group={group}
                  onMutate={onMutate}
                  reserveHeight={PREDICATES_MIN_HEIGHT}
                />
              </Grid>
            </Grid>
          </Box>
        </>
      )}
      <ApiErrorDialog />
    </Box>
  );
};

OverView.propTypes = {
  searchTerm: PropTypes.string,
  isCodeViewVisible: PropTypes.bool,
  selectedDataFormat: PropTypes.string,
  group: PropTypes.string,
  versionHash: PropTypes.string,
};

export default OverView;
