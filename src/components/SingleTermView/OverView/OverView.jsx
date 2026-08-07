// SingleTermView/OverView/OverView.jsx
import { Box, Divider, Grid, Snackbar, Alert } from "@mui/material";
import PropTypes from "prop-types";
import RawDataViewer from "./RawDataViewer";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import {
  getMatchTerms,
  getRawData,
  getTermHierarchies,
  getTermPredicates,
  getTermVersion,
} from "../../../api/endpoints/apiService";
import termParser from "../../../parsers/termParser";
import { adaptVersionJsonLd } from "../../../parsers/versionAdapter";
import { patchEndpointsIlx } from "../../../api/endpoints/interLexURIStructureAPI";
import {
  focusNodeFromJsonLd,
  buildTripleDiff,
  resolveStoredObject,
} from "../../../parsers/predicateMutations";
import { buildPredicateGroupsForFocus } from "../../../parsers/predicateParser";
import { shortenIri, getObjectInputKind, buildExpandContext } from "../../../configuration/predicateConfig";
import {
  toHierarchyOptionsFromTriples,
  buildChildrenTreeFromTriples,
  buildSuperclassesTreeFromTriples,
  dedupePredicateGroups,
} from "../../../parsers/hierarchies-parser";
import { createOverviewStore } from "./overviewStore";
import {
  ontologyDetails,
  ontologyFocus,
  ontologyHierarchy,
  ontologyPredicateGroups,
} from "../../../parsers/ontologyTermAdapter";
import { findCell } from "../../CellCards/services/ontologyGridService";
import { useContextTerm } from "../../../hooks/useContextOntology";
import { useTermRecordAvailability } from "../../../hooks/useTermRecordAvailability";
import { DetailsSection, HierarchySection, PredicatesSection } from "./OverviewSections";
import OverviewSideNav from "./OverviewSideNav";
import { emitPredicateRowUpdate, makeRowKey } from "./predicateMutationBus";
import { reportApiError } from "../../../api/apiErrorBus";
import ApiErrorDialog from "../../common/ApiErrorDialog";
import { GlobalDataContext } from "../../../contexts/DataContext";

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

// patchTerm resolves with { status, term } on success, or the raw axios error
// (its .catch returns it) on failure. Normalize to { ok, status, message }.
const interpretPatchResult = (res) => {
  const status = res?.status ?? res?.response?.status;
  const ok = status === 200 || status === 201;
  if (ok) return { ok, status, message: "" };

  const body = res?.response?.data ?? res?.data ?? res?.message ?? "";
  let message = typeof body === "string" ? body : JSON.stringify(body);
  // Backend errors come back as small HTML pages: pull out the <p> text.
  const para = message.match(/<p>([\s\S]*?)<\/p>/i);
  message = (para ? para[1] : message.replace(/<[^>]*>/g, " "))
    .replace(/&#34;/g, '"').replace(/&quot;/g, '"').replace(/&amp;/g, "&")
    .replace(/\s+/g, " ").trim();
  if (!message) message = status ? `Request failed (HTTP ${status})` : "Request failed";
  return { ok, status, message };
};

const OverView = ({ searchTerm, isCodeViewVisible = false, selectedDataFormat, group = "base", versionHash }) => {
  const { curies } = useContext(GlobalDataContext);
  // Per-instance rxjs streams; each section subscribes to its own.
  const storeRef = useRef();
  if (!storeRef.current) storeRef.current = createOverviewStore();
  const store = storeRef.current;

  // The Overview's second source, for a term InterLex has no record of: the context ontology's own
  // record, rendered through `ontologyTermAdapter` instead of the term API.
  const {
    cell: ontologyCell,
    ontology,
    loading: ontologyLoading,
  } = useContextTerm(searchTerm);
  // Only asked once the ontology has an answer, so an ordinary term page adds no probe of its own;
  // the result is shared through the hook's module cache with the page shell's copy.
  const termRecordAvailable = useTermRecordAvailability(searchTerm, group, Boolean(ontologyCell));
  // The ontology is the *fallback*. An InterLex record, once curation creates one, is the term's
  // real home and the only editable one, so it takes the tab back.
  const fromOntology = Boolean(ontologyCell) && !versionHash && termRecordAvailable !== true;

  // Guards against stale async writes after the term/group changed.
  const loadTokenRef = useRef(0);
  // Latest raw inputs to the predicate merge (arrive independently).
  const jsonDataRef = useRef(null);
  const groupsRef = useRef([]);
  const jsonReadyRef = useRef(false);
  const groupsReadyRef = useRef(false);

  // feedback for inline predicate edits (add/edit/delete)
  const [mutationFeedback, setMutationFeedback] = useState(null);

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

  // Live (head) load. Each fetch resolves and writes its own stream. Skipped once the ontology is
  // serving the term, and while that lookup is open: these requests 404 for such a term, and their
  // failures would raise the shared error dialog over a page that renders fine without them.
  useEffect(() => {
    if (versionHash || fromOntology || ontologyLoading) return undefined;
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
  }, [group, searchTerm, versionHash, store, maybePushPredicates, fromOntology, ontologyLoading]);

  // Ontology load: the same three streams, filled from the parse. Synchronous throughout, so moving
  // the hierarchy focus re-derives rather than fetching, and a focus the ontology has no record for
  // (the root the cells hang from) still gets its hierarchy, just no predicates.
  useEffect(() => {
    if (!fromOntology) return undefined;
    const token = ++loadTokenRef.current;
    const isStale = () => token !== loadTokenRef.current;

    const focus = ontologyFocus(ontologyCell);
    store.details$.next({ loading: false, data: ontologyDetails(ontologyCell), jsonData: null });
    // Before subscribing: selectedValue$ replays, so the subscription fills the other two streams.
    store.selectedValue$.next(focus);

    const sub = store.selectedValue$.subscribe((sv) => {
      if (isStale()) return;
      const focusId = sv?.id || focus.id;
      const focusCell = ontology ? findCell(ontology, focusId) : null;
      store.hierarchy$.next({ loading: false, ...ontologyHierarchy(ontology, focusId) });
      store.predicates$.next({
        loading: false,
        data: focusCell
          ? ontologyPredicateGroups(focusCell, ontology?.predicateDisplay, ontology?.mappings)
          : [],
        focusId,
      });
    });

    return () => {
      sub.unsubscribe();
      // eslint-disable-next-line react-hooks/exhaustive-deps
      loadTokenRef.current++;
    };
  }, [fromOntology, ontologyCell, ontology, store]);

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

  // Apply a single predicate triple add/edit/delete to the focus term and PATCH.
  const handlePredicateMutation = useCallback(
    async (mutation) => {
      const jsonData = jsonDataRef.current;
      const selectedValue = store.selectedValue$.getValue();
      const patchId = (selectedValue?.id || searchTerm || "").split("/").pop();

      // Predicate groups are sourced from the "base" graph, so expand curies
      // with the base @context. GET-first guarantees the predicate IRIs
      // round-trip.
      const baseDoc = await getRawData("base", patchId, "jsonld");
      const jsonLdContext = baseDoc?.["@context"] || jsonData?.["@context"] || {};
      // Merge known-term shorthands (e.g. "definition" → IAO IRI) under the
      // JSON-LD context so bare predicate names expand to full IRIs.
      const context = { ...buildExpandContext(curies?.base ?? []), ...jsonLdContext };
      const node = focusNodeFromJsonLd(baseDoc) || focusNodeFromJsonLd(jsonData);
      const subject = mutation.subject || node?.["@id"];
      if (!subject) {
        setMutationFeedback({ severity: "error", message: "Could not resolve the term subject" });
        return;
      }
      const oldObject =
        mutation.op === "edit" || mutation.op === "delete"
          ? resolveStoredObject(node, mutation.predicate, mutation.oldValue)
          : null;
      const payload = buildTripleDiff(subject, { ...mutation, oldObject }, context);

      const isEdit = mutation.op === "edit";
      const rowKey = isEdit
        ? makeRowKey(mutation.subject, mutation.predicate, mutation.oldValue)
        : null;
      try {
        await patchEndpointsIlx(group, patchId, { data: payload });
        setMutationFeedback({ severity: "success", message: "Change saved" });
        if (isEdit) {
          // Surgical update: only the edited row refreshes.
          emitPredicateRowUpdate({ rowKey, newValue: mutation.newValue, status: "success" });
        } else {
          // add/delete change the table structure -> refresh predicates.
          reloadAfterMutation();
        }
      } catch (e) {
        console.error("handlePredicateMutation error:", e);
        const { message } = interpretPatchResult(e);
        setMutationFeedback({ severity: "error", message: message || "Could not save change" });
        if (isEdit) emitPredicateRowUpdate({ rowKey, status: "error" });
      }
    },
    [store, group, searchTerm, reloadAfterMutation, curies]
  );

  // No `onMutate` -> Predicates renders read-only, as in version mode: neither has an InterLex
  // record behind it to PATCH.
  const onMutate = versionHash || fromOntology ? undefined : handlePredicateMutation;

  return (
    <Box p="2.5rem 5rem" sx={{ overflow: "auto" }}>
      {isCodeViewVisible ? (
        <RawDataViewer dataId={searchTerm} dataFormat={selectedDataFormat} group={group} versionHash={versionHash} />
      ) : (
        <>
          <OverviewSideNav items={SIDE_NAV_ITEMS} />
          <Box id="overview-section-details">
            <DetailsSection subject={store.details$} reserveHeight={DETAILS_MIN_HEIGHT} />
          </Box>
          <Box p="5rem 0">
            <Divider />
            <Grid container pt="5.25rem" spacing="2.75rem">
              <Grid item xs={12} lg={4} id="overview-section-hierarchy">
                <HierarchySection
                  subject={store.hierarchy$}
                  selectedSubject={store.selectedValue$}
                  onSelect={handleSelect}
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
      <Snackbar
        open={!!mutationFeedback}
        autoHideDuration={mutationFeedback?.severity === "error" ? null : 4000}
        onClose={() => setMutationFeedback(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        {mutationFeedback ? (
          <Alert
            onClose={() => setMutationFeedback(null)}
            severity={mutationFeedback.severity}
            variant="filled"
            sx={{
              maxWidth: "32rem",
              // theme forces IconButton bg white -> white close X becomes invisible
              "& .MuiAlert-action .MuiIconButton-root": {
                background: "transparent",
                "&:hover": { background: "rgba(255,255,255,0.2)" },
              },
              "& .MuiAlert-action .MuiSvgIcon-root": { color: "#fff" },
            }}
          >
            {mutationFeedback.message}
          </Alert>
        ) : undefined}
      </Snackbar>
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
