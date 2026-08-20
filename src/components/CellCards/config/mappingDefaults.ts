// The built-in mappings, and the pure helpers that read a mappings document.
//
// `DEFAULT_MAPPINGS` is what the app renders when the configuration file cannot be fetched — a
// missing bake, a bad `VITE_CELLCARD_MAPPINGS_URL`, an offline dev box. It deliberately mirrors
// the shipped `public/config/cell-card-mappings.json` rather than degrading to something derived
// from the data: a tile that silently swaps its three designed rows for "whatever this cell
// happens to carry" looks like a bug, and Biological Properties would lose the fixed shape its
// `required` rows exist to keep.
//
// Kept free of `import.meta.env` and of the fetch itself, so the pure consumers (the parser,
// widgetVisibility, buildRelationGraph, nervoSensusLink) can default to it and still run under
// plain node — `yarn check-parser` bundles them with esbuild, outside any browser.

import type {
  FieldSource,
  FieldSources,
  MappingRow,
  OntologyMappings,
  PredicateConfig,
} from "../model/mappings";
import { RELATION_EDGE_KINDS, SOURCE_PREDICATE } from "../model/mappings";

// --- predicate keys ----------------------------------------------------------

// A configured predicate as a local name. Regions are written in the CURIEs the spec and the
// ontology use (`ilxtr:hasSomaLocatedIn`, or the expanded IRI), while a `CellProperty` is keyed by
// the bare local name — the same reduction `parsePredicateDisplay` makes on the annotation nodes.
export const normalizePredicate = (key: string): string => {
  const local = String(key || "").trim().split(/[/#:]/).filter(Boolean).pop() || "";
  // The literature citation is lifted onto `CellTerm.sources` by the parser, and addressed as the
  // "source" pseudo-predicate everywhere downstream.
  return local === "literatureCitation" ? SOURCE_PREDICATE : local;
};

// --- reading a document ------------------------------------------------------

// A predicate's configured label, falling back to the bare local name so nothing is silently
// dropped. This is the last step everywhere a predicate needs a label — the tile, the facet
// sidebar and the Cell Card's rows all prefer the ontology's own `ilxtr:displayLabel` first (see
// `getFacets` and `CellTile`'s `labelFor`, and `buildRows.js`), and fall back to this.
export const predicateLabel = (mappings: OntologyMappings, localName: string): string =>
  mappings.predicates[localName]?.label || localName;

export const predicateTooltip = (
  mappings: OntologyMappings,
  localName: string
): string | undefined => mappings.predicates[localName]?.tooltip;

const pluck = (
  predicates: Record<string, PredicateConfig>,
  field: "label" | "tooltip"
): Record<string, string> => {
  const out: Record<string, string> = {};
  for (const [localName, config] of Object.entries(predicates)) {
    const value = config[field];
    if (value) out[localName] = value;
  }
  return out;
};

export const predicateLabels = (mappings: OntologyMappings): Record<string, string> =>
  pluck(mappings.predicates, "label");

export const predicateTooltips = (mappings: OntologyMappings): Record<string, string> =>
  pluck(mappings.predicates, "tooltip");

// The properties a tile actually shows: header chips + rows + the source footer. The facet
// sidebar's "Displayed properties" toggle restricts itself to exactly these, so it is derived from
// the tile region rather than listed twice — an explicit `filters.displayed` overrides it for a
// configuration that wants the two to differ.
export const displayedProperties = (mappings: OntologyMappings): string[] => {
  const { tile, filters } = mappings.regions;
  if (filters.displayed.length) return [...new Set(filters.displayed)];
  return [
    ...new Set([
      ...tile.headerChips.map((chip) => chip.localName),
      ...tile.rows.map((row) => row.localName),
      ...(tile.footer ? [tile.footer.localName] : []),
    ]),
  ];
};

export const isRelationEdgeKind = (kind: string): boolean =>
  (RELATION_EDGE_KINDS as string[]).includes(kind);

// --- the built-in fields -----------------------------------------------------

const exact = (...sources: string[]): FieldSource => ({ sources });

// Matched on the predicate's local name under any prefix. Only for fields whose predicate is not
// yet declared in the file's @context — see FieldSource.matchLocalName.
const anyPrefix = (...sources: string[]): FieldSource => ({ sources, matchLocalName: true });

export const DEFAULT_FIELD_SOURCES: FieldSources = {
  // Most-human-readable first, machine id last (spec §1.1: "if no localLabel, then rdfs:label").
  // `ilxtr:genLabel` is deliberately absent — it is the verbose machine-generated phenotype
  // string, usable as a description but never as a title.
  title: exact("ilxtr:localLabel", "rdfs:label", "dc:title", "dcterms:title"),
  // The first four are prose written by a curator; the last two are fallbacks so a term with none
  // of those is still described.
  description: exact(
    "definition",
    "skos:definition",
    "NIFRID:definition",
    "rdfs:comment",
    "ilxtr:genLabel",
    "ilxtr:curatorNote"
  ),
  curatedDescriptionSources: 4,

  cellType: exact("neurdf:Neuron"),
  parent: exact("rdfs:subClassOf"),

  literatureCitation: exact("ilxtr:literatureCitation"),
  dataCitation: exact("ilxtr:dataCitation"),
  atlasAnnotation: exact("ilxtr:atlasAnnotation"),
  curatorNote: exact("ilxtr:curatorNote"),
  alertNote: exact("ilxtr:alertNote"),
  temporaryId: exact("ilxtr:hasTemporaryId"),
  generatedLabel: exact("ilxtr:genLabel"),
  error: exact("ilxtr:error"),
  // Zero occurrences in the shipped graph, and the `ilx:` prefix is not even in its @context — so
  // these match on the local name and light up whichever prefix the curators end up writing.
  sparcTranscriptomicsLink: anyPrefix("ilx:hasSPARCTranscriptomicsLink"),
  sparcMap: anyPrefix("ilx:hasSPARCMap"),
  nervoSensusLink: anyPrefix("ilx:hasNervoSensusLink"),

  literalProperties: exact("ilxtr:neurondmBaseClass"),

  // Evidence is derived from the relation: an explicit description outranks an inferred mapping.
  // `proposed` waits on a curator "don't add" flag, which the shipped graph does not carry.
  crossNomenclature: {
    described: ["TEMP:assertedSubClassOf", "TEMP:subClassOf"],
    inferred: ["TEMP:mapsTo"],
    proposed: [],
  },

  predicateLabel: exact("ilxtr:displayLabel"),
  predicateDescription: exact("ilxtr:shortDefinition"),

  ontologyTitle: exact("dc:title", "dcterms:title", "rdfs:label", "skos:prefLabel"),
  ontologyDescription: exact("dc:description", "dcterms:description", "rdfs:comment"),
  ontologyVersion: exact("owl:versionInfo"),
  // TODO: confirm with the curators which annotation actually carries the Community hub link, and
  // whether it also carries the badge's display name (§4.1 wants "PRECISION Community Hub", not a
  // bare URL). Both spellings below are guesses: the spec names `ilxtr:developmentCommunity`, the
  // shipped graph carries MIRO's `development_community` — which points at the GitHub repository,
  // not at a community hub, so it may not be the intended source at all. Once the property is
  // settled, bind it here and drop `ontologyCommunityLinkFallback`, which exists only to give the
  // badge a destination while the question is open.
  // Neither prefix is guaranteed to be in a given file's @context, hence `anyPrefix`.
  ontologyCommunityLink: anyPrefix("ilxtr:developmentCommunity", "MIRO:development_community"),
  ontologyCommunityLinkFallback: "https://precision.scicrunch.org",

  missingValuePrefixes: ["TEMP:MISSING"],
};

// --- the built-in regions ----------------------------------------------------

// Tooltip text sourced from pyontutils neuron_phenotype_edges.csv (displayDescription).
const PREDICATES: Record<string, PredicateConfig> = {
  neurondmBaseClass: { label: "Cell class" },
  hasInstanceInTaxon: {
    label: "Species",
    tooltip: "Species the cell type is observed in.",
  },
  hasSomaLocatedIn: {
    label: "Soma location",
    tooltip: "Anatomical location of the cell body (soma).",
  },
  hasCircuitRolePhenotype: {
    label: "Circuit role",
    tooltip: "Excitatory / inhibitory circuit role.",
  },
  hasFunctionalPhenotype: {
    label: "Physiology",
    tooltip: "Functional / physiological properties.",
  },
  hasAxonPhenotype: { label: "Axon type", tooltip: "Axon fiber type." },
  hasAdaptationPhenotype: { label: "Adaptation" },
  hasThresholdPhenotype: { label: "Threshold" },
  hasNeurotransmitterPhenotype: {
    label: "Neurotransmitter",
    tooltip: "Neurotransmitters the cell type produces or releases.",
  },
  hasNucleicAcidExpressionPhenotype: {
    label: "Marker genes",
    tooltip: "Marker genes expressed by the cell type.",
  },
  hasBiologicalSex: { label: "Sex" },
  hasMorphologicalPhenotype: { label: "Morphology" },
  [SOURCE_PREDICATE]: {
    label: "Source",
    tooltip: "Source publication for the cell type.",
  },
};

// Every Biological Properties row is `required`, so the table keeps the fixed shape the design
// shows: Function / Adaptation / Threshold read "not specified" rather than disappearing.
const required = (localName: string, render?: MappingRow["render"]): MappingRow => ({
  localName,
  ...(render ? { render } : {}),
  required: true,
});

export const DEFAULT_MAPPINGS: OntologyMappings = {
  fields: DEFAULT_FIELD_SOURCES,
  predicates: PREDICATES,
  regions: {
    tile: {
      headerChips: [
        { localName: "neurondmBaseClass", tone: "class" },
        { localName: "hasAxonPhenotype", tone: "subtype" },
        { localName: "hasInstanceInTaxon", tone: "species" },
      ],
      rows: [
        { localName: "hasSomaLocatedIn", render: "text" },
        { localName: "hasNucleicAcidExpressionPhenotype", render: "chip" },
        { localName: "hasFunctionalPhenotype", render: "chip" },
      ],
      footer: { localName: SOURCE_PREDICATE },
    },
    filters: { minOptions: 2, displayed: [] },
    cellCard: {
      definition: {
        cellClass: "neurondmBaseClass",
        species: "hasInstanceInTaxon",
        somaLocation: "hasSomaLocatedIn",
        markerGenes: "hasNucleicAcidExpressionPhenotype",
        minPredicates: 2,
      },
      biologicalProperties: {
        rows: [
          required("hasInstanceInTaxon"),
          required("hasSomaLocatedIn"),
          required("neurondmBaseClass"),
          required("hasCircuitRolePhenotype"),
          required("hasFunctionalPhenotype"),
          required("hasAxonPhenotype"),
          required("hasAdaptationPhenotype"),
          required("hasThresholdPhenotype"),
          required("hasNeurotransmitterPhenotype"),
          required("hasNucleicAcidExpressionPhenotype", "chip"),
        ],
      },
      anatomicalContext: {
        rows: [
          required("hasSomaLocatedIn"),
          required("hasAxonSensorySubcellularElementIn"),
          required("hasAxonPresynapticElementIn"),
          required("hasCircuitRolePhenotype"),
        ],
      },
      relationshipGraph: {
        predicates: [
          {
            localName: "hasSomaLocatedIn",
            kind: "somaLocation",
            label: "soma location",
            direction: "left",
          },
          {
            localName: "hasNucleicAcidExpressionPhenotype",
            kind: "expresses",
            label: "expresses",
            direction: "right",
          },
        ],
        // In the order the expanded dialog shows them (Figma 8917:35906).
        legend: [
          { kind: "subClassOf", label: "Sub class of" },
          { kind: "somaLocation", label: "Soma location" },
          { kind: "assertedSubClassOf", label: "Asserted Subclass of" },
          { kind: "expresses", label: "expresses" },
        ],
        subClassOfLabel: "subclass of",
        assertedSubClassOfLabel: "asserted subclass of",
      },
      transcriptomicProfile: {
        markerGenePredicate: "hasNucleicAcidExpressionPhenotype",
      },
      cellGrouping: {
        axonPredicate: "hasAxonPhenotype",
      },
    },
  },
};
