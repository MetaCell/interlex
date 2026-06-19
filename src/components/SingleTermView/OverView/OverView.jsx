// SingleTermView/OverView/OverView.jsx
import {
  Box,
  Divider,
  Grid,
  CircularProgress,
  Snackbar,
  Alert,
} from "@mui/material";
import Details from "./Details";
import { debounce } from "lodash";
import PropTypes from "prop-types";
import Hierarchy from "./Hierarchy";
import Predicates from "./Predicates";
import RawDataViewer from "./RawDataViewer";
import { useCallback, useEffect, useMemo, useState } from "react";
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
import { emitPredicateRowUpdate, makeRowKey } from "./predicateMutationBus";
import { shortenIri, getObjectInputKind } from "../../../configuration/predicateConfig";

import {
  toHierarchyOptionsFromTriples,
  buildChildrenTreeFromTriples,
  buildSuperclassesTreeFromTriples,
  dedupePredicateGroups
} from "../../../parsers/hierarchies-parser";

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
  const [data, setData] = useState(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [jsonData, setJsonData] = useState(null);

  // SingleSearch options + selection
  const [hierarchyOptions, setHierarchyOptions] = useState({});
  const [selectedValue, setSelectedValue] = useState(null); // {id, label}

  // computed trees
  const [treeChildren, setTreeChildren] = useState([]);
  const [treeSuperclasses, setTreeSuperclasses] = useState([]);

  // predicates
  const [predicateGroups, setPredicateGroups] = useState([]);

  // feedback for inline predicate edits (add/edit/delete)
  const [mutationFeedback, setMutationFeedback] = useState(null); // { severity, message }

  // loading flags
  const [loadingHierarchies, setLoadingHierarchies] = useState(true);
  const [loadingPredicates, setLoadingPredicates] = useState(true);

  // Determine if we should show individual loaders or a single global loader
  const allSectionsLoading = pageLoading && loadingHierarchies && loadingPredicates;
  const hasAnyData = data !== null || !loadingHierarchies || !loadingPredicates;
  const showIndividualLoaders = hasAnyData && !allSectionsLoading;

  // debounced search (explicit deps to satisfy eslint)
  const debouncedFetchTerms = useMemo(
    () =>
      debounce(async (term, groupname) => {
        if (!term) {
          setData(null);
          setSelectedValue(null);
          setPageLoading(false);
          return;
        }
        try {
          const apiData = await getMatchTerms(groupname, term);
          const results = apiData?.results || [];
          const first = results?.[0] || null;

          // normalize first result -> { id, label }
          let id =
            first?.curie ||
            first?.ilx ||
            first?.id ||
            first?.termId ||
            first?.identifier ||
            null;
          let label =
            first?.label ||
            first?.rdfsLabel ||
            first?.prefLabel ||
            first?.term ||
            first?.name ||
            id;

          if (id) setSelectedValue({ id, label });
          setData(first);
        } finally {
          setPageLoading(false);
        }
      }, 300),
    []
  );

  const fetchJSONFile = useCallback(() => {
    if (!searchTerm) {
      setJsonData(null);
      return;
    }
    getRawData(group, searchTerm, "jsonld").then((rawResponse) => {
      setJsonData(rawResponse);
    });
  }, [searchTerm, group]);

  // normalize ID for API calls
  const toILX = (curieLike) => {
    let t = (curieLike || "").split("/").pop() || curieLike;
    return t.replace(/^ilx_/i, "ILX:");
  };

  // fetch both directions + compute trees + build options
  const fetchHierarchies = useCallback(async (curieLike, groupname) => {
    setLoadingHierarchies(true);
    try {
      const termId = toILX(curieLike);

      const [childRes, superRes] = await Promise.all([
        getTermHierarchies({ groupname, termId, objToSub: true }),
        getTermHierarchies({ groupname, termId, objToSub: false }),
      ]);

      const childTriples = childRes?.triples || [];
      const superTriples = superRes?.triples || [];

      // trees for the currently selected ID
      setTreeChildren(buildChildrenTreeFromTriples(childTriples, termId));
      setTreeSuperclasses(buildSuperclassesTreeFromTriples(superTriples, termId));

      // update SingleSearch options (union of both)
      const children = toHierarchyOptionsFromTriples(childTriples);
      const superclasses = toHierarchyOptionsFromTriples(superTriples);
      setHierarchyOptions({children: children, superclasses: superclasses});
      setLoadingHierarchies(false);
    } catch (e) {
      console.error("fetchHierarchies error:", e);
      setTreeChildren([]);
      setTreeSuperclasses([]);
      setHierarchyOptions([]);
      setLoadingHierarchies(false);
    }
  }, []);

  const fetchPredicates = useCallback(async (curieLike, groupname) => {
    setLoadingPredicates(true);
    try {
      const termId = toILX(curieLike);
      const groups = await getTermPredicates({ groupname, termId });
      setPredicateGroups(groups || []);
    } catch (e) {
      console.error("fetchPredicates error:", e);
      setLoadingPredicates(false);
    } finally {
      setLoadingPredicates(false);
    }
  }, []);

  // Live (head) term load. Skipped in version mode — a snapshot is loaded below.
  useEffect(() => {
    if (versionHash) return;
    setPageLoading(true);
    setLoadingHierarchies(true);
    setLoadingPredicates(true);
    debouncedFetchTerms(searchTerm, group);
    fetchJSONFile();
    return () => debouncedFetchTerms.cancel();
  }, [searchTerm, group, debouncedFetchTerms, fetchJSONFile, versionHash]);

  // Version mode: load a single term-version snapshot and feed it through the
  // same JSON-LD pipeline (Details/predicates/raw) the head view uses.
  useEffect(() => {
    if (!versionHash || !searchTerm) return;
    let active = true;
    setPageLoading(true);
    setLoadingPredicates(true);
    (async () => {
      try {
        // Borrow the live head @context (richer curie set) when reachable.
        let headContext;
        try {
          const head = await getRawData(group, searchTerm, "jsonld");
          headContext = head?.["@context"];
        } catch { /* fall back to the parser's default context */ }

        const snapshot = await getTermVersion(group, searchTerm, versionHash);
        if (!active) return;

        const jsonld = versionSnapshotToJsonLd(snapshot, versionHash, headContext);
        setJsonData(jsonld);

        const first = termParser(jsonld, searchTerm)?.results?.[0] || null;
        setData(first);
        const id = first?.id || searchTerm;
        setSelectedValue({ id, label: first?.label || searchTerm });
      } catch (e) {
        console.error("loadVersion error:", e);
        if (active) { setData(null); setJsonData(null); }
      } finally {
        if (active) { setPageLoading(false); setLoadingPredicates(false); }
      }
    })();
    return () => { active = false; };
  }, [versionHash, searchTerm, group]);

  useEffect(() => {
    if (selectedValue?.id) {
      fetchHierarchies(selectedValue.id, "base");
      // In version mode predicates come from the snapshot, not the live graph.
      if (!versionHash) fetchPredicates(selectedValue.id, "base");
    } else {
      setTreeChildren([]);
      setTreeSuperclasses([]);
      setPredicateGroups([]);
      setHierarchyOptions([]);
    }
  }, [selectedValue, fetchHierarchies, fetchPredicates, versionHash]);

  // Apply a single predicate triple add/edit/delete to the focus term and PATCH it.
  const handlePredicateMutation = useCallback(async (mutation) => {
    const patchId = (selectedValue?.id || searchTerm || "").split("/").pop();

    // Predicate groups are sourced from the "base" graph, so expand curies with
    // the base @context (the term's own group serializes a stripped context).
    // GET-first guarantees the exact predicate IRIs round-trip.
    const baseDoc = await getRawData("base", patchId, "jsonld");
    const context = baseDoc?.["@context"] || jsonData?.["@context"] || {};
    const node = focusNodeFromJsonLd(baseDoc) || focusNodeFromJsonLd(jsonData);
    const subject = mutation.subject || node?.["@id"];
    if (!subject) {
      setMutationFeedback({ severity: "error", message: "Could not resolve the term subject" });
      return;
    }
    // For edit/delete, match the exact stored object (whitespace/lang/datatype).
    const oldObject =
      mutation.op === "edit" || mutation.op === "delete"
        ? resolveStoredObject(node, mutation.predicate, mutation.oldValue)
        : null;
    const payload = buildTripleDiff(subject, { ...mutation, oldObject }, context);
    // For an edit, the affected row shows an in-row loader until we emit a
    // terminal (success/error) update keyed to it.
    const isEdit = mutation.op === "edit";
    const rowKey = isEdit
      ? makeRowKey(mutation.subject, mutation.predicate, mutation.oldValue)
      : null;
    try {
      // patchEndpointsIlx resolves on any 2xx (a 201 returns a bare version
      // hash, not JSON) and throws an AxiosError on 4xx/5xx. We don't track the
      // returned version id — a plain GET resolves the current head.
      await patchEndpointsIlx(group, patchId, { data: payload });
      setMutationFeedback({ severity: "success", message: "Change saved" });
      if (isEdit) {
        // Surgical update: refresh only the edited row so the rest of the
        // predicates section is left untouched (no spinner / accordion reset).
        emitPredicateRowUpdate({ rowKey, newValue: mutation.newValue, status: "success" });
      } else {
        // add/delete change the table structure -> full refetch.
        fetchJSONFile();
        debouncedFetchTerms(searchTerm, group);
        if (selectedValue?.id) fetchPredicates(selectedValue.id, group);
      }
    } catch (e) {
      console.error("handlePredicateMutation error:", e);
      const { message } = interpretPatchResult(e);
      setMutationFeedback({ severity: "error", message: message || "Could not save change" });
      // Clear the row loader and keep the original value (revert).
      if (isEdit) emitPredicateRowUpdate({ rowKey, status: "error" });
    }
  }, [jsonData, selectedValue, searchTerm, group, fetchJSONFile, fetchPredicates, debouncedFetchTerms]);

  const memoData = useMemo(() => data, [data]);

  // Normalize a predicate group's title + row predicates from full IRIs to curies.
  const shortenGroup = (g) => ({
    ...g,
    title: shortenIri(g.title),
    tableData: Array.isArray(g.tableData)
      ? g.tableData.map((r) => ({ ...r, predicate: shortenIri(r.predicate) }))
      : g.tableData,
  });

  // TODO(predicates-freshness): TEMPORARY WORKAROUND. The transitive-query
  // endpoint (getTermPredicates) does not reflect the term head right after a
  // PATCH, so edited literal predicates would still show the old value. Until
  // the backend serves head-consistent data from that endpoint, we override the
  // editable literal predicates with the fresh .jsonld (getRawData) below and
  // re-shorten the stripped full-IRI keys to curies. Once the backend is fixed,
  // delete freshGroups + the override merge and go back to:
  //   const predicates = dedupePredicateGroups(predicateGroups);
  // Focus-node predicates from the head-resolving .jsonld (fresh after a PATCH).
  const freshGroups = useMemo(() => {
    if (!jsonData) return [];
    const termId = selectedValue?.id ? toILX(selectedValue.id) : searchTerm;
    return buildPredicateGroupsForFocus(jsonData, termId).map(shortenGroup);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jsonData, selectedValue, searchTerm]);

  const predicates = useMemo(() => {
    // Version mode: every predicate group comes straight from the snapshot
    // JSON-LD (the post-PATCH freshness workaround below does not apply).
    if (versionHash) {
      if (!jsonData) return [];
      const termId = selectedValue?.id ? toILX(selectedValue.id) : searchTerm;
      // isAbout / owl:versionIRI are synthetic markers the snapshot parser adds
      // for termParser + Details; they are not real term predicates.
      const META_TITLES = new Set(["isabout", "ilx.isabout", "owl:versioniri"]);
      return dedupePredicateGroups(
        buildPredicateGroupsForFocus(jsonData, termId)
          .filter((g) => !META_TITLES.has(String(g.title || "").trim().toLowerCase()))
          .map(shortenGroup)
      );
    }

    const norm = (t) => String(t || "").trim().toLowerCase();

    // Editable literal predicates (synonym/definition/label) must reflect the
    // fresh .jsonld; the transitive-query endpoint lags after a PATCH.
    const freshLiteralTitles = new Set(
      freshGroups
        .filter((g) => getObjectInputKind(g.title) === "text")
        .map((g) => norm(g.title))
    );
    const freshLiterals = freshGroups.filter((g) => freshLiteralTitles.has(norm(g.title)));

    // Everything else (relations, inbound partOf, ids) stays on the transitive
    // source, minus the literal predicates we just refreshed.
    const transitive = (Array.isArray(predicateGroups) ? predicateGroups : [])
      .map(shortenGroup)
      .filter((g) => !freshLiteralTitles.has(norm(g.title)));

    return dedupePredicateGroups([...freshLiterals, ...transitive]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [freshGroups, predicateGroups]);

  return (
    <Box p="2.5rem 5rem" sx={{ overflow: "auto" }}>
      {isCodeViewVisible ? (
        <RawDataViewer dataId={searchTerm} dataFormat={selectedDataFormat} group={group} versionHash={versionHash} />
      ) : (
        <>
          {/* Show single global loader when all sections are loading */}
          {allSectionsLoading ? (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              <Details data={memoData} jsonData={jsonData} loading={showIndividualLoaders ? pageLoading : false} />
              <Box p="5rem 0">
                <Divider />
                <Grid container pt="5.25rem" spacing="2.75rem">
                  <Grid item xs={12} lg={4}>
                    <Hierarchy
                      options={hierarchyOptions}
                      selectedValue={selectedValue}
                      onSelect={setSelectedValue}
                      treeChildren={treeChildren}
                      treeSuperclasses={treeSuperclasses}
                      loading={showIndividualLoaders ? loadingHierarchies : false}
                    />
                  </Grid>
                  <Grid item xs={12} lg={8}>
                    <Predicates
                      data={predicates}
                      isGraphVisible={true}
                      loading={showIndividualLoaders ? loadingPredicates : false}
                      focusId={selectedValue?.id}
                      group={group}
                      onMutate={versionHash ? undefined : handlePredicateMutation}
                    />
                  </Grid>
                </Grid>
              </Box>
            </>
          )}
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
