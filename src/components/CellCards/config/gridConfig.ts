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

const ontologySegment = (slug: string): string => `/ontology/${slug}`;

// Canonical route to an ontology tab, mirroring the breadcrumb hierarchy:
// /[organization]/ontology/[ontology slug](/[tab]).
export const ontologyPath = (entry: OntologyEntry, tab = ""): string =>
  `/${entry.org}${ontologySegment(entry.slug)}${tab ? `/${tab}` : ""}`;

// Route to a term page. A term read inside an ontology hangs off that ontology's path, so the URL
// carries the context the Cell Card resolves against — /[org]/ontology/[slug]/[term](/[tab]) — and
// the breadcrumb can name the ontology the user came through. Without a context ontology it is the
// plain /[group]/[term](/[tab]) an InterLex term has always had.
export const termPath = (
  group: string,
  ontologySlug: string | null | undefined,
  termSlug: string,
  tab = ""
): string =>
  `/${group}${ontologySlug ? ontologySegment(ontologySlug) : ""}/${termSlug}${tab ? `/${tab}` : ""}`;

// --- grid filter deep-links ---------------------------------------------------

// Facet pre-selections carried to the Grid View in the URL: one `filter=<localName>:<valueId>`
// param per checked value. The value id is a curie or IRI, so parsing splits on the FIRST colon.
export const GRID_FILTER_PARAM = "filter";

// The Grid View pre-filtered on one predicate — where a Cell Card property row's grid icon points
// (mappings.md §2.2, revised in meeting-3: the row text keeps opening the term URI, the icon
// returns to the grid filtered on that property).
export const gridFilterPath = (
  entry: OntologyEntry,
  localName: string,
  valueIds: string[]
): string => {
  const params = new URLSearchParams();
  valueIds.forEach((id) => params.append(GRID_FILTER_PARAM, `${localName}:${id}`));
  return `${ontologyPath(entry)}?${params.toString()}`;
};

// The grid page's inverse: URL search -> the filter sidebar's checked shape
// ({ [facetLocalName]: { [valueId]: true } }). Malformed params are dropped, not errors.
export const parseGridFilters = (
  search: string
): Record<string, Record<string, boolean>> => {
  const checked: Record<string, Record<string, boolean>> = {};
  for (const raw of new URLSearchParams(search).getAll(GRID_FILTER_PARAM)) {
    const i = raw.indexOf(":");
    if (i < 1 || i === raw.length - 1) continue;
    const localName = raw.slice(0, i);
    if (!checked[localName]) checked[localName] = {};
    checked[localName][raw.slice(i + 1)] = true;
  }
  return checked;
};

// The single hardcoded search result until an ontology search backend exists.
export const HARDCODED_RESULTS: OntologyEntry[] = [ONTOLOGY_CATALOG.precision];

// Context ontology assumed when a Cell Card is opened on a path that does not name one (a term
// reached from search rather than from the grid). With one entry in the catalog this is
// unambiguous; it becomes a real lookup once there are several.
export const DEFAULT_ONTOLOGY_SLUG = "precision";

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

// Does this slug address InterLex's record of an *external* term — the `dns/{host}/{path}`
// rewrite `termSlugForIri` produces? Such a term is by construction not one of a catalogued
// ontology's own cells, so pages can gate cell-only affordances (the Cell Card tab) on the URL
// alone, the same way `isIlxTermSlug` lets them.
export const isDnsTermSlug = (slug?: string): boolean => /^dns\//.test(slug || "");

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
//
// Predicate labels/tooltips, the tile layout and the facet configuration used to live here. They
// are field *mappings*, which `cellcard-spec/mappings.md` §1.1 asks to be configurable per
// ontology, so they now come from the runtime-fetched document — see `config/mappingsService` for
// the fetch and `config/mappingDefaults` for the built-in fallback and the readers.

// --- term links ---------------------------------------------------------------

// The host InterLex names its own records under. Anything else is an external authority.
const INTERLEX_HOST = "uri.interlex.org";

// The slug InterLex dereferences an IRI by (feedback, Tom): an InterLex-hosted IRI
// (`http://uri.interlex.org/{group}/{slug}`) already carries it; any other host is rewritten to
// InterLex's own record of the external term, `dns/{host}/{path}` —
// uri.interlex.org/base/dns/purl.obolibrary.org/obo/UBERON_… — so the reader is never sent to
// the external site itself. The rewrite applies only where the reference is *dereferenced*,
// never to display: labels and CURIEs keep rendering exactly what the ontology states.
// Undefined when the IRI yields no slug our routes can address: a non-http IRI, or an
// InterLex path with extra segments (readable `/uris/…` URIs).
export const termSlugForIri = (iri?: string): string | undefined => {
  if (!iri) return undefined;
  let url: URL;
  try {
    url = new URL(iri);
  } catch {
    return undefined;
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") return undefined;
  const path = url.pathname.replace(/^\/+|\/+$/g, "");
  if (url.host !== INTERLEX_HOST) return `dns/${url.host}/${path}`;
  // /{group}/{slug}: the IRI's own group is dropped — the caller links under the group the
  // reader is browsing, like every other termPath call.
  const segments = path.split("/");
  return segments.length === 2 ? segments[1] : undefined;
};

// A CURIE can name an addressable slug even when its IRI cannot (`npokb:1034` expands to the
// multi-segment http://uri.interlex.org/npo/uris/neurons/1034): an ILX/TMP id is an InterLex
// record by construction, and a prefix claimed by a catalogued ontology (npokb → precision) is
// addressable through that ontology. Any other prefix stays unaddressed — the IRI decides.
const slugFromCurie = (curie?: string): string | undefined => {
  const match = /^(ILX|TMP):(\d+)$/i.exec(curie || "");
  if (match) return `${match[1].toLowerCase()}_${match[2]}`;
  const slug = (curie || "").replace(":", "_");
  return ontologyForTermSlug(slug) ? slug : undefined;
};

// A DOI object is a literature citation, not a term: it keeps resolving to the publication.
const isDoiIri = (iri: string): boolean => {
  try {
    return /^(?:dx\.)?doi\.org$/i.test(new URL(iri).host);
  } catch {
    return false;
  }
};

// The context an InterLex term link carries: the group the page is read under and the context
// ontology to stay inside (feedback, Sue/Tom: navigating away from a Cell Card must keep the
// reader in the context ontology). Components resolve it with `useTermLinkContext`. External
// terms ignore it — they have one canonical /base/dns/… address.
export interface TermLinkContext {
  group?: string;
  ontologySlug?: string | null;
}

// Where a term opens (always a new tab). Never an external site (feedback, Tom: "they should
// never be taken directly to purl.obolibrary.org…"): an external term goes to InterLex's
// canonical record of it — the /base/dns/{host}/{path} form Tom specified, not the viewing
// group's ontology path — while an InterLex term goes to its own page under the context
// ontology when there is one. A literal, or an InterLex IRI our routes cannot address, falls
// back to plain text / its own (still InterLex-hosted) IRI.
export const termLink = (
  ref?: { curie?: string; iri?: string },
  context?: TermLinkContext
): string | undefined => {
  if (!ref) return undefined;
  const iri = ref.iri || "";
  if (isDoiIri(iri)) return iri;
  const slug = termSlugForIri(iri) || slugFromCurie(ref.curie);
  if (!slug) return iri || undefined;
  if (isDnsTermSlug(slug)) return termPath("base", null, slug);
  // A slug a catalogued ontology claims may be one of its cells, so its bare URL is left to
  // resolve to the term's own default tab (the Cell Card). Any other InterLex slug names
  // /overview outright: under an ontology path the bare URL would default to a Cell Card tab
  // the term does not have.
  const tab = ontologyForTermSlug(slug) ? "" : "overview";
  return termPath(context?.group || "base", context?.ontologySlug, slug, tab);
};
