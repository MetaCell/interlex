// Generic, data-driven display configuration for the CellCards grid.
// Kept outside the ontology (per design decision): predicate -> display label / tooltip,
// which predicates seed tiles vs facets, and the (currently hardcoded) ontology catalog.

import { filterQuerySearch } from "../../../helpers/filterQuery";
import { API_CONFIG } from "../../../config";

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

// --- ontology catalog (stands in for the not-yet-built search backend) ------

export interface OntologyEntry {
  slug: string; // ontology URL segment, e.g. "precision"
  org: string; // owning organization's URL segment (the app's /:title org route)
  label: string; // friendly search-result name (the header title comes from the file, not this)
  type?: string; // shown as a result type chip + a header tag
  curie?: string; // ontology file identity, shown under the search result (submittedBy)
  community: string; // owning community/organization, shown as the org breadcrumb crumb + tag
  curationStatus?: string; // e.g. "Curated" — badge shown next to the title
  description?: string;
  // neurdf root: cells are (transitively) subClassOf this; also shown as the header's curie tag.
  // Absent when the document itself is the scope: every neuron in it is a cell.
  rootClass?: string;
  // The JSON-LD behind the ontology, and a same-origin copy tried first when there is one.
  dataUrl: string;
  localDataUrl?: string;
  // The URL an ontology without a route of its own was opened by: it is then addressed as
  // /ontology?url=…, and its terms open on their plain routes rather than under an ontology path.
  sourceUrl?: string;
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
    // All 161 Precision cells are npokb-only today. Drop this once they are ingested with ILX ids:
    // by then InterLex addresses them and the ontology stops being their only source.
    termPrefixes: ["npokb"],
    dataUrl: NEURDF_URL,
    localDataUrl: NEURDF_LOCAL_URL,
  },
};

// The JSON-LD is negotiated with `Accept: application/ld+json` on the ontology's own URL, never by
// swapping its extension: an external ontology's URL often carries one already (`ro.owl`), so the
// header is the only reliable way to ask for JSON-LD (backend guidance). The backend serves these
// cross-origin, and an extensionless path cannot go through the same-origin proxy, where it would
// hit the app's own routes.
const backendUrl = (path: string): string => `${API_CONFIG.OLYMPIAN_GODS}${path}`;

// Every other ontology is one a group keeps in InterLex, served at /{group}/ontologies/uris/{name}
// under the same name the app routes it by. Memoized because hooks key their effects on the
// entry, so the same ontology has to resolve to the same object on every render.
const groupOntologies = new Map<string, OntologyEntry>();

const groupOntologyEntry = (group: string, name: string): OntologyEntry => {
  const key = `${group}/${name}`;
  let entry = groupOntologies.get(key);
  if (!entry) {
    entry = {
      slug: name,
      org: group,
      label: name,
      community: group,
      dataUrl: backendUrl(`/${encodeURIComponent(group)}/ontologies/uris/${encodeURIComponent(name)}`),
    };
    groupOntologies.set(key, entry);
  }
  return entry;
};

// The hosts InterLex serves its own ontologies under: the identity host the IRIs name, and the
// backend the app reads them from.
const INTERLEX_ONTOLOGY_HOSTS = new Set(["uri.interlex.org", new URL(API_CONFIG.OLYMPIAN_GODS).host]);

const INTERLEX_ONTOLOGY_PATH = /^\/([^/]+)\/ontologies\/(.+)$/;
const GROUP_ONTOLOGY_NAME = /^uris\/([^/]+)$/;

// A group's ontology is listed by its spec URI (…/uris/{name}/spec), but the viewer reads the whole
// ontology at its identity. Only `uris/` paths are trimmed: a dns/ path is an external IRI, kept
// as it is.
const ontologyIdentityPath = (path: string): string =>
  path.startsWith("uris/") ? path.replace(/\/spec\/?$|\/$/, "") : path;

// Where InterLex serves the ontology a URL names. Its own ontologies are read from the backend at
// the same path, by identity or by spec URI (/{group}/ontologies/… and …/spec alike); any other
// URL is an external ontology, read from InterLex's record of it at /base/ontologies/dns/{host}/
// {path}, never from the external site. The path is kept verbatim — a trailing slash is part of
// the identity (`purl.org/dc/elements/1.1/`) — and a fragment is percent-encoded into it
// (`22-rdf-syntax-ns#` -> `22-rdf-syntax-ns%23`), as the backend addresses those ontologies.
// `URL.hash` is empty for a bare trailing "#", which is exactly how such an ontology is named.
const fragmentOf = (url: URL): string => {
  const at = url.href.indexOf("#");
  return at < 0 ? "" : url.href.slice(at);
};

const ontologyDataUrlFor = (url: URL): string | undefined => {
  if (INTERLEX_ONTOLOGY_HOSTS.has(url.host)) {
    const match = url.pathname.match(INTERLEX_ONTOLOGY_PATH);
    return match ? backendUrl(`/${match[1]}/ontologies/${ontologyIdentityPath(match[2])}`) : undefined;
  }
  return backendUrl(`/base/ontologies/dns/${url.host}${url.pathname}${encodeURIComponent(fragmentOf(url))}`);
};

const parseHttpUrl = (value?: string | null): URL | undefined => {
  try {
    const url = new URL(String(value || ""));
    return url.protocol === "http:" || url.protocol === "https:" ? url : undefined;
  } catch {
    return undefined;
  }
};

const urlOntologies = new Map<string, OntologyEntry>();

// The ontology a URL names, as the viewer opens it. One the app already routes resolves to that
// entry — a group's /uris/{name} ontology, or a catalogued one read from the same document — so it
// keeps its canonical page; anything else (an external ontology, a group's ontology kept under a
// nested path) gets an entry of its own, opened through /ontology?url=…. Undefined for a value
// that is not an http(s) URL of an ontology.
export const ontologyEntryForUrl = (value?: string | null): OntologyEntry | undefined => {
  const url = parseHttpUrl(value);
  const dataUrl = url && ontologyDataUrlFor(url);
  if (!url || !dataUrl) return undefined;

  const catalogued = Object.values(ONTOLOGY_CATALOG).find((entry) => entry.dataUrl === dataUrl);
  if (catalogued) return catalogued;

  const dataPath = new URL(dataUrl).pathname;
  const [, group, path] = dataPath.match(INTERLEX_ONTOLOGY_PATH) || [];
  const groupName = path?.match(GROUP_ONTOLOGY_NAME)?.[1];
  if (groupName) return groupOntologyEntry(decodeURIComponent(group), decodeURIComponent(groupName));

  let entry = urlOntologies.get(dataUrl);
  if (!entry) {
    const name = decodeURIComponent(dataPath.split("/").filter(Boolean).pop() || url.host);
    entry = {
      slug: name,
      org: decodeURIComponent(group),
      label: name,
      community: decodeURIComponent(group),
      dataUrl,
      sourceUrl: url.href,
    };
    urlOntologies.set(dataUrl, entry);
  }
  return entry;
};

// The ontology an /{group}/ontology/{slug} path names. A catalogued slug keeps its one page
// whatever group the path is read under, as it always has.
export const ontologyEntry = (group?: string, slug?: string): OntologyEntry | undefined => {
  if (!slug) return undefined;
  return ONTOLOGY_CATALOG[slug] || (group ? groupOntologyEntry(group, slug) : undefined);
};

const ontologySegment = (slug: string): string => `/ontology/${slug}`;

export const ONTOLOGY_URL_PARAM = "url";

// The route segment an ontology opened by URL lives under: /ontology(/[tab])?url=[ontology URL].
export const URL_ONTOLOGY_SEGMENT = "/ontology";

// Canonical route to an ontology tab, mirroring the breadcrumb hierarchy:
// /[organization]/ontology/[ontology slug](/[tab]), or /ontology(/[tab])?url=… for one opened by URL.
export const ontologyPath = (entry: OntologyEntry, tab = "", search = ""): string => {
  const tabSegment = tab ? `/${tab}` : "";
  if (!entry.sourceUrl) return `/${entry.org}${ontologySegment(entry.slug)}${tabSegment}${search}`;
  const params = new URLSearchParams(search);
  params.set(ONTOLOGY_URL_PARAM, entry.sourceUrl);
  return `${URL_ONTOLOGY_SEGMENT}${tabSegment}?${params}`;
};

// The ontology slug a term link carries to stay inside this ontology. Null for one opened by URL:
// no /[org]/ontology/[slug] route resolves it, so its terms open on their plain routes.
export const ontologyRouteSlug = (entry?: OntologyEntry | null): string | null =>
  entry && !entry.sourceUrl ? entry.slug : null;

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

// The Grid View's facet checks live in its URL (see filterQuery), keyed by facet localName, and a
// Cell Card row deep-links in through the same param. The Source facet travels the same way, its
// values being the cited DOIs (`filter=source:https://doi.org/10.…`).

// The Grid View pre-filtered on one predicate — where a Cell Card property row's grid icon points
// (mappings.md §2.2, revised in meeting-3: the row text keeps opening the term URI, the icon
// returns to the grid filtered on that property).
export const gridFilterPath = (
  entry: OntologyEntry,
  localName: string,
  valueIds: string[]
): string =>
  ontologyPath(
    entry,
    "",
    filterQuerySearch("", {
      [localName]: Object.fromEntries(valueIds.map((id) => [id, true])),
    })
  );

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
// A just-created ontology lands here: it has no terms yet, so its header is all there is to see.
export const SPECIFICATION_TAB = "specification";

export const ONTOLOGY_TABS: OntologyTab[] = [
  { label: "Grid View", path: "" },
  { label: "Browse", path: "browse" },
  { label: "Specification", path: SPECIFICATION_TAB },
  { label: "Overview" },
  { label: "Variants" },
  { label: "Version History" },
  { label: "Discussions" },
];

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

// The ontology identity IRI ({group}/ontologies/uris/{name}) has an in-app route of its own.
const ONTOLOGY_IDENTITY_PATH = /^\/[^/]+\/ontologies\/uris\/[^/]+$/;

// Where an InterLex IRI no term route addresses opens. Never the IRI itself (feedback, Tom): the
// uri.interlex.org host may serve another InterLex implementation, so following the identifier
// would take the reader out of this app. Readable predicates, npo/uris/… and the like have no page
// here and render as text.
const unaddressedInterLexPath = (url: URL): string | undefined => {
  const path = url.pathname.replace(/\/+$/, "");
  return ONTOLOGY_IDENTITY_PATH.test(path) ? path : undefined;
};

const interLexUrl = (iri: string): URL | undefined => {
  try {
    const url = new URL(iri);
    return url.host === INTERLEX_HOST ? url : undefined;
  } catch {
    return undefined;
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
// ontology when there is one. A literal, or an InterLex IRI our routes cannot address, renders
// as plain text.
export const termLink = (
  ref?: { curie?: string; iri?: string },
  context?: TermLinkContext
): string | undefined => {
  if (!ref) return undefined;
  const iri = ref.iri || "";
  if (isDoiIri(iri)) return iri;
  const slug = termSlugForIri(iri) || slugFromCurie(ref.curie);
  if (!slug) {
    const url = interLexUrl(iri);
    return url ? unaddressedInterLexPath(url) : iri || undefined;
  }
  if (isDnsTermSlug(slug)) return termPath("base", null, slug);
  // A slug a catalogued ontology claims may be one of its cells, so its bare URL is left to
  // resolve to the term's own default tab (the Cell Card). Any other InterLex slug names
  // /overview outright: under an ontology path the bare URL would default to a Cell Card tab
  // the term does not have.
  const tab = ontologyForTermSlug(slug) ? "" : "overview";
  return termPath(context?.group || "base", context?.ontologySlug, slug, tab);
};

// Where a raw IRI opens on the term page. Only an InterLex IRI is rewritten into this app; any
// other keeps its own address, unlike termLink's dns/ rewrite for Cell Cards: here an object is
// as often a page in its own right (braininfo, Wikipedia, a query string and all) as a term.
export const iriLink = (iri: string, context?: TermLinkContext): string | undefined =>
  interLexUrl(iri) ? termLink({ iri }, context) : iri;
