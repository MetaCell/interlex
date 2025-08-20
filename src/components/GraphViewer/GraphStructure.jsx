export const OBJECT = "object";
export const PREDICATE = "predicate";
export const SUBJECT = "subject";
export const ROOT = "root";

// tiny helpers
const safe = (v, fallback = "unknown") => {
  if (v == null) return fallback;
  const s = String(v).trim();
  return s.length ? s : fallback;
};

// Normalize predicate group into a rows array:
// [{ subject, subjectId, object, objectId }]
function normalizeRows(pred) {
  if (!pred) return [];

  // 1) new shape from getTermHierarchies grouping
  if (Array.isArray(pred.rows) && pred.rows.length) return pred.rows;
  if (Array.isArray(pred.values) && pred.values.length) return pred.values;

  // 2) legacy tableData
  if (Array.isArray(pred.tableData) && pred.tableData.length) {
    return pred.tableData.map(r => ({
      subject: r.subject,
      subjectId: r.subject, // no id in legacy, use label
      object: r.object,
      objectId: r.object,
    }));
  }

  // 3) edges fallback
  if (Array.isArray(pred.edges) && pred.edges.length) {
    return pred.edges.map(e => ({
      subject: e?.from?.label || e?.from?.id,
      subjectId: e?.from?.id || e?.from?.label,
      object: e?.to?.label || e?.to?.id,
      objectId: e?.to?.id || e?.to?.label,
    }));
  }

  return [];
}

// Pick a root subject (most frequent). Fallback to first row.
function pickRoot(rows) {
  if (!rows.length) return { key: "unknown", label: "unknown" };
  const counts = new Map();
  const firstLabelById = new Map();
  for (const r of rows) {
    const id = r.subjectId || r.subject;
    if (!id) continue;
    counts.set(id, (counts.get(id) || 0) + 1);
    if (!firstLabelById.has(id)) firstLabelById.set(id, r.subject || r.subjectId || id);
  }
  let rootKey = null, max = -1;
  for (const [k, v] of counts.entries()) {
    if (v > max) { max = v; rootKey = k; }
  }
  if (!rootKey) {
    const r0 = rows[0];
    const id = r0.subjectId || r0.subject || "unknown";
    return { key: id, label: r0.subject || id };
  }
  return { key: rootKey, label: firstLabelById.get(rootKey) || rootKey };
}

// Build Root → Predicate → Unique Objects
export const getGraphStructure = (pred) => {
  const rows = normalizeRows(pred);
  if (!rows.length) {
    return { name: "No data", id: "no-data", type: ROOT, value: 0, children: [] };
  }

  const { key: rootKey, label: rootLabel } = pickRoot(rows);
  const forRoot = rows.filter(r => (r.subjectId || r.subject) === rootKey);

  const predicateLabel = safe(pred?.title, "predicate");
  const predicateId = predicateLabel;

  const seen = new Set();
  const objects = [];
  for (const r of forRoot) {
    const oid = r.objectId || r.object;
    if (!oid) continue;
    if (seen.has(oid)) continue;
    seen.add(oid);
    objects.push({
      name: safe(r.object),
      id: safe(oid),
      type: OBJECT,
      children: [],
    });
  }

  return {
    name: safe(rootLabel),
    id: safe(rootKey),
    type: ROOT,
    value: forRoot.length || pred?.count || 0,
    children: [
      {
        name: predicateLabel,
        id: predicateId,
        type: PREDICATE,
        children: objects,
      },
    ],
  };
};
