export const OBJECT = "object";
export const PREDICATE = "predicate";
export const SUBJECT = "subject";
export const ROOT = "root";

// fallback label for empty strings/undefined
const getName = (name) => (name && String(name).trim()) || "unknown";

// Build a single-root tree for a predicate group.
// Accepts groups shaped like:
// {
//   title: "<predicate label>",
//   count: number,
//   rows: [{subject, subjectId, object, objectId}],
//   values: same as rows (alias),
//   edges: [{from:{id,label}, to:{id,label}, predicate:{id,label}}]
// }
export const getGraphStructure = (pred) => {
  if (!pred) {
    return { name: "unknown", id: "unknown", type: ROOT, value: 0, children: [] };
  }

  // Prefer rows/values; fall back to edges.
  let rows = Array.isArray(pred.rows) && pred.rows.length ? pred.rows
           : Array.isArray(pred.values) && pred.values.length ? pred.values
           : [];

  if ((!rows || rows.length === 0) && Array.isArray(pred.edges)) {
    rows = pred.edges.map((e) => ({
      subject: e?.from?.label || e?.from?.id,
      subjectId: e?.from?.id || e?.from?.label,
      object: e?.to?.label || e?.to?.id,
      objectId: e?.to?.id || e?.to?.label,
    }));
  }

  if (!rows || rows.length === 0) {
    return { name: "unknown", id: "unknown", type: ROOT, value: 0, children: [] };
  }

  // Choose a single root subject: most frequent subject (by subjectId)
  const counts = new Map();
  const firstLabelById = new Map();
  for (const r of rows) {
    const key = r.subjectId || r.subject;
    if (!key) continue;
    counts.set(key, (counts.get(key) || 0) + 1);
    if (!firstLabelById.has(key)) firstLabelById.set(key, r.subject || r.subjectId);
  }
  let rootKey = null;
  let max = -1;
  for (const [k, v] of counts.entries()) {
    if (v > max) { max = v; rootKey = k; }
  }
  const rootLabel = getName(firstLabelById.get(rootKey) || rootKey);

  // Keep only rows for the chosen root
  const rowsForRoot = rows.filter(
    (r) => (r.subjectId || r.subject) === rootKey
  );

  // Predicate node (we’re already grouped by predicate)
  const predicateLabel = getName(pred.title || "predicate");
  const predicateId = pred.title || "predicate";

  // Unique objects under predicate
  const seenObjects = new Set();
  const objectChildren = [];
  for (const r of rowsForRoot) {
    const objKey = r.objectId || r.object;
    if (!objKey) continue;
    if (seenObjects.has(objKey)) continue;
    seenObjects.add(objKey);
    objectChildren.push({
      name: getName(r.object),
      id: objKey,
      type: OBJECT,
      children: [],
    });
  }

  // Root -> Predicate -> Objects
  const data = {
    name: rootLabel,
    id: rootKey,
    type: ROOT,
    value: rowsForRoot.length || pred.count || 0,
    children: [
      {
        name: predicateLabel,
        id: predicateId,
        type: PREDICATE,
        children: objectChildren,
      },
    ],
  };

  return data;
};
