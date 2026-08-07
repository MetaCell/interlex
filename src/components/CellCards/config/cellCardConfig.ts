// Non-mapping display configuration for the single-cell Cell Card: the copy and the integration
// details that are the same whatever ontology is being read.
//
// The *field mappings* — which predicate feeds which widget row, which predicates the relationship
// graph may draw, and what a row is labelled — used to live here too. Meeting 3 asked for them to
// be curator-editable, so they moved to the runtime-fetched mappings document: see
// `config/mappingsService` and `cellcard-spec/mappings.md` §2.

export const FLAGGED_FOOTNOTE = '* flagged "don\'t add" → proposed only';

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

// --- badges ------------------------------------------------------------------

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
