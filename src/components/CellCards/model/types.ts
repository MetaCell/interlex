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

// How multiple values on one predicate combine. neurdf encodes this in the family segment:
// `neurdf.eqv.uo:` is an owl:unionOf (soma is in A *or* B — one of them, not both), and
// `neurdf.eqv.io:` is an owl:intersectionOf (A *and* B). A plain family carries no
// combinator: its several values are independent assertions. Dropping this distinction would
// render "soma in A or B" identically to "soma in A and B", which are different claims.
export type ValueCombinator = "or" | "and";

// One phenotype/annotation predicate on a cell, normalised by local name across neurdf families.
export interface CellProperty {
  localName: string; // e.g. "hasSomaLocatedIn"
  family: PredicateFamily; // eqv (asserted) preferred over ent (entailed)
  negated: boolean; // true when sourced from a neurdf.*.neg family
  // Set only when every contributing key agreed on it; undefined for plain families or when
  // a union/intersection key was merged with a plain one (mixed semantics are not expressible).
  combinator?: ValueCombinator;
  values: ResolvedRef[];
}

// Cross-nomenclature relation types, derived from the *relation*, not a dedicated predicate:
// TEMP:assertedSubClassOf -> the source explicitly defines this cell type ("described"),
// TEMP:mapsTo -> a computational/logical mapping ("inferred"). A curator "don't add" flag
// would make it "proposed", but that modifier is not present in the shipped graph.
export type MappingEvidence = "described" | "inferred" | "proposed";

// One row of the Cross-Nomenclature Mapping table.
export interface CellMapping {
  ref: ResolvedRef; // the mapped cell (npokb record)
  evidence: MappingEvidence;
  source?: string; // parenthetical provenance carried in the mapped term's label, e.g. "Bhuiyan2024"
}

// Annotations that are not phenotypes: prose, ids, dataset pointers and deep links. Kept off
// `properties` so they can never leak into the grid's facets or tile rows (getFacets derives
// facets from `properties`), while still being available to the Cell Card.
//
// Only `atlasAnnotation` and `dataCitations` have a widget today. The rest are captured because
// the parse is the ontology→model seam and the fixture check pins them (checkParser.mjs), not
// because something renders them: `curatorNotes` is destined for the Discussions thread as
// system comments (spec §10.4), which is blocked on a service that 404s for every term id, and
// the three link fields are the widgets' forward-compatible path — see `fields.sparcMap` and its
// neighbours in model/mappings.ts, which match the predicate under any prefix.
export interface CellAnnotations {
  atlasAnnotation: string[]; // ilxtr:atlasAnnotation — Precision dataset annotation pills
  curatorNotes: string[]; // ilxtr:curatorNote — awaiting the Discussions wire-up (spec §10.4)
  alertNotes: string[]; // ilxtr:alertNote — no widget yet
  dataCitations: ResolvedRef[]; // ilxtr:dataCitation — e.g. a GEO accession
  temporaryId?: string; // ilxtr:hasTemporaryId — no widget yet
  generatedLabel?: string; // ilxtr:genLabel — the verbose phenotype string, no widget yet
  errors: string[]; // ilxtr:error — e.g. ilxtr:NeurdfLogicalFlattened, no widget yet
  // Deep links, matched by local name under any prefix (`ilx:` / `ilxtr:` / expanded IRI). Zero
  // occurrences in the shipped graph: the widgets that read them render their "appears when the
  // triple is added" state until the backend emits one.
  sparcTranscriptomicsLinks: ResolvedRef[]; // hasSPARCTranscriptomicsLink — SPARC Portal
  sparcMaps: ResolvedRef[]; // hasSPARCMap — the Anatomical Context row
  nervoSensusLinks: ResolvedRef[]; // hasNervoSensusLink — the Interactive Cell Grouping tile
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
  // Cross-nomenclature mappings (TEMP:assertedSubClassOf / TEMP:mapsTo / TEMP:subClassOf).
  mappings: CellMapping[];
  annotations: CellAnnotations;
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
  // Absolute IRI of the community that develops the ontology. Absent when the file asserts none,
  // which is what hides the header's "Community hub" link.
  communityLink?: string;
}

export interface ParsedOntology {
  meta: OntologyMeta;
  cells: CellTerm[];
  hierarchy: HierarchyNode[]; // roots of the subClassOf tree (the root class, when there is one)
  // Row labels / tooltips read from the ontology's own ilxtr:displayLabel + shortDefinition,
  // keyed by predicate local name. See parsePredicateDisplay.
  predicateDisplay: Record<string, PredicateDisplay>;
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

// --- Cell Card ---------------------------------------------------------------

// Display metadata for a predicate, read from the ontology itself: the 70 ilxtr:* property
// nodes carry ilxtr:displayLabel + ilxtr:shortDefinition, which cover 14 of the 15 neurdf
// local names used by Precision cells. The mappings document's `predicates` section is only the
// fallback for what the ontology omits.
export interface PredicateDisplay {
  localName: string;
  label: string;
  description?: string;
}

// One row of a Cell Card property widget, already resolved for rendering (see buildRows).
export interface PropertyRowModel {
  localName: string;
  label: string;
  tooltip?: string;
  prop?: CellProperty; // absent => the row renders "not specified"
  render?: "text" | "chip"; // carried through from the region's row entry
  required?: boolean; // keep the row (as "not specified") when the predicate is absent
}

// A node in the relationship graph, before layout.
export type RelationEdgeKind =
  | "subClassOf"
  | "assertedSubClassOf"
  | "somaLocation"
  | "expresses";

export interface RelationNode {
  id: string;
  label: string;
  subtitle?: string; // e.g. "npokb:998 · Bhuiyan2025"
  isCurrent: boolean;
  flagged?: boolean; // rendered with a "*" — proposed evidence only
  ref?: ResolvedRef; // link target when the node is navigable
}

export interface RelationEdge {
  from: string;
  to: string;
  kind: RelationEdgeKind;
  label: string;
  // Which side of the current node the target sits on, copied from the RelationPredicate that
  // produced the edge. Optional because the structural edges (subClassOf, assertedSubClassOf)
  // leave it unset and take dagre's ranks; RelationshipGraphSvg pins the "left"/"right" ones
  // itself, so dropping this field silently collapses every satellite onto a default rank.
  direction?: "up" | "down" | "left" | "right";
}

export interface RelationGraphModel {
  nodes: RelationNode[];
  edges: RelationEdge[];
}

// Publication metadata resolved from Europe PMC, or from CrossRef when Europe PMC does not index
// the work (the graph has none — citations are bare @id IRIs with no node), so every field is
// optional and the widget degrades to a bare link. `doi` and `pmid` are both present when the
// source knows both; at least one carries the link.
export interface Citation {
  doi: string;
  pmid: string;
  url: string;
  title?: string;
  authors?: string;
  journal?: string;
  year?: string;
  type?: string; // Europe PMC pubType ("Preprint") or CrossRef type ("posted-content")
}
