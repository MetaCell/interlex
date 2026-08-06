// Generic, data-driven display configuration for the CellCards grid.
// Kept outside the ontology (per design decision): predicate -> display label / tooltip,
// which predicates seed tiles vs facets, and the (currently hardcoded) ontology catalog.

// --- ontology catalog (stands in for the not-yet-built search backend) ------

export interface OntologyEntry {
  slug: string; // ontology URL segment, e.g. "precision"
  org: string; // owning organization's URL segment (the app's /:title org route)
  label: string; // friendly search-result name (the header title comes from the file, not this)
  type: string; // shown as a result type chip + a header tag
  curie: string; // ontology file identity, shown under the search result (submittedBy)
  community: string; // owning community/organization, shown as the org breadcrumb crumb + tag
  curationStatus?: string; // e.g. "Curated" — badge shown next to the title
  description?: string;
  // neurdf root: cells are (transitively) subClassOf this; also shown as the header's curie tag.
  rootClass: string;
  // CURIE prefixes this ontology names its own terms with. Part of its identity, so it belongs
  // here rather than as a regex at a call site: it is what lets a term page recognise, from the
  // slug alone and before anything is loaded, that this ontology is the only place the term can
  // come from (`npokb_997` -> precision). See `ontologyForTermSlug`.
  termPrefixes?: string[];
}

export const ONTOLOGY_CATALOG: Record<string, OntologyEntry> = {
  precision: {
    slug: "precision",
    org: "precision",
    label: "Precision Cells",
    type: "Cell ontology",
    curie: "NPOprecisionCellType",
    community: "Precision",
    curationStatus: "Curated",
    description: "HEAL-PRECISION neuron cell types (NPO).",
    rootClass: "ilxtr:NeuronPrecision",
    // All 161 Precision cells are npokb-only today. Drop this once they are ingested with ILX ids:
    // by then InterLex addresses them and the ontology stops being their only source.
    termPrefixes: ["npokb"],
  },
};

// Canonical route to an ontology tab, mirroring the breadcrumb hierarchy:
// /[organization]/ontology/[ontology slug](/[tab]).
export const ontologyPath = (entry: OntologyEntry, tab = ""): string =>
  `/${entry.org}/ontology/${entry.slug}${tab ? `/${tab}` : ""}`;

// The single hardcoded search result until an ontology search backend exists.
export const HARDCODED_RESULTS: OntologyEntry[] = [ONTOLOGY_CATALOG.precision];

// Context ontology assumed when a Cell Card is opened without an `?ontology=` param (a shared
// link, or a term reached from search rather than from the grid). With one entry in the
// catalog this is unambiguous; it becomes a real lookup once there are several.
export const DEFAULT_ONTOLOGY_SLUG = "precision";

// Query param carrying the context ontology across a term-page navigation. Distinct from
// DataContext.activeOntology, which is the *edit* target shown as a chip in the header.
export const ONTOLOGY_PARAM = "ontology";

// Which catalogued ontology declares the prefix this term slug carries — i.e. the ontology a term
// page can fall back to when nothing else names a context (a shared link, a search hit). Undefined
// for a slug no ontology claims, which is the signal not to load one at all: the ~16MB file must
// never be fetched on an ordinary InterLex term page.
export const ontologyForTermSlug = (slug?: string): string | undefined => {
  const prefix = String(slug || "")
    .match(/^([A-Za-z][A-Za-z0-9.-]*)[_:]/)?.[1]
    ?.toLowerCase();
  if (!prefix) return undefined;
  return Object.values(ONTOLOGY_CATALOG).find((entry) =>
    entry.termPrefixes?.some((p) => p.toLowerCase() === prefix)
  )?.slug;
};

// Does this term slug address an InterLex record *by construction* (`ilx_0101431`,
// `tmp_0381624`)? Anything else — a Precision cell's `npokb_991` — may still be addressable, but
// only once curation maps it, which is a backend question: see `termUriMappingPath` and
// `hasInterLexRecord`. Callers that gate term-API features (Overview, Variants, Version history,
// Discussions) want the latter; this is only its synchronous shortcut.
export const isIlxTermSlug = (slug?: string): boolean => /^(ilx|tmp)[_:]/i.test(slug || "");

// Backend route answering "is this external id mapped to an InterLex record?":
// `npokb_991` under `base` -> /base/uris/npokb/991, which 404s while unmapped. Split on the first
// separator so a compound id (`obo_UBERON_0000955`) keeps its own underscores. Returns undefined
// for a slug carrying no prefix, which the endpoint cannot address at all.
export const termUriMappingPath = (group: string, slug?: string): string | undefined => {
  const match = String(slug || "").match(/^([A-Za-z][A-Za-z0-9.-]*)[_:](.+)$/);
  return match ? `/${group}/uris/${match[1]}/${match[2]}` : undefined;
};

// --- ontology tabs ----------------------------------------------------------

export interface OntologyTab {
  label: string;
  path?: string; // route segment under /:org/ontology/:slug; absent = no view behind it yet
}

// The tabs from the design. Only the two carrying a `path` are built; the rest are rendered
// disabled so the bar matches the design without offering dead links.
export const ONTOLOGY_TABS: OntologyTab[] = [
  { label: "Grid View", path: "" },
  { label: "Browse", path: "browse" },
  { label: "Specification" },
  { label: "Overview" },
  { label: "Variants" },
  { label: "Version History" },
  { label: "Discussions" },
];

// --- data source ------------------------------------------------------------

// The reasoned neurdf JSON-LD, upstream (requested with Accept: application/ld+json).
// ACAO:* on the endpoint lets the browser fetch it directly; the body is served as
// text/plain, so the service JSON.parses the text rather than trusting content-type.
//
// NOTE: scripts/fetch-neurdf.mjs parses this constant to know what to download. Renaming it
// breaks that script loudly (by design) — update both together.
export const NEURDF_URL =
  "https://uri.olympiangods.org/base/ontologies/dns/raw.githubusercontent.com/SciCrunch/NIF-Ontology/neurons/ttl/npo-merged-reasoned-neurdf.ttl";

// Same-origin copy. In production the container's entrypoint downloads it into the served /data/
// directory shortly after start (deploy/fetch-neurdf-at-start.sh); locally, `yarn fetch-data` puts
// it in public/. It is not in the image, so it is **often absent** — during the first few tens of
// seconds of a container's life, or if the fetch failed, or in dev before anyone ran the script.
//
// Preferred when present, because upstream has no caching yet: ~9s for the 16MB body, flaky enough
// to need three retries, versus a local static GET nginx serves gzipped (1.3MB) with a long
// max-age. Absent, it 404s in milliseconds and the loader moves on to upstream — the same path the
// app used before any of this existed.
//
// Temporary shim: once the source server caches, delete this and PREFER_LOCAL_NEURDF along with
// the entrypoint script and the nginx /data/ location.
export const NEURDF_LOCAL_URL = "/data/npo-merged-neurdf.jsonld";

// Try the local copy first, then upstream. Set VITE_PREFER_LOCAL_NEURDF=false to invert this —
// useful in development when you want to verify against whatever the source is serving now.
export const PREFER_LOCAL_NEURDF =
  import.meta.env?.VITE_PREFER_LOCAL_NEURDF !== "false";

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

// --- term links ---------------------------------------------------------------

const OLS_BASE = "https://www.ebi.ac.uk/ols4";

// Curie prefix -> OLS ontology id, for the OBO-library ontologies referenced by these terms.
// A prefix that is absent is not an ontology OLS can show (NCBIGene is a sequence database,
// a DOI is a paper), so those keep their own IRI.
const OLS_ONTOLOGY_BY_PREFIX: Record<string, string> = {
  UBERON: "uberon",
  CHEBI: "chebi",
  NCBITaxon: "ncbitaxon",
};

// InterLex renders its own ILX terms; this is the app's route for one.
const interlexTermView = (curie: string): string | undefined => {
  const match = /^ILX:(\d+)$/i.exec(curie);
  // TODO point the group at the user's groupname once the API supports it — same TODO as
  // SingleTermView/OverView/Hierarchy.jsx.
  return match ? `/base/ilx_${match[1]}/overview` : undefined;
};

// Where a term opens (always a new tab), per the design decision: the internal view of the
// term when there is one, otherwise OLS for an ontology term we cannot render ourselves.
//
// Checked against the configured backend: `base/ilx_*` resolves, while `npokb`, `ilxtr` and
// `base/uberon_*` all answer 404. So an ILX term gets the internal view; an OBO term goes to
// OLS, because serving the internal view of an *external* term is still owed by the backend;
// and an InterLex-native term that is not an ILX id can only be named by its own IRI.
export const termLink = (ref?: {
  curie?: string;
  iri?: string;
}): string | undefined => {
  if (!ref) return undefined;
  const curie = ref.curie || "";
  const internal = interlexTermView(curie);
  if (internal) return internal;
  const ontology = OLS_ONTOLOGY_BY_PREFIX[curie.split(":")[0]];
  if (ontology) {
    // OLS addresses a class by its IRI, encoded twice because the id is a path segment.
    return ref.iri
      ? `${OLS_BASE}/ontologies/${ontology}/classes/${encodeURIComponent(encodeURIComponent(ref.iri))}`
      : `${OLS_BASE}/search?q=${encodeURIComponent(curie)}`;
  }
  return ref.iri || undefined;
};
