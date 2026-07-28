// Data model for the CellCards ontology grid view.
// Kept generic so the parser works for any neurdf-lowered ontology, not just Precision.

export interface JsonLdRef {
  "@id": string;
}

export type GraphNode = Record<string, unknown> & {
  "@id"?: string;
  "@type"?: string | string[];
};

export interface OntologyGraph {
  "@context"?: Record<string, unknown>;
  "@graph": GraphNode[];
}

// Classifies where a referenced object lives, which drives how a facet value / chip links out.
export type RefKind =
  | "interlex"
  | "uberon"
  | "chebi"
  | "ncbigene"
  | "ncbitaxon"
  | "external"
  | "literal";

// A resolved value: an object reference (or literal) with a human label + link target.
export interface ResolvedRef {
  id: string; // the raw @id as it appears in the graph (curie or IRI), or the literal string
  curie: string; // compact form for display fallback
  label: string; // human label (resolved from the graph) or the literal / curie fallback
  iri: string; // full IRI to link out to ("" for literals)
  kind: RefKind;
}

export type PredicateFamily = "eqv" | "ent";

// One phenotype/annotation predicate on a cell, normalised by local name across neurdf families.
export interface CellProperty {
  localName: string; // e.g. "hasSomaLocatedIn"
  family: PredicateFamily; // eqv (asserted) preferred over ent (entailed)
  negated: boolean; // true when sourced from a neurdf.*.neg family
  values: ResolvedRef[];
}

// A single cell record rendered as a grid tile.
export interface CellTerm {
  id: string; // @id, e.g. "npokb:1067"
  curie: string; // display id, e.g. "npokb:1067"
  iri: string; // full IRI
  label: string; // ilxtr:localLabel -> rdfs:label -> curie
  rdfTypes: string[]; // rdf:type as curies, owl:* preferred (e.g. ["owl:Class"])
  definition?: string; // best available description (see DEFINITION_KEYS)
  definitionCurated?: boolean; // false when it is generated text rather than curated prose
  // Positive phenotypes keyed by local name (eqv ∪ ent, deduped).
  properties: Record<string, CellProperty>;
  // Negated phenotypes (neurdf.*.neg) keyed by local name — rendered with a "not" modifier.
  negated: Record<string, CellProperty>;
  sources: ResolvedRef[]; // ilxtr:literatureCitation (a cell may have several)
}

// One position of a class in the subClassOf hierarchy. A class with several parents is
// rendered under each of them, so `id` is the path that reached it (unique per position)
// while `termId` is the class itself (shared across its positions).
export interface HierarchyNode {
  id: string; // e.g. "ilxtr:NeuronPrecision/npokb:1075/npokb:1014"
  termId: string;
  label: string;
  curie: string;
  iri: string;
  children: HierarchyNode[];
}

export interface OntologyMeta {
  iri: string;
  title: string;
  description?: string;
  version?: string;
}

export interface ParsedOntology {
  meta: OntologyMeta;
  cells: CellTerm[];
  hierarchy: HierarchyNode[]; // roots of the subClassOf tree (the root class, when there is one)
}

// A filter facet built from the data values across all cells.
export interface FacetValue {
  key: string; // ResolvedRef.id — the stable value identity
  label: string;
  curie: string; // compact form, which is what decides where the value links to
  iri: string;
  kind: RefKind;
  count: number;
}

export interface Facet {
  localName: string;
  title: string;
  tooltip?: string;
  values: FacetValue[];
}
