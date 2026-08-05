// Display configuration for the single-cell Cell Card.
//
// Deliberately data, not JSX: meeting 3 asked for the property rows *and* the relationship
// graph's predicates to be specified in config so curators can change what a widget shows
// without a component edit. Row *labels* are not here — they come from the ontology's own
// ilxtr:displayLabel (see parsePredicateDisplay), with gridConfig's PREDICATE_LABELS as the
// fallback; this file only decides which predicates appear, in what order, and how.

import type { RelationEdgeKind } from "../model/types";

// How a row renders its values: plain text (comma/or-joined) or one chip per value.
export type RowRender = "text" | "chip";

export interface CellCardRow {
  localName: string;
  render?: RowRender; // default "text"
  // Show the row with "not specified" when the predicate is absent, rather than hiding it.
  // The design's Biological Properties table keeps a fixed shape (Function / Adaptation /
  // Threshold all read "not specified" on npokb:998), so its rows are all required.
  required?: boolean;
}

// --- left column -------------------------------------------------------------

// §3.1 Biological Properties, in the design's order (Figma 9535:96273).
export const BIOLOGICAL_PROPERTY_ROWS: CellCardRow[] = [
  { localName: "hasInstanceInTaxon", required: true },
  { localName: "hasSomaLocatedIn", required: true },
  { localName: "neurondmBaseClass", required: true },
  { localName: "hasCircuitRolePhenotype", required: true },
  { localName: "hasFunctionalPhenotype", required: true },
  { localName: "hasAxonPhenotype", required: true },
  { localName: "hasAdaptationPhenotype", required: true },
  { localName: "hasThresholdPhenotype", required: true },
  { localName: "hasNeurotransmitterPhenotype", required: true },
  { localName: "hasNucleicAcidExpressionPhenotype", render: "chip", required: true },
];

// §3.3 Anatomical & Circuit Context (Figma 9239:67695). Soma location repeats here by design —
// it is the anchor for the anatomical reading, and Sue asked for it in both widgets.
export const ANATOMICAL_CONTEXT_ROWS: CellCardRow[] = [
  { localName: "hasSomaLocatedIn", required: true },
  { localName: "hasAxonSensorySubcellularElementIn", required: true },
  { localName: "hasAxonPresynapticElementIn", required: true },
  { localName: "hasCircuitRolePhenotype", required: true },
];

// --- centre column -----------------------------------------------------------

// Which predicates the relationship graph may draw, and as which edge type. Fahim: "what is
// shown in this graph needs to be specified in some sort of config … otherwise this graph
// could get very complex depending on the cell type." Adding a predicate here is the only way
// to get another edge kind into the graph.
export interface RelationPredicate {
  localName: string;
  kind: RelationEdgeKind;
  label: string; // the edge caption drawn on the connector
  // Which side of the current node the targets sit on. "down" = a rank below (children),
  // "up" = a rank above (parents), "left"/"right" = a satellite on the same rank.
  direction: "up" | "down" | "left" | "right";
}

export const RELATION_PREDICATES: RelationPredicate[] = [
  { localName: "hasSomaLocatedIn", kind: "somaLocation", label: "soma location", direction: "left" },
  {
    localName: "hasNucleicAcidExpressionPhenotype",
    kind: "expresses",
    label: "expresses",
    direction: "right",
  },
];

// Edge captions for the two structural relations, which come from the hierarchy and the
// mapping table rather than from a phenotype predicate.
export const SUBCLASS_EDGE_LABEL = "subclass of";
export const ASSERTED_SUBCLASS_EDGE_LABEL = "asserted subclass of";

// Legend rows, in the order the expanded dialog shows them (Figma 8917:35906).
export const RELATION_LEGEND: { kind: RelationEdgeKind; label: string }[] = [
  { kind: "subClassOf", label: "Sub class of" },
  { kind: "somaLocation", label: "Soma location" },
  { kind: "assertedSubClassOf", label: "Asserted Subclass of" },
  { kind: "expresses", label: "expresses" },
];

export const FLAGGED_FOOTNOTE = '* flagged "don\'t add" → proposed only';

// Marker genes are shown both in Biological Properties and as the Transcriptomic Profile's
// gene chips, so the widget reads the same predicate rather than duplicating the list.
export const MARKER_GENE_PREDICATE = "hasNucleicAcidExpressionPhenotype";

// --- conditional widgets -----------------------------------------------------

// Triples that would activate the deep-link widgets. None of these exist in the shipped
// ontology (verified: zero occurrences, and the `ilx:` prefix is not even in the @context),
// so the widgets render their "appears when the triple is added" state.
//
// These are the curator-facing *names*, shown in those "appears when … is added" notes. The data
// path is `cell.annotations.sparcTranscriptomicsLinks` / `.sparcMaps` / `.nervoSensusLinks`: the
// parser matches all three by local name under any prefix (LINK_ANNOTATIONS in neurdfParser), so
// the widget really does light up with no code change — a CURIE key looked up against
// `cell.properties`, which is keyed by bare local name, would never have matched anything.
export const SPARC_TRANSCRIPTOMICS_PREDICATE = "ilx:hasSPARCTranscriptomicsLink";
export const SPARC_MAP_PREDICATE = "ilx:hasSPARCMap";
export const NERVOSENSUS_PREDICATE = "ilx:hasNervoSensusLink";

// --- NervoSensus -------------------------------------------------------------

// NervoSensus is a single application, not a per-cell resource, so the Interactive Cell Grouping
// tile always has somewhere to point. `hasNervoSensusLink` (above) still wins when a curator
// supplies a per-cell URL; this is the default target.
export const NERVOSENSUS_URL = "https://nervosensus.netlify.app/";

// The app's own deep-link vocabulary, read from its source (and verified identical in the deployed
// build). The spec's "group by morphology · electrophysiology · markers" does not exist in it —
// these are the groupings it really implements, so the widget offers these instead. Raised with
// design rather than shipping links that land on the default view.
export const NERVOSENSUS_VIEWS: { label: string; params: Record<string, string> }[] = [
  { label: "axon type", params: { view: "synthesis", groupBy: "axon-species" } },
  { label: "species", params: { view: "synthesis", groupBy: "species-axon" } },
  { label: "source", params: { view: "synthesis", groupBy: "source" } },
  { label: "soma location", params: { view: "tree", grouping: "location" } },
];

// Ontology label keyword -> the app's filter value. Keyword matching because the labels are stable
// prose while the app wants short slugs; an unmatched label simply omits the filter, and the app
// ignores a value it has no option for, so both directions fail safe.
export const NERVOSENSUS_SPECIES: Record<string, string> = {
  "mus musculus": "mouse",
  "homo sapiens": "human",
  macaca: "macaque",
  "cavia porcellus": "guinea pig",
};

export const NERVOSENSUS_SOMA: Record<string, string> = {
  "dorsal root ganglion": "soma_drg",
  "trigeminal ganglion": "soma_tg",
};

// Ordered: the bare "type A" label must not shadow the more specific Aβ / Aδ forms, and object key
// order is insertion order, which is what matchLabel iterates.
export const NERVOSENSUS_AXON: Record<string, string> = {
  "(beta)": "fiber_a_beta",
  "aβ": "fiber_a_beta",
  "(delta)": "fiber_a_delta",
  "aδ": "fiber_a_delta",
  "type c": "fiber_c",
};

// --- header ------------------------------------------------------------------

// Type badges beside the title, left→right, with the tone each uses. `Purple` in the design has
// no palette equivalent, so nothing here maps to it — see EVIDENCE_TONE.
export const HEADER_BADGES: { localName: string; tone: "class" | "subtype" | "species" }[] = [
  { localName: "neurondmBaseClass", tone: "class" },
  { localName: "hasAxonPhenotype", tone: "subtype" },
  { localName: "hasCircuitRolePhenotype", tone: "subtype" },
  { localName: "hasInstanceInTaxon", tone: "species" },
];

// Chip colour per header tone, matching the grid tile so a cell looks the same in both views
// (CellTile.jsx CHIP_COLOR).
export const BADGE_COLOR: Record<string, "secondary" | "success" | "default"> = {
  class: "secondary",
  subtype: "success",
  species: "default",
};

// Cross-nomenclature evidence badge tones. The design uses Success / Warning / Purple; the
// theme has no purple, so "proposed" falls back to an outlined chip rather than inlining a hex
// at the call site. Raised with design rather than invented here.
export const EVIDENCE_TONE: Record<string, "success" | "warning" | "outlined"> = {
  described: "success",
  inferred: "warning",
  proposed: "outlined",
};

// Shown in place of a value when the predicate is absent (design: gray, italic).
export const NOT_SPECIFIED = "not specified";
