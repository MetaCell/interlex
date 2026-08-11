// Edit session for a single term.
//
// A logged-in user turns edit mode on from the term header; every field that
// maps to a triple on the focus node then becomes editable. Nothing reaches the
// backend until Save: edits accumulate here as a list of pending mutations and
// leave as ONE triple-diff PATCH. Cancel throws the list away.
//
// The pending list is the single source of truth for "what the user changed",
// so the sections render `original data + pending` rather than local state of
// their own — which is what lets a synonym edited in Details show up edited in
// the Predicates table too.
import PropTypes from "prop-types";
import { useCallback, useContext, useMemo, useRef, useState } from "react";
import { Alert, Snackbar } from "@mui/material";
import { getRawData } from "../api/endpoints/apiService";
import { patchEndpointsIlx } from "../api/endpoints/interLexURIStructureAPI";
import { buildExpandContext } from "../configuration/predicateConfig";
import {
  buildTripleDiff,
  expandIri,
  focusNodeFromJsonLd,
  resolveStoredObject,
} from "../parsers/predicateMutations";
import { GlobalDataContext } from "./DataContext";
import {
  EditSessionContext,
  interpretPatchResult,
  resolveValues,
  stage,
} from "./editSession";

export const EditSessionProvider = ({ group, searchTerm, disabled = false, children }) => {
  const { user, curies } = useContext(GlobalDataContext);
  const [isEditing, setIsEditing] = useState(false);
  const [pending, setPending] = useState([]);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);
  // Focus term (hierarchy selection) and the section reload callback are
  // published by OverView, which owns those streams. Focus is state, not a ref:
  // the sections filter what they display by it.
  const [focusId, setFocusId] = useState(null);
  const reloadRef = useRef(null);

  const available = !!user && !disabled;

  const setFocus = useCallback((focus) => {
    setFocusId((current) => (focus?.id === current ? current : focus?.id || null));
  }, []);

  const registerReload = useCallback((fn) => {
    reloadRef.current = fn;
  }, []);

  const startEdit = useCallback(() => {
    setPending([]);
    setIsEditing(true);
  }, []);

  const cancelEdit = useCallback(() => {
    setPending([]);
    setIsEditing(false);
  }, []);

  const stageMutation = useCallback(
    (mutation) => {
      if (!mutation?.predicate || !mutation?.op) return;
      setPending((list) => stage(list, { ...mutation, focusId: focusId || searchTerm || null }));
    },
    [focusId, searchTerm]
  );

  const applyToValues = useCallback(
    (predicate, values, subject) =>
      resolveValues(pending, predicate, values, subject, focusId || searchTerm || null),
    [pending, focusId, searchTerm]
  );

  const save = useCallback(async () => {
    if (!pending.length) {
      setIsEditing(false);
      return;
    }
    setSaving(true);
    // Ids already committed, so a failure part-way through a multi-term save
    // doesn't leave applied changes staged for a second, duplicate PATCH.
    const committed = new Set();
    const dropCommitted = () => setPending((list) => list.filter((m) => !committed.has(m.id)));
    try {
      // A session normally targets one term, but the hierarchy can move the
      // focus mid-session, and a triple diff is per-term — so batch by the term
      // each change was staged against.
      const byTerm = new Map();
      pending.forEach((mutation) => {
        const patchId = String(mutation.focusId || searchTerm || "").split("/").pop();
        if (!byTerm.has(patchId)) byTerm.set(patchId, []);
        byTerm.get(patchId).push(mutation);
      });

      let tripleCount = 0;
      for (const [patchId, mutations] of byTerm) {
        // GET-first: the document being patched supplies the exact stored
        // subject and objects, so a `del` triple matches byte for byte. It has
        // to come from the group we are patching — a fork holds its own copy,
        // and base's would describe a different graph. (getRawData falls back
        // to base by itself when the group has no copy.)
        const doc = await getRawData(group, patchId, "jsonld");
        const jsonLdContext = doc?.["@context"] || {};
        // Predicates are base-graph terms, so `ilxr:` and friends MUST expand
        // against base. Two things push them off it for a logged-in user:
        // DataContext overwrites curies.base with that user's group curies, and
        // the served @context can carry the group namespace too — either one
        // yields ".../<group>/readable/synonym", which the endpoint rejects as
        // "bad predicate". So expand from the base curies (kept intact under
        // `curated`), and let those win over the document's own @context, which
        // stays underneath as the fallback for anything we don't know.
        const baseCuries = curies?.curated?.length ? curies.curated : (curies?.base ?? []);
        const context = { ...jsonLdContext, ...buildExpandContext(baseCuries) };
        const node = focusNodeFromJsonLd(doc);
        const focusSubject = node?.["@id"];

        const add = [];
        const del = [];
        for (const mutation of mutations) {
          const subject = mutation.subject || focusSubject;
          if (!subject) {
            dropCommitted();
            setFeedback({ severity: "error", message: "Could not resolve the term subject" });
            setSaving(false);
            return;
          }
          // The node keys the value is stored under are curies in a base
          // document but full IRIs in a fork's minimal context, so try both
          // spellings before falling back to a reconstructed object (which
          // loses any language tag or datatype on the stored literal).
          const expandedPredicate = expandIri(mutation.predicate, context);
          const oldObject =
            mutation.op === "edit" || mutation.op === "delete"
              ? resolveStoredObject(node, mutation.predicate, mutation.oldValue) ??
                resolveStoredObject(node, expandedPredicate, mutation.oldValue)
              : null;
          const diff = buildTripleDiff(subject, { ...mutation, oldObject }, context);
          add.push(...diff.add);
          del.push(...diff.del);
        }

        // One PATCH per term: the endpoint takes a triple diff, so everything
        // staged against that term lands (or fails) together.
        await patchEndpointsIlx(group, patchId, { data: { add, del } });
        mutations.forEach((m) => committed.add(m.id));
        tripleCount += add.length + del.length;
      }

      setPending([]);
      setIsEditing(false);
      setFeedback({
        severity: "success",
        message: tripleCount === 1 ? "Change saved" : "Changes saved",
      });
      await reloadRef.current?.();
    } catch (e) {
      console.error("saveEditSession error:", e);
      dropCommitted();
      const { message } = interpretPatchResult(e);
      setFeedback({ severity: "error", message: message || "Could not save changes" });
    } finally {
      setSaving(false);
    }
  }, [pending, searchTerm, curies, group]);

  const value = useMemo(
    () => ({
      available,
      isEditing: available && isEditing,
      saving,
      pending,
      pendingCount: pending.length,
      startEdit,
      cancelEdit,
      save,
      stageMutation,
      applyToValues,
      setFocus,
      registerReload,
    }),
    [
      available, isEditing, saving, pending, startEdit, cancelEdit, save,
      stageMutation, applyToValues, setFocus, registerReload,
    ]
  );

  return (
    <EditSessionContext.Provider value={value}>
      {children}
      <Snackbar
        open={!!feedback}
        autoHideDuration={feedback?.severity === "error" ? null : 4000}
        onClose={() => setFeedback(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        {feedback ? (
          <Alert
            onClose={() => setFeedback(null)}
            severity={feedback.severity}
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
            {feedback.message}
          </Alert>
        ) : undefined}
      </Snackbar>
    </EditSessionContext.Provider>
  );
};

EditSessionProvider.propTypes = {
  group: PropTypes.string,
  searchTerm: PropTypes.string,
  // Screens where editing makes no sense (a read-only version snapshot).
  disabled: PropTypes.bool,
  children: PropTypes.node,
};

export default EditSessionProvider;
