// Configuration for the Cell Cards views, in two parts.
//
// **fields** — the data model's own fields are fixed: a term always has a title, a description, an
// identifier, source publications, cross-nomenclature mappings. What a configuration changes is
// *which source* fills each one, as an ordered list with fallbacks — `cellcard-spec/mappings.md`
// §1.1 writes exactly that: "localLabel (title) | npokb ID → ilxtr:localLabel (if no localLabel,
// then rdfs:label)". Rebinding a field never changes `CellTerm`'s shape, only where its value came
// from, so every consumer downstream is unaffected.
//
// **regions** — which *additional* fields each region of the UI puts on screen: the grid tile's
// header chips, property rows and footer; the Cell Card's per-widget rows and graph edges. These
// are lists because the spec makes them the organisation's choice ("the organization can choose
// which header elements and property rows to display").
//
// Predicates are keyed by *local name* here (`hasSomaLocatedIn`), because that is how the parser
// keys a `CellProperty`. The JSON is written in CURIEs, which is how the spec and the ontology name
// them. `fields` is the exception: its sources stay in the form the graph writes them, since the
// order of `definition` vs `skos:definition` vs `NIFRID:definition` is the whole point of the list
// and all three share one local name.

import type { RelationEdgeKind } from "./types";

export type ChipTone = "class" | "subtype" | "species";
export type RowRender = "text" | "chip";

// --- fields: model field <- ordered sources ----------------------------------

/**
 * Where one model field's value comes from, best source first. The parser takes the first source
 * the node actually carries, which is what makes the list a fallback chain.
 *
 * `matchLocalName` relaxes the match to the predicate's local name under any prefix, for fields
 * whose predicate is not yet in the file's @context — the SPARC / NervoSensus deep links arrive
 * under `ilx:`, `ilxtr:` or an expanded IRI depending on who writes them. It is off by default
 * because most local names are not unique: `TEMP:subClassOf` and `rdfs:subClassOf` are different
 * relations that would collide.
 */
export interface FieldSource {
  sources: string[];
  matchLocalName?: boolean;
}

// Evidence type -> the relations that assert it. Cross-nomenclature evidence has no predicate of
// its own in the graph; it is derived from *which* relation made the link (spec §2.7).
export interface MappingEvidenceSources {
  described: string[];
  inferred: string[];
  proposed: string[];
}

export interface FieldSources {
  // Term identity and prose.
  title: FieldSource;
  description: FieldSource;
  // How many entries of `description.sources` count as curated prose. Anything past this is still
  // shown, but reported as uncurated so the UI can say where the text came from instead of passing
  // generated output off as a definition.
  curatedDescriptionSources: number;
  // The class marking a record as a cell (matched on @type), and the relation the hierarchy walks.
  cellType: FieldSource;
  parent: FieldSource;

  // Annotations that are not phenotypes. One model field each; see CellAnnotations.
  literatureCitation: FieldSource;
  dataCitation: FieldSource;
  atlasAnnotation: FieldSource;
  curatorNote: FieldSource;
  alertNote: FieldSource;
  temporaryId: FieldSource;
  generatedLabel: FieldSource;
  error: FieldSource;
  sparcTranscriptomicsLink: FieldSource;
  sparcMap: FieldSource;
  nervoSensusLink: FieldSource;

  // Literal-valued predicates lifted onto `properties`, so they are facetable and can fill a row.
  // (The `neurdf.*` phenotype families need no configuration: the model keys them by local name
  // whatever they are.)
  literalProperties: FieldSource;

  crossNomenclature: MappingEvidenceSources;

  // The annotations that carry a predicate's own display metadata, which is what lets an ontology
  // name its rows rather than the front end doing it.
  predicateLabel: FieldSource;
  predicateDescription: FieldSource;

  // The owl:Ontology node's header fields.
  ontologyTitle: FieldSource;
  ontologyDescription: FieldSource;
  ontologyVersion: FieldSource;
  // IRI-valued, unlike the three above: it names the community that develops the ontology, which
  // is where the header's "Community hub" link points.
  ontologyCommunityLink: FieldSource;
  // Where that link points when the ontology names no community of its own. Clearing it restores
  // the stricter reading — a file that asserts nothing gets no link.
  ontologyCommunityLinkFallback: string;

  // Placeholder object ids meaning "this phenotype is *not specified*". Not real terms, so they
  // must never surface as a value, a facet option or a tile chip. Matched as a prefix.
  missingValuePrefixes: string[];
}

// --- regions: which additional fields each part of the UI shows ---------------

// Label / tooltip for a predicate the ontology does not describe itself. The ontology's own
// `ilxtr:displayLabel` / `ilxtr:shortDefinition` win wherever they are consulted; this covers the
// rest — `neurondmBaseClass` and the source footer have no property node to carry an annotation.
export interface PredicateConfig {
  label?: string;
  tooltip?: string;
}

// A tile header chip: a predicate plus the palette tone its chips take.
export interface MappingChip {
  localName: string;
  tone: ChipTone;
}

// One property row of a tile or a Cell Card widget.
export interface MappingRow {
  localName: string;
  render?: RowRender;
  // Keep the row (reading "not specified") when the predicate is absent, instead of hiding it.
  required?: boolean;
  // Pins this row's label for this region only, ahead of every other source. The spec's tile rows
  // deliberately read differently from the same predicate's Cell Card row ("Physiology" against
  // the ontology's "Function"), and this is how a configuration says so.
  label?: string;
}

// A phenotype predicate the relationship graph may draw, and as which edge.
export interface MappingRelation {
  localName: string;
  kind: RelationEdgeKind;
  label: string; // the caption drawn on the connector
  // Which side of the current node the targets sit on. "down" = a rank below (children), "up" = a
  // rank above (parents), "left"/"right" = a satellite on the same rank.
  direction: "up" | "down" | "left" | "right";
}

// The edge kinds `RelationshipGraphSvg` knows how to draw. A configured relation naming anything
// else is dropped in normalisation: there is no stroke, dash or arrow marker for it, so drawing it
// would produce an invisible edge rather than a new one.
export const RELATION_EDGE_KINDS: RelationEdgeKind[] = [
  "subClassOf",
  "assertedSubClassOf",
  "somaLocation",
  "expresses",
];

export interface TileRegion {
  headerChips: MappingChip[];
  rows: MappingRow[];
  // The tile's source footer. Omit it to drop the footer entirely.
  footer?: { localName: string };
}

export interface FiltersRegion {
  // A facet offering fewer than this many distinct options can't narrow anything, so it is hidden.
  minOptions: number;
  // Which properties the "Displayed properties" toggle restricts the sidebar to. Empty means
  // "derive from the tile", which is the default and keeps the two from drifting apart.
  displayed: string[];
}

// The auto-generated description (spec §2.1): fixed sentence tokens, each bound to a predicate.
export interface DefinitionRegion {
  cellClass?: string;
  species?: string;
  somaLocation?: string;
  markerGenes?: string;
  // The banner is suppressed unless at least `minPredicates` of species/somaLocation/markerGenes
  // are populated on the cell, so it never renders a sentence with holes in it. `cellClass` is not
  // one of them: the sentence's subject falls back to "cell" and is never blank, so it cannot be
  // one of the holes this gate exists to catch. Counted straight off these bindings rather than a
  // separately configured list, so the gate can't drift from what the banner actually renders.
  minPredicates: number;
}

export interface RelationshipGraphRegion {
  predicates: MappingRelation[];
  legend: { kind: RelationEdgeKind; label: string }[];
  subClassOfLabel: string;
  assertedSubClassOfLabel: string;
}

export interface CellCardRegion {
  definition: DefinitionRegion;
  biologicalProperties: { rows: MappingRow[] };
  anatomicalContext: { rows: MappingRow[] };
  relationshipGraph: RelationshipGraphRegion;
  transcriptomicProfile: { markerGenePredicate: string };
  // The Interactive Cell Grouping widget's NervoSensus deep link reads its fiber-type filter from
  // here; its species/soma filters reuse `definition.species`/`somaLocation` directly, since both
  // features mean the same predicate.
  cellGrouping: { axonPredicate: string };
}

export interface MappingRegions {
  tile: TileRegion;
  filters: FiltersRegion;
  cellCard: CellCardRegion;
}

export interface OntologyMappings {
  fields: FieldSources;
  predicates: Record<string, PredicateConfig>;
  regions: MappingRegions;
}

// The pseudo-predicate the model uses for the literature citation: the parser lifts citations off
// `properties` onto `CellTerm.sources`, and the tile footer and the source facet address them under
// this name. A region may write either form.
export const SOURCE_PREDICATE = "source";
