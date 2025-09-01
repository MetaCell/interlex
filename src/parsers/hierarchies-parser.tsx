export const ILX_PART_OF = 'Is part of';
export const RDF_TYPE = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type';
export const OWL_OBJECT_PROPERTY = 'owl:ObjectProperty';

export const RDFS_LABEL = 'http://www.w3.org/2000/01/rdf-schema#label';
export const PART_OF_IRI = 'http://uri.interlex.org/base/ilx_0112785';

type NodeRef = { id: string; label: string };
type Edge = { from: NodeRef; to: NodeRef };

function firstString(v: any): string | undefined {
  if (!v) return undefined;
  if (typeof v === 'string') return v;
  if (Array.isArray(v)) {
    for (const x of v) {
      if (typeof x === 'string') return x;
      if (x && typeof x === 'object' && typeof x['@value'] === 'string') return x['@value'];
    }
  }
  if (typeof v === 'object' && typeof v['@value'] === 'string') return v['@value'];
  return undefined;
}

function ids(v: any): string[] {
  if (!v) return [];
  if (Array.isArray(v)) {
    return v.flatMap(ids);
  }
  if (typeof v === 'object' && typeof v['@id'] === 'string') {
    return [v['@id']];
  }
  if (typeof v === 'string') return [v];
  return [];
}

// http://uri.../ilx_0100573 -> ILX:0100573
export const toCurie = (id?: string) => {
  if (!id) return id;
  const m = id.match(/\/ilx_(\d+)$/i);
  return m ? `ILX:${m[1]}` : id;
};

export function jsonldToTriplesAndEdges(jsonld: any): { triples: Triple[]; edges: Edge[] } {
  const graph: any[] =
    Array.isArray(jsonld) ? jsonld :
    Array.isArray(jsonld?.['@graph']) ? jsonld['@graph'] :
    jsonld?.['@id'] ? [jsonld] : [];

  // Build id → label
  const labelById = new Map<string, string>();
  for (const n of graph) {
    const id = n['@id']; if (!id) continue;
    const lbl = firstString(n['rdfs:label']) ?? firstString(n['label']);
    if (lbl) labelById.set(id, lbl);
  }

  const triples: Triple[] = [];
  const edges: Edge[] = [];

  const addTriple = (s: string, p: string, oId?: string, oLabel?: string) => {
    const subj = { id: s, label: labelById.get(s) ?? s };
    const pred = { id: p, label: p };
    const obj  = oId ? { id: oId, label: labelById.get(oId) ?? oId } : { id: '', label: oLabel ?? '' };
    triples.push({ subject: subj, predicate: pred, object: obj });
  };

  for (const n of graph) {
    const s = n['@id']; if (!s) continue;

    // rdf:type
    for (const t of ids(n['@type'])) addTriple(s, RDF_TYPE, t);

    // rdfs:label
    const lbl = firstString(n['rdfs:label']) ?? firstString(n['label']);
    if (lbl) addTriple(s, RDFS_LABEL, undefined, lbl);

    // ilx.partOf in ALL its forms
    const partOfTargets = [
      ...ids(n['ilx.partOf']),   // compact (what your endpoint returns)
      ...ids(n['partOf']),       // generic compact
      ...ids(n[PART_OF_IRI])     // expanded IRI (just in case)
    ];
    for (const o of partOfTargets) {
      addTriple(s, PART_OF_IRI, o);
      edges.push({
        from: { id: s, label: labelById.get(s) ?? s },
        to:   { id: o, label: labelById.get(o) ?? o },
      });
    }
  }

  return { triples, edges };
}

// parsers/hierarchies-parser.tsx
export type Triple = {
  subject?: { id?: string; label?: string };
  predicate?: { id?: string; label?: string };
  object?: { id?: string; label?: string };
};

export type TreeItem = {
  id: string;              // must be unique per node instance in the tree
  label: string;
  iri: string;             // stable node identity (IRI), used to find the "current" item
  children?: TreeItem[];
};

// ---------- helpers ----------
const CURIE_BASE = "http://uri.interlex.org/base/";

const toIri = (idLike: string): string => {
  if (!idLike) return "";
  if (/^https?:\/\//i.test(idLike)) return idLike;
  // ILX:0100573 -> http://uri.interlex.org/base/ilx_0100573
  const m = idLike.match(/^ILX:(\d+)$/i);
  if (m) return `${CURIE_BASE}ilx_${m[1]}`;
  return idLike; // fallback
};

const labelOf = (iri: string, labelMap: Record<string, string>): string => {
  if (labelMap[iri]) return labelMap[iri];
  // friendly fallback label from tail
  try {
    const tail = iri.split("/").pop() || iri;
    return tail.replace(/^ilx_/i, "ILX:").toUpperCase();
  } catch {
    return iri;
  }
};

const isPartOf = (pred?: { id?: string; label?: string }) => {
  const s = (pred?.label || pred?.id || "").toLowerCase();
  // match ilx.partOf or anything that includes 'partof' robustly
  return s.includes("partof") || s.endsWith("0112785");
};

// Collect node labels from any triple (subject/object labels are present even when the
// predicate is not rdfs:label). This makes us resilient to the sample payloads.
const buildLabelMap = (triples: Triple[]) => {
  const map: Record<string, string> = {};
  for (const t of triples) {
    if (t.subject?.id) {
      if (t.subject.label) map[t.subject.id] = t.subject.label;
      else if (!map[t.subject.id]) map[t.subject.id] = t.subject.id;
    }
    if (t.object?.id) {
      if (t.object.label) map[t.object.id] = t.object.label;
      else if (!map[t.object.id]) map[t.object.id] = t.object.id;
    }
  }
  return map;
};

// Extract edges child -> parent
const extractEdges = (triples: Triple[]) => {
  const edges: Array<{ child: string; parent: string }> = [];
  for (const t of triples) {
    if (!isPartOf(t.predicate)) continue;
    const child = toIri(t.subject?.id || "");
    const parent = toIri(t.object?.id || "");
    if (child && parent) edges.push({ child, parent });
  }
  return edges;
};

// Ensure RichTreeView item ids are unique even when the same node appears in multiple branches.
// We derive a unique id from the path.
const makeItem = (iri: string, label: string, path: string[]): TreeItem => ({
  id: [...path, iri].join(" > "),  // path-based unique id
  label,
  iri,
});

// Depth-first build from a mapping
const buildFrom = (
  rootIri: string,
  childrenOf: Record<string, string[]>,
  labelMap: Record<string, string>,
  path: string[] = []
): TreeItem => {
  const item = makeItem(rootIri, labelOf(rootIri, labelMap), path);
  const kids = childrenOf[rootIri] || [];
  item.children = kids.map((kid) =>
    buildFrom(kid, childrenOf, labelMap, [...path, rootIri])
  );
  return item;
};

// Walk downwards but keep only branches that eventually reach `focusIri`.
const includesFocus = (
  iri: string,
  childrenOf: Record<string, string[]>,
  focusIri: string,
  memo = new Map<string, boolean>()
): boolean => {
  if (memo.has(iri)) return memo.get(iri)!;
  if (iri === focusIri) { memo.set(iri, true); return true; }
  const kids = childrenOf[iri] || [];
  const res = kids.some((k) => includesFocus(k, childrenOf, focusIri, memo));
  memo.set(iri, res);
  return res;
};

// ---------- API expected by OverView.jsx ----------

/**
 * Options for SingleSearch derived from the triples in a direction.
 * Returns [{ id, label }]
 */
export const toHierarchyOptionsFromTriples = (triples: Triple[] = []) => {
  const labelMap = buildLabelMap(triples);
  const ids = new Set<string>();
  for (const t of triples) {
    if (t.subject?.id) ids.add(toIri(t.subject.id));
    if (t.object?.id) ids.add(toIri(t.object.id));
  }
  const out = Array.from(ids).map((iri) => ({ id: iri, label: labelOf(iri, labelMap) }));
  // stable order: label asc
  out.sort((a, b) => a.label.localeCompare(b.label));
  return out;
};

/**
 * Build a tree where the selected focus is the ROOT and its descendants expand below.
 */
export const buildChildrenTreeFromTriples = (triples: Triple[] = [], focusIdLike: string) => {
  const focusIri = toIri(focusIdLike);
  const labelMap = buildLabelMap(triples);
  const edges = extractEdges(triples);

  // parent -> children mapping (for "children" view we want focus -> descendants)
  const childrenOf: Record<string, string[]> = {};
  for (const { child, parent } of edges) {
    if (!childrenOf[parent]) childrenOf[parent] = [];
    if (!childrenOf[parent].includes(child)) childrenOf[parent].push(child);
  }

  // If the focus has no entry in childrenOf, still create a solitary node
  if (!childrenOf[focusIri]) childrenOf[focusIri] = [];

  // Build the subtree only from the focus downwards:
  const pruneToFocus = (iri: string, seen = new Set<string>()) => {
    if (seen.has(iri)) return [] as string[]; // break cycles
    seen.add(iri);
    const kids = childrenOf[iri] || [];
    const list: string[] = [];
    for (const k of kids) {
      list.push(k);
      pruneToFocus(k, seen);
    }
    return list;
  };
  pruneToFocus(focusIri);

  return [buildFrom(focusIri, childrenOf, labelMap)];
};

/**
 * Build a tree of ANCESTORS only (selected focus at the BOTTOM).
 * We start at graph roots (nodes with no parents) and keep only branches that reach the focus.
 */
export const buildSuperclassesTreeFromTriples = (triples: Triple[] = [], focusIdLike: string) => {
  const focusIri = toIri(focusIdLike);
  const labelMap = buildLabelMap(triples);
  const edges = extractEdges(triples);

  // Build child->parents and parent->children
  const parentsOf: Record<string, string[]> = {};
  const childrenOf: Record<string, string[]> = {};

  const allNodes = new Set<string>();
  for (const { child, parent } of edges) {
    allNodes.add(child); allNodes.add(parent);
    if (!parentsOf[child]) parentsOf[child] = [];
    if (!parentsOf[child].includes(parent)) parentsOf[child].push(parent);

    if (!childrenOf[parent]) childrenOf[parent] = [];
    if (!childrenOf[parent].includes(child)) childrenOf[parent].push(child);
  }

  // Focus might not appear in edges (edge case). Still create a trivial leaf.
  allNodes.add(focusIri);

  // Keep only nodes on a path to focus
  const memo = new Map<string, boolean>();
  const onPathToFocus = (iri: string) => includesFocus(iri, childrenOf, focusIri, memo);

  // Roots: nodes with no parents in this subgraph
  const roots = Array.from(allNodes).filter((n) => (parentsOf[n] || []).length === 0);

  // Build filtered tree(s) from roots down, pruning branches that don't reach focus
  const buildFiltered = (iri: string, path: string[]): TreeItem | null => {
    if (!onPathToFocus(iri)) return null;
    const item = makeItem(iri, labelOf(iri, labelMap), path);
    const kids = (childrenOf[iri] || [])
      .map((k) => buildFiltered(k, [...path, iri]))
      .filter(Boolean) as TreeItem[];

    // In an ancestor tree, we want to stop exactly at the focus leaf (don’t expand its children)
    if (iri === focusIri) {
      item.children = [];
      return item;
    }

    item.children = kids;
    return item;
  };

  const forest = roots
    .map((r) => buildFiltered(r, []))
    .filter(Boolean) as TreeItem[];

  // If nothing reached the focus (degenerate), just render the focus as a single node
  if (!forest.length) {
    forest.push(makeItem(focusIri, labelOf(focusIri, labelMap), []));
  }
  return forest;
};

// --- add in OverView.jsx ---
const rowSig = (r = {}) => {
  const s = r.subjectId ?? r.subject ?? "";
  const p = r.predicate ?? "";               // some rows won’t have this; ok
  const o = r.objectId ?? r.object ?? "";
  return `${s}|${p}|${o}`;
};

const pickRowsArray = (g = {}) =>
  g.rows ?? g.values ?? g.tableData ?? g.edges ?? [];

export const dedupePredicateGroups = (groups = []) => {
  const byTitle = new Map();

  for (const g of groups.filter(Boolean)) {
    const key = String(g.title ?? "").trim().toLowerCase();
    if (!key) continue;

    if (!byTitle.has(key)) {
      // normalize count
      const base = { ...g };
      const rows = pickRowsArray(base);
      base.count = Array.isArray(rows) ? rows.length : (base.count ?? 0);
      byTitle.set(key, base);
      continue;
    }

    // merge with existing
    const cur = byTitle.get(key);
    const a = pickRowsArray(cur);
    const b = pickRowsArray(g);

    const seen = new Set(a.map(rowSig));
    const merged = [...a];
    for (const r of (Array.isArray(b) ? b : [])) {
      const sig = rowSig(r);
      if (!seen.has(sig)) {
        seen.add(sig);
        merged.push(r);
      }
    }

    // put merged rows back into whichever property exists
    if (cur.rows || g.rows) cur.rows = merged;
    else if (cur.values || g.values) cur.values = merged;
    else if (cur.tableData || g.tableData) cur.tableData = merged;
    else cur.edges = merged;

    cur.forceGraph = cur.forceGraph || g.forceGraph;
    cur.count = merged.length;

    byTitle.set(key, cur);
  }

  return Array.from(byTitle.values());
};
