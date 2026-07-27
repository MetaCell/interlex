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
  // Positive phenotypes keyed by local name (eqv ∪ ent, deduped).
  properties: Record<string, CellProperty>;
  // Negated phenotypes (neurdf.*.neg) keyed by local name — rendered with a "not" modifier.
  negated: Record<string, CellProperty>;
  sources: ResolvedRef[]; // ilxtr:literatureCitation (a cell may have several)
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
}

// A filter facet built from the data values across all cells.
export interface FacetValue {
  key: string; // ResolvedRef.id — the stable value identity
  label: string;
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
