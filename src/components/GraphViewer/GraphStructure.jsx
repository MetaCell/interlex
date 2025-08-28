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

  // new shapes
  if (Array.isArray(pred.rows) && pred.rows.length) return pred.rows;
  if (Array.isArray(pred.values) && pred.values.length) return pred.values;

  // legacy tableData (strings only)
  if (Array.isArray(pred.tableData) && pred.tableData.length) {
    return pred.tableData.map((r) => ({
      subject: r.subject,
      subjectId: r.subject || r.subjectId,
      object: r.object,
      objectId: r.object || r.objectId,
    }));
  }

  // edges fallback
  if (Array.isArray(pred.edges) && pred.edges.length) {
    return pred.edges.map((e) => ({
      subject: (e?.from && (e.from.label || e.from.id)) || "unknown",
      subjectId: (e?.from && (e.from.id || e.from.label)) || "unknown",
      object: (e?.to && (e.to.label || e.to.id)) || "unknown",
      objectId: (e?.to && (e.to.id || e.to.label)) || "unknown",
    }));
  }

  return [];
}

/**
 * Behavior:
 * - If all rows share the same subject → keep old layout:
 *   Root(Subject) → Predicate → Unique Objects
 * - If multiple subjects → show all subjects:
 *   Root(Predicate) → Subject_1 → Objects
 *                     Subject_2 → Objects
 */
export const getGraphStructure = (pred) => {
  const rows = normalizeRows(pred);
  if (!rows.length) {
    return { name: "No data", id: "no-data", type: ROOT, value: 0, children: [] };
  }

  // Bucket rows by subject
  const subjMap = new Map(); // subjectId -> { label, rows[] }
  for (const r of rows) {
    const sid = safe(r.subjectId || r.subject);
    const slabel = safe(r.subject);
    if (!subjMap.has(sid)) subjMap.set(sid, { label: slabel, rows: [] });
    subjMap.get(sid).rows.push({
      subject: slabel,
      subjectId: sid,
      object: safe(r.object),
      objectId: safe(r.objectId || r.object),
    });
  }

  const uniqueSubjects = Array.from(subjMap.keys());
  const predicateLabel = safe(pred?.title, "predicate");
  const predicateId = predicateLabel;

  // SINGLE-SUBJECT layout (backwards-compatible)
  if (uniqueSubjects.length === 1) {
    const sid = uniqueSubjects[0];
    const bucket = subjMap.get(sid);
    const seen = new Set();
    const objects = [];
    for (const r of bucket.rows) {
      const oid = r.objectId;
      if (!oid || seen.has(oid)) continue;
      seen.add(oid);
      objects.push({ name: safe(r.object), id: oid, type: OBJECT, children: [] });
    }
    return {
      name: bucket.label,
      id: sid,
      type: ROOT,
      value: bucket.rows.length || pred?.count || 0,
      children: [
        { name: predicateLabel, id: predicateId, type: PREDICATE, children: objects },
      ],
    };
  }

  // MULTI-SUBJECT layout
  const subjectNodes = [];
  for (const sid of uniqueSubjects) {
    const bucket = subjMap.get(sid);
    const seen = new Set();
    const objects = [];
    for (const r of bucket.rows) {
      const oid = r.objectId;
      if (!oid || seen.has(oid)) continue;
      seen.add(oid);
      // ensure uniqueness under the predicate root
      objects.push({ name: safe(r.object), id: `${sid}::${oid}`, type: OBJECT, children: [] });
    }
    subjectNodes.push({
      name: bucket.label,
      id: sid,
      type: SUBJECT,
      value: bucket.rows.length,
      children: objects,
    });
  }

  return {
    name: predicateLabel,
    id: predicateId,
    type: ROOT,
    value: rows.length || pred?.count || 0,
    children: subjectNodes,
  };
};
