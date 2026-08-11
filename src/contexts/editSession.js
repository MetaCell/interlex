// Edit-session internals: the context object, the pending-mutation fold, and
// the consumer hook. Kept apart from the provider component so that file only
// exports components (fast refresh).
import { createContext, useContext } from "react";

export const norm = (v) => String(v ?? "").trim().toLowerCase();
export const samePredicate = (a, b) => norm(a) === norm(b);
// A pending entry with no subject targets the focus node, so it matches any
// focus-scoped lookup. Sections only ever ask about rows they already know sit
// on the focus term.
export const sameSubject = (a, b) => !a || !b || norm(a) === norm(b);
// Every entry records the term that was in focus when it was staged, so moving
// the hierarchy focus mid-session neither shows term A's edits on term B nor
// sends them to the wrong subject.
export const sameFocus = (a, b) => norm(a) === norm(b);

let entrySeq = 0;
const nextId = () => `pending-${++entrySeq}`;

// Fold one add/edit/delete into the pending list, collapsing it against what is
// already staged: editing a staged add rewrites that add, deleting a staged add
// drops it, editing a value back to its original removes the entry entirely.
export const stage = (list, mutation) => {
  const { subject, predicate, kind, op, focusId } = mutation;
  const matches = (e) =>
    samePredicate(e.predicate, predicate) &&
    sameSubject(e.subject, subject) &&
    sameFocus(e.focusId, focusId);

  if (op === "add") {
    if (!String(mutation.newValue ?? "").trim()) return list;
    return [
      ...list,
      { id: nextId(), focusId, subject, predicate, kind, op: "add", newValue: mutation.newValue },
    ];
  }

  const target = norm(mutation.oldValue);
  // The value the user acted on may itself be a staged one, so find it by what
  // is currently displayed (newValue), not by the original.
  const idx = list.findIndex(
    (e) => matches(e) && (e.op === "add" || e.op === "edit") && norm(e.newValue) === target
  );

  if (op === "edit") {
    if (idx >= 0) {
      const entry = list[idx];
      // Edited back to the value the term already has -> nothing to send.
      if (entry.op === "edit" && norm(mutation.newValue) === norm(entry.oldValue)) {
        return list.filter((_, i) => i !== idx);
      }
      const next = [...list];
      next[idx] = { ...entry, newValue: mutation.newValue };
      return next;
    }
    if (norm(mutation.newValue) === target) return list;
    return [
      ...list,
      {
        id: nextId(),
        focusId,
        subject,
        predicate,
        kind,
        op: "edit",
        oldValue: mutation.oldValue,
        newValue: mutation.newValue,
      },
    ];
  }

  // delete
  if (idx >= 0) {
    const entry = list[idx];
    if (entry.op === "add") return list.filter((_, i) => i !== idx);
    const next = [...list];
    next[idx] = {
      id: entry.id,
      focusId: entry.focusId,
      subject: entry.subject,
      predicate: entry.predicate,
      kind: entry.kind,
      op: "delete",
      oldValue: entry.oldValue,
    };
    return next;
  }
  return [
    ...list,
    { id: nextId(), focusId, subject, predicate, kind, op: "delete", oldValue: mutation.oldValue },
  ];
};

// Original values + pending, in display order: edits in place, deletes dropped,
// adds appended. `status` lets a section flag what changed.
export const resolveValues = (pending, predicate, values = [], subject, focusId) => {
  const entries = pending.filter(
    (e) =>
      samePredicate(e.predicate, predicate) &&
      sameSubject(e.subject, subject) &&
      sameFocus(e.focusId, focusId)
  );
  if (!entries.length) {
    return values.map((v) => ({ value: v, original: v, status: "clean" }));
  }
  const out = [];
  values.forEach((v) => {
    const edited = entries.find((e) => e.op === "edit" && norm(e.oldValue) === norm(v));
    if (edited) {
      out.push({ value: edited.newValue, original: v, status: "edited" });
      return;
    }
    if (entries.some((e) => e.op === "delete" && norm(e.oldValue) === norm(v))) return;
    out.push({ value: v, original: v, status: "clean" });
  });
  entries
    .filter((e) => e.op === "add")
    .forEach((e) => out.push({ value: e.newValue, original: null, status: "added" }));
  return out;
};

// patchEndpointsIlx rejects with the raw axios error on failure. Normalize to
// { ok, status, message }, digging the backend's message out of its HTML page.
export const interpretPatchResult = (res) => {
  const status = res?.status ?? res?.response?.status;
  const ok = status === 200 || status === 201;
  if (ok) return { ok, status, message: "" };

  const body = res?.response?.data ?? res?.data ?? res?.message ?? "";
  let message = typeof body === "string" ? body : JSON.stringify(body);
  const para = message.match(/<p>([\s\S]*?)<\/p>/i);
  message = (para ? para[1] : message.replace(/<[^>]*>/g, " "))
    .replace(/&#34;/g, '"').replace(/&quot;/g, '"').replace(/&amp;/g, "&")
    .replace(/\s+/g, " ").trim();
  if (!message) message = status ? `Request failed (HTTP ${status})` : "Request failed";
  return { ok, status, message };
};

export const EditSessionContext = createContext(null);

// Inert session, so components can call the hook unconditionally on screens
// that have no provider (version snapshots, non-term views).
const INERT = {
  available: false,
  isEditing: false,
  saving: false,
  pending: [],
  pendingCount: 0,
  startEdit: () => {},
  cancelEdit: () => {},
  save: async () => {},
  stageMutation: () => {},
  applyToValues: (_predicate, values = []) =>
    values.map((v) => ({ value: v, original: v, status: "clean" })),
  setFocus: () => {},
  registerReload: () => {},
};

export const useEditSession = () => useContext(EditSessionContext) || INERT;
