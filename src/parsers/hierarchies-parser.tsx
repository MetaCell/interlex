// constants
export const ILX_PART_OF = 'Is part of';
export const RDF_TYPE = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type';
export const OWL_OBJECT_PROPERTY = 'owl:ObjectProperty';

export const RDFS_LABEL = 'http://www.w3.org/2000/01/rdf-schema#label';
export const PART_OF_IRI = 'http://uri.interlex.org/base/ilx_0112785';

type NodeRef = { id: string; label: string };
type Triple = { subject: NodeRef; predicate: { id: string; label: string }; object: NodeRef };
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

// turn superclasses triples into SingleSearch options
export const toHierarchyOptionsFromTriples = (triples: any[] = []) => {
  const objectPropertySubjects = new Set(
    triples
      .filter(t => t?.predicate?.id === RDF_TYPE && t?.object?.id === OWL_OBJECT_PROPERTY)
      .map(t => t?.subject?.id)
      .filter(Boolean)
  );

  const seen = new Set<string>();
  const out: Array<{label: string; handler: string; id: String}> = [];

  const add = (node: any) => {
    const id = node?.id as string;
    const label = (node?.label || '').trim();
    if (!id || !label) return;
    const handler = toCurie(id) as string;
    seen.add(handler);
    out.push({ label, handler, id });
  };

  for (const t of triples) {
    // only harvest nodes that actually participate in the hierarchy relation somewhere
    if (t?.predicate?.label === RDF_TYPE && t?.subject?.label !== ILX_PART_OF) {
      if (t?.subject) add(t.subject);
    }
  }
  return out;
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