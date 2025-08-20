// Minimal JSON-LD → { triples, edges } converter used by getTermHierarchies

export const RDF_TYPE  = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type';
export const RDFS_LABEL = 'http://www.w3.org/2000/01/rdf-schema#label';
export const PART_OF_IRI = 'http://uri.interlex.org/base/ilx_0112785';

type JsonLdNode = {
  '@id': string;
  '@type'?: string[] | string;
  [k: string]: any;
};

function firstString(o: any): string | undefined {
  if (o == null) return;
  if (typeof o === 'string') return o;
  if (Array.isArray(o)) return firstString(o[0]);
  if (typeof o === 'object') {
    if ('@value' in o) return String(o['@value']);
    if ('@id' in o) return String(o['@id']);
  }
}

function ids(objs: any): string[] {
  if (!objs) return [];
  const arr = Array.isArray(objs) ? objs : [objs];
  return arr.map(v => (typeof v === 'string' ? v : v?.['@id'])).filter(Boolean);
}

export type Triple = {
  subject: { id: string; label: string };
  predicate: { id: string; label: string };
  object: { id: string; label: string };
};

export type Edge = {
  from: { id: string; label: string };
  to:   { id: string; label: string };
};

export function jsonldToTriplesAndEdges(jsonld: any): { triples: Triple[]; edges: Edge[] } {
  const graph: JsonLdNode[] =
    Array.isArray(jsonld) ? jsonld :
    Array.isArray(jsonld?.['@graph']) ? jsonld['@graph'] :
    jsonld?.['@id'] ? [jsonld] : [];

  // id → label map (prefer rdfs:label)
  const labelById = new Map<string, string>();
  for (const n of graph) {
    const id = n['@id']; if (!id) continue;
    const lbl = firstString(n['label']) ?? firstString(n['rdfs:label']) ?? firstString(n[RDFS_LABEL]);
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
    const lbl = firstString(n['label']) ?? firstString(n['rdfs:label']) ?? firstString(n[RDFS_LABEL]);
    if (lbl) addTriple(s, RDFS_LABEL, undefined, lbl);

    // ilx.partOf (accept compact or expanded)
    for (const o of [...ids(n['partOf']), ...ids(n[PART_OF_IRI])]) {
      addTriple(s, PART_OF_IRI, o);
      edges.push({
        from: { id: s, label: labelById.get(s) ?? s },
        to:   { id: o, label: labelById.get(o) ?? o },
      });
    }
  }

  return { triples, edges };
}
