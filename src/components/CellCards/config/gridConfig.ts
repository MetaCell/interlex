// Generic, data-driven display configuration for the CellCards grid.
// Kept outside the ontology (per design decision): predicate -> display label / tooltip,
// which predicates seed tiles vs facets, and the (currently hardcoded) ontology catalog.

// --- ontology catalog (stands in for the not-yet-built search backend) ------

export interface OntologyEntry {
  slug: string; // URL segment, e.g. "precision"
  label: string; // friendly search-result name (the header title comes from the file, not this)
  type: string; // shown as a result type chip + a header tag
  curie: string; // ontology file identity, shown under the search result (submittedBy)
  community: string; // owning community/organization, shown as the org breadcrumb crumb + tag
  curationStatus?: string; // e.g. "Curated" — badge shown next to the title
  description?: string;
  // neurdf root: cells are (transitively) subClassOf this; also shown as the header's curie tag.
  rootClass: string;
}

export const ONTOLOGY_CATALOG: Record<string, OntologyEntry> = {
  precision: {
    slug: "precision",
    label: "Precision Cells",
    type: "Cell ontology",
    curie: "NPOprecisionCellType",
    community: "Precision",
    curationStatus: "Curated",
    description: "HEAL-PRECISION neuron cell types (NPO).",
    rootClass: "ilxtr:NeuronPrecision",
  },
};

// The single hardcoded search result until an ontology search backend exists.
export const HARDCODED_RESULTS: OntologyEntry[] = [ONTOLOGY_CATALOG.precision];

// --- data source ------------------------------------------------------------

// The reasoned neurdf JSON-LD (requested with Accept: application/ld+json).
// ACAO:* on the endpoint lets the browser fetch it directly; the body is served as
// text/plain, so the service JSON.parses the text rather than trusting content-type.
export const NEURDF_URL =
  "https://uri.olympiangods.org/base/ontologies/dns/raw.githubusercontent.com/SciCrunch/NIF-Ontology/neurons/ttl/npo-merged-reasoned-neurdf.ttl";

// Optional same-origin dev fallback (served from /public) if the live endpoint is flaky.
export const NEURDF_FALLBACK_URL = "/data/npo-merged-neurdf.jsonld";

// --- predicate display metadata ---------------------------------------------

// local name (family-stripped) -> human label. Any predicate not listed falls back
// to its local name, so nothing is silently dropped ("render everything").
export const PREDICATE_LABELS: Record<string, string> = {
  neurondmBaseClass: "Cell class",
  hasInstanceInTaxon: "Species",
  hasSomaLocatedIn: "Soma location",
  hasCircuitRolePhenotype: "Circuit role",
  hasFunctionalPhenotype: "Physiology",
  hasAxonPhenotype: "Axon type",
  hasAdaptationPhenotype: "Adaptation",
  hasThresholdPhenotype: "Threshold",
  hasNeurotransmitterPhenotype: "Neurotransmitter",
  hasNucleicAcidExpressionPhenotype: "Marker genes",
  hasBiologicalSex: "Sex",
  hasMorphologicalPhenotype: "Morphology",
  source: "Source",
};

// Tooltip text sourced from pyontutils neuron_phenotype_edges.csv (displayDescription).
export const PREDICATE_TOOLTIPS: Record<string, string> = {
  hasInstanceInTaxon: "Species the cell type is observed in.",
  hasSomaLocatedIn: "Anatomical location of the cell body (soma).",
  hasFunctionalPhenotype: "Functional / physiological properties.",
  hasAxonPhenotype: "Axon fiber type.",
  hasNucleicAcidExpressionPhenotype: "Marker genes expressed by the cell type.",
  hasNeurotransmitterPhenotype: "Neurotransmitters the cell type produces or releases.",
  hasCircuitRolePhenotype: "Excitatory / inhibitory circuit role.",
  source: "Source publication for the cell type.",
};

export const labelFor = (localName: string): string =>
  PREDICATE_LABELS[localName] || localName;

// --- tile layout ------------------------------------------------------------

export type ChipTone = "class" | "subtype" | "species";

// Header chips (left→right), from the mockup: class + fiber/subtype + species.
export const TILE_HEADER_CHIPS: { localName: string; tone: ChipTone }[] = [
  { localName: "neurondmBaseClass", tone: "class" },
  { localName: "hasAxonPhenotype", tone: "subtype" },
  { localName: "hasInstanceInTaxon", tone: "species" },
];

export type RowRender = "text" | "chip";

// Ordered property rows shown on a tile (auto-hidden when empty).
export const TILE_ROWS: { localName: string; render: RowRender }[] = [
  { localName: "hasSomaLocatedIn", render: "text" },
  { localName: "hasNucleicAcidExpressionPhenotype", render: "chip" },
  { localName: "hasFunctionalPhenotype", render: "chip" },
];

// --- facets -----------------------------------------------------------------

// The properties actually shown on a tile: header chips + rows + the footer source.
// The "Displayed properties" toggle ON restricts facets to exactly these; OFF shows a
// facet for every property found on the terms. Derived from the tile config above so the
// two never drift apart.
export const DISPLAYED_PROPERTIES: string[] = [
  ...TILE_HEADER_CHIPS.map((c) => c.localName),
  ...TILE_ROWS.map((r) => r.localName),
  "source",
];

// External link target for a facet value / chip. All ref kinds resolve to their IRI;
// UBERON "internal view" mechanics are TBD (Tom), so link to the IRI for now.
export const linkFor = (iri?: string): string | undefined => iri || undefined;
