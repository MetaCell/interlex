// SingleTermView/OverView/OverView.jsx
import { Box, Divider, Grid, Snackbar, Alert } from "@mui/material";
import PropTypes from "prop-types";
import RawDataViewer from "./RawDataViewer";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  getMatchTerms,
  getRawData,
  getTermHierarchies,
  getTermPredicates,
  getTermVersion,
} from "../../../api/endpoints/apiService";
import termParser from "../../../parsers/termParser";
import { versionSnapshotToJsonLd } from "../../../parsers/versionParser";
import { patchEndpointsIlx } from "../../../api/endpoints/interLexURIStructureAPI";
import {
  focusNodeFromJsonLd,
  buildTripleDiff,
  resolveStoredObject,
} from "../../../parsers/predicateMutations";
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
import { emitPredicateRowUpdate, makeRowKey } from "./predicateMutationBus";
import { reportApiError } from "../../../api/apiErrorBus";
import ApiErrorDialog from "../../common/ApiErrorDialog";

// Reserved minimum heights while a section loads, so content arriving in one
// section can't shove a section the user is already scrolled to.
const DETAILS_MIN_HEIGHT = 240;
const HIERARCHY_MIN_HEIGHT = 420;
const PREDICATES_MIN_HEIGHT = 320;

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

// Normalize a predicate group's title + row predicates from full IRIs to curies.
const shortenGroup = (g) => ({
  ...g,
  title: shortenIri(g.title),
  tableData: Array.isArray(g.tableData)
    ? g.tableData.map((r) => ({ ...r, predicate: shortenIri(r.predicate) }))
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
const mergePredicates = ({ versionHash, jsonData, predicateGroups, focusCurie, searchTerm }) => {
  const termId = focusCurie ? toILX(focusCurie) : searchTerm;

  if (versionHash) {
    if (!jsonData) return [];
    // isAbout / owl:versionIRI are synthetic markers the snapshot parser adds
    // for termParser + Details; they are not real term predicates.
    return dedupePredicateGroups(
      buildPredicateGroupsForFocus(jsonData, termId)
        .filter((g) => !META_TITLES.has(norm(g.title)))
        .map(shortenGroup)
    );
  }

  const freshGroups = jsonData
    ? buildPredicateGroupsForFocus(jsonData, termId).map(shortenGroup)
    : [];
  const freshLiteralTitles = new Set(
    freshGroups.filter((g) => getObjectInputKind(g.title) === "text").map((g) => norm(g.title))
  );
  const freshLiterals = freshGroups.filter((g) => freshLiteralTitles.has(norm(g.title)));
  const transitive = (Array.isArray(predicateGroups) ? predicateGroups : [])
    .map(shortenGroup)
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
      });
      store.predicates$.next({ loading: false, data, focusId });
    },
    [store, searchTerm]
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
        // Borrow the live head @context (richer curie set) when reachable.
        let headContext;
        try {
          const head = await getRawData(group, searchTerm, "jsonld");
          headContext = head?.["@context"];
        } catch {
          /* fall back to the parser's default context */
        }

        const snapshot = await getTermVersion(group, searchTerm, versionHash);
        if (isStale()) return;

        const jsonld = versionSnapshotToJsonLd(snapshot, versionHash, headContext);
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
  }, [versionHash, searchTerm, group, store]);

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
      const context = baseDoc?.["@context"] || jsonData?.["@context"] || {};
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
    [store, group, searchTerm, reloadAfterMutation]
  );

  const onMutate = versionHash ? undefined : handlePredicateMutation;

  return (
    <Box p="2.5rem 5rem" sx={{ overflow: "auto" }}>
      {isCodeViewVisible ? (
        <RawDataViewer dataId={searchTerm} dataFormat={selectedDataFormat} group={group} versionHash={versionHash} />
      ) : (
        <>
          <DetailsSection subject={store.details$} reserveHeight={DETAILS_MIN_HEIGHT} />
          <Box p="5rem 0">
            <Divider />
            <Grid container pt="5.25rem" spacing="2.75rem">
              <Grid item xs={12} lg={4}>
                <HierarchySection
                  subject={store.hierarchy$}
                  selectedSubject={store.selectedValue$}
                  onSelect={handleSelect}
                  reserveHeight={HIERARCHY_MIN_HEIGHT}
                />
              </Grid>
              <Grid item xs={12} lg={8}>
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
