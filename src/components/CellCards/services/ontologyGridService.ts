// Service seam for the CellCards grid: fetches the neurdf JSON-LD once, parses it
// generically, and exposes cells + data-driven facets. Swap the fetch for a real
// API later without touching the components (they depend only on this contract).

import { parseNeurdf, buildFacets } from "../../../parsers/neurdfParser";
import {
  NEURDF_URL,
  NEURDF_LOCAL_URL,
  PREFER_LOCAL_NEURDF,
  ONTOLOGY_CATALOG,
} from "../config/gridConfig";
import { loadMappings } from "../config/mappingsService";
import { DEFAULT_MAPPINGS } from "../config/mappingDefaults";
import { publishMappings } from "../config/mappingsAtom";
import {
  displayedProperties,
  predicateLabels,
  predicateTooltips,
} from "../config/mappingDefaults";
import type {
  OntologyGraph,
  ParsedOntology,
  Facet,
  CellTerm,
  HierarchyNode,
  ResolvedRef,
} from "../model/types";
import type { FieldSources, OntologyMappings } from "../model/mappings";
import { SOURCE_PREDICATE } from "../model/mappings";
import type { OntologyEntry } from "../config/gridConfig";

export interface LoadedOntology {
  entry: OntologyEntry;
  meta: ParsedOntology["meta"];
  cells: CellTerm[];
  hierarchy: HierarchyNode[];
  predicateDisplay: ParsedOntology["predicateDisplay"];
  // Which predicate feeds which tile row / widget row / graph edge, fetched alongside the graph
  // so a view never renders before it knows what to show. See config/mappingsService.
  mappings: OntologyMappings;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// The endpoint is flaky on the ~16MB body — retry, then fall back to a served copy.
const fetchGraph = async (url: string): Promise<OntologyGraph> => {
  const res = await fetch(url, {
    headers: { Accept: "application/ld+json" },
    credentials: "omit",
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} fetching ${url}`);
  const text = await res.text(); // body is served as text/plain — parse manually
  if (text.trimStart().startsWith("<")) {
    // A missing SPA path answers with index.html (HTTP 200), not JSON-LD.
    throw new Error(`Expected JSON-LD but received HTML from ${url}`);
  }
  let data: OntologyGraph;
  try {
    data = JSON.parse(text) as OntologyGraph;
  } catch {
    throw new Error(`Malformed JSON-LD from ${url}`);
  }
  if (!data || !Array.isArray(data["@graph"]) || data["@graph"].length === 0) {
    throw new Error("Empty or malformed neurdf graph");
  }
  return data;
};

const LIVE_RETRIES = 3;

// Upstream is slow and flaky on the 16MB body, so it gets retries with backoff. The baked
// same-origin copy is a static file — it either exists or it does not, and retrying a 404 just
// delays the real attempt.
const fetchLocal = () => fetchGraph(NEURDF_LOCAL_URL);

const fetchUpstream = async (): Promise<OntologyGraph> => {
  let lastErr: unknown;
  for (let i = 0; i < LIVE_RETRIES; i++) {
    try {
      return await fetchGraph(NEURDF_URL);
    } catch (err) {
      lastErr = err;
      if (i < LIVE_RETRIES - 1) await sleep(600 * (i + 1));
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error("Failed to load ontology data");
};

const loadGraphWithRetry = async (): Promise<OntologyGraph> => {
  // Preferred source first (the baked copy in production), the other as the safety net, so a
  // missing bake or a down upstream still leaves the page working.
  const [primary, secondary] = PREFER_LOCAL_NEURDF
    ? [fetchLocal, fetchUpstream]
    : [fetchUpstream, fetchLocal];

  let primaryErr: unknown;
  try {
    return await primary();
  } catch (err) {
    primaryErr = err;
  }
  try {
    return await secondary();
  } catch {
    // Report the *preferred* source's error: it is the one an operator needs to fix, and the
    // secondary's error is usually just "404, no bake in this image".
  }
  throw primaryErr instanceof Error ? primaryErr : new Error("Failed to load ontology data");
};

// Fetch + JSON.parse only once per session.
let graphPromise: Promise<OntologyGraph> | null = null;
const getGraph = (): Promise<OntologyGraph> => {
  if (!graphPromise) {
    graphPromise = loadGraphWithRetry().catch((err) => {
      graphPromise = null; // allow retry on next mount after a failure
      throw err;
    });
  }
  return graphPromise;
};

// Parsed result cache, keyed by ontology slug (the parse depends on the root class *and* on the
// field sources, so the sources it was produced with are kept alongside it). Split from the
// composed result below so that a mappings fetch which failed on the first load is retried on the
// next navigation, and only re-parses if the retry actually changed where a field reads from.
const parsedCache = new Map<string, { fields: FieldSources; parsed: ParsedOntology }>();
const loadedCache = new Map<string, LoadedOntology>();

export const loadOntology = async (slug: string): Promise<LoadedOntology> => {
  const entry = ONTOLOGY_CATALOG[slug];
  if (!entry) throw new Error(`Unknown ontology "${slug}"`);

  // Cheap and separately cached: resolved config comes back by identity, so an unchanged config
  // hands back the very same LoadedOntology and the grid keeps its filter state.
  const mappings = await loadMappings(slug);
  // Published here rather than from an effect, so the components rendered from the result below
  // never see one frame of the built-in configuration first.
  publishMappings(mappings);
  const cached = loadedCache.get(slug);
  if (cached && cached.mappings === mappings) return cached;

  let entryParse = parsedCache.get(slug);
  if (entryParse?.fields !== mappings.fields) {
    entryParse = {
      fields: mappings.fields,
      parsed: parseNeurdf(await getGraph(), entry.rootClass, mappings.fields),
    };
    parsedCache.set(slug, entryParse);
  }
  const parsed = entryParse.parsed;

  const loaded: LoadedOntology = {
    entry,
    // Header identity is read straight from the file's owl:Ontology node
    // (title/description/version) — no hardcoded overrides.
    meta: parsed.meta,
    cells: parsed.cells,
    hierarchy: parsed.hierarchy,
    predicateDisplay: parsed.predicateDisplay,
    mappings,
  };
  // A `DEFAULT_MAPPINGS` result means the fetch failed and `loadMappings` will retry it on the
  // next call — caching that here would let `peekOntology`'s synchronous fast path (see
  // useCellTerm) serve the fallback forever instead of picking up the retry.
  if (mappings !== DEFAULT_MAPPINGS) loadedCache.set(slug, loaded);
  return loaded;
};

// Synchronous read of an already-parsed ontology, for callers that must resolve during render.
// Awaiting `loadOntology` costs a frame even on a cache hit, and that frame is a loading state:
// it unmounts the Cell Card and takes every widget's state with it. The hierarchy widget has to
// survive a cell → cell navigation (spec §3.2), so `useCellTerm` reads through this instead and
// only falls back to the async path on a cold load.
export const peekOntology = (slug: string): LoadedOntology | undefined => loadedCache.get(slug);

// --- single-term selectors (Cell Card) ---------------------------------------

// A term arrives from the URL as a slug, where the ":" of a CURIE has become "_":
// "npokb_998" -> "npokb:998". ILX ids are accepted in either their slug or CURIE form so the
// same lookup keeps working once Precision cells are ingested with ILX ids.
export const slugToCurie = (slug: string): string => {
  const s = decodeURIComponent(slug || "").trim();
  if (!s) return "";
  if (s.includes(":")) return s;
  const at = s.indexOf("_");
  return at > 0 ? `${s.slice(0, at)}:${s.slice(at + 1)}` : s;
};

export const curieToSlug = (curie: string): string => (curie || "").replace(":", "_");

// Find one cell by any of the identifiers a link might carry: the URL slug, the CURIE, or the
// full IRI. Matching is case-insensitive on the prefix only ("NPOKB:998" is the same record),
// because the local part of an ILX/npokb id is numeric anyway.
export const findCell = (data: LoadedOntology, id: string): CellTerm | undefined => {
  const wanted = slugToCurie(id);
  if (!wanted) return undefined;
  const lower = wanted.toLowerCase();
  return data.cells.find(
    (c) => c.id === wanted || c.curie === wanted || c.iri === wanted ||
      c.curie.toLowerCase() === lower || c.id.toLowerCase() === lower
  );
};

// InterLex's record of an *external* term is addressed as `dns/{host}/{path}` (see
// `termSlugForIri`). Such a term is not a cell, but the ontology that references it still
// asserts its label — so its page can be titled "dorsal root ganglion" from the graph even while
// the backend has no document to serve for it. Scheme-insensitive, because the slug keeps none.
export const findReferencedRef = (
  data: LoadedOntology,
  termSlug: string
): ResolvedRef | undefined => {
  const strip = (s: string) =>
    s.replace(/^https?:\/\//i, "").replace(/\/+$/, "").toLowerCase();
  const wanted = strip(termSlug.replace(/^dns\//, ""));
  if (!wanted) return undefined;
  const matches = (ref?: ResolvedRef) =>
    Boolean(ref && ref.iri && strip(ref.iri) === wanted);
  for (const cell of data.cells) {
    for (const property of Object.values(cell.properties)) {
      const hit = property.values.find(matches);
      if (hit) return hit;
    }
    const mapped = cell.mappings.find((m) => matches(m.ref));
    if (mapped) return mapped.ref;
  }
  return undefined;
};

// Sibling cells that cite the same publication ("Other cells from this source"). Excludes the
// current cell and preserves the parse's alphabetical order.
export const relatedBySource = (data: LoadedOntology, cell: CellTerm): CellTerm[] => {
  const dois = new Set(cell.sources.map((s) => s.id));
  if (!dois.size) return [];
  return data.cells.filter(
    (c) => c.id !== cell.id && c.sources.some((s) => dois.has(s.id))
  );
};

// Direct subClassOf parents and children of a cell, as ResolvedRefs. Both come from the
// hierarchy the parse already reduced (transitive edges removed), so a cell does not list its
// grandparents. Restricted to cells in scope — a parent outside the ontology (ilxtr:
// NeuronPrecision itself) is not a navigable cell card.
export const hierarchyNeighbours = (
  data: LoadedOntology,
  cell: CellTerm
): { parents: CellTerm[]; children: CellTerm[] } => {
  const parents: CellTerm[] = [];
  const children: CellTerm[] = [];
  const seenParent = new Set<string>();
  const seenChild = new Set<string>();
  const byTermId = new Map(data.cells.map((c) => [c.id, c]));

  const walk = (nodes: HierarchyNode[], parent?: HierarchyNode) => {
    for (const node of nodes) {
      if (node.termId === cell.id) {
        const p = parent && byTermId.get(parent.termId);
        if (p && !seenParent.has(p.id)) {
          seenParent.add(p.id);
          parents.push(p);
        }
        for (const child of node.children) {
          const c = byTermId.get(child.termId);
          if (c && !seenChild.has(c.id)) {
            seenChild.add(c.id);
            children.push(c);
          }
        }
      }
      walk(node.children, node);
    }
  };
  walk(data.hierarchy);
  return { parents, children };
};

// --- hierarchy scopes (Browse) ------------------------------------------------

// The two directions the Browse tab reads the subClassOf hierarchy in, around the class selected
// in its tree: the terms below that class, or the terms above it.
export const SUBCLASSES = "subclasses" as const;
export const SUPERCLASSES = "superclasses" as const;
export type HierarchyScope = typeof SUBCLASSES | typeof SUPERCLASSES;

// termId -> its direct children / parents, collapsed out of the positional hierarchy. A class with
// several parents is drawn at several paths, so the same edge is reached more than once; a Set per
// side makes the adjacency the DAG the positions were expanded from.
const adjacency = (roots: HierarchyNode[]) => {
  const children = new Map<string, Set<string>>();
  const parents = new Map<string, Set<string>>();
  const add = (map: Map<string, Set<string>>, from: string, to: string) => {
    const set = map.get(from);
    if (set) set.add(to);
    else map.set(from, new Set([to]));
  };
  const walk = (nodes: HierarchyNode[], parent?: string) => {
    for (const node of nodes) {
      if (parent) {
        add(children, parent, node.termId);
        add(parents, node.termId, parent);
      }
      walk(node.children, node.termId);
    }
  };
  walk(roots);
  return { children, parents };
};

// Everything reachable from `start` along one side of the adjacency, transitively.
//
// This is a union over *every* path, unlike the Cell Card hierarchy widget's ancestor spine
// (`findPath`, first position only) — the widget has to draw one nested chain, while a term list is
// a set and so takes them all. `start` is never in the result; whether the caller wants it back is
// its own decision (see `scopedCells`).
const closure = (start: string, edges: Map<string, Set<string>>): Set<string> => {
  const out = new Set<string>();
  const stack = [...(edges.get(start) || [])];
  while (stack.length) {
    const id = stack.pop() as string;
    if (out.has(id)) continue;
    out.add(id);
    stack.push(...(edges.get(id) || []));
  }
  out.delete(start); // a subClassOf cycle can walk back to it
  return out;
};

// The ontology's terms that sit under (or over) `termId`, in the parse's alphabetical order.
//
// The two directions are deliberately not symmetric, and the labels the Browse tab puts on them say
// so. Downwards is "<term> and its sub classes" — it includes the class itself, because 126 of the
// 161 Precision terms are leaves and a scope that dropped the very term you clicked would answer
// most of the tree with an empty table. Upwards is "super class of <term>", a question about other
// terms, which the term itself is not an answer to.
//
// Only terms are returned either way, so the ontology's root class — `ilxtr:NeuronPrecision`, what
// the set is defined *against* rather than a member of it — never appears as a row. Reading upwards
// from a top-level cell therefore lands on the empty list, which is the honest answer: no term in
// this ontology is a superclass of it.
export const scopedCells = (
  data: LoadedOntology,
  termId: string,
  scope: HierarchyScope
): CellTerm[] => {
  const { children, parents } = adjacency(data.hierarchy);
  if (scope === SUPERCLASSES) {
    const above = closure(termId, parents);
    return data.cells.filter((c) => above.has(c.id));
  }
  const below = closure(termId, children);
  return data.cells.filter((c) => c.id === termId || below.has(c.id));
};

// Which predicates are present across the cells (+ "source" from literatureCitation).
const presentNames = (cells: CellTerm[]): { found: Set<string>; hasSource: boolean } => {
  const found = new Set<string>();
  let hasSource = false;
  for (const cell of cells) {
    Object.keys(cell.properties).forEach((k) => found.add(k));
    if (cell.sources.length) hasSource = true;
  }
  return { found, hasSource };
};

const isPresent = (n: string, found: Set<string>, hasSource: boolean): boolean =>
  found.has(n) || (n === SOURCE_PREDICATE && hasSource);

// Facet localnames in display order. displayedOnly=true keeps only the properties shown on
// the tiles; otherwise every property found on the terms, the tile ones first.
const facetNames = (
  cells: CellTerm[],
  displayed: string[],
  displayedOnly: boolean
): string[] => {
  const { found, hasSource } = presentNames(cells);
  const shown = displayed.filter((n) => isPresent(n, found, hasSource));
  if (displayedOnly) return shown;
  // "source" lives on `cell.sources`, not `cell.properties`, so it never joins `found` on its
  // own — add it back here so "show everything" can still recover the Source facet even when
  // `tile.footer` (and therefore `displayed`) has been configured to hide the tile's source row.
  const rest = [...found, ...(hasSource ? [SOURCE_PREDICATE] : [])]
    .filter((n) => !displayed.includes(n))
    .sort();
  return [...shown, ...rest];
};

// The ontology's own `ilxtr:displayLabel`/`ilxtr:shortDefinition` outrank the mappings document's
// `predicates` section, same as the Cell Card's row labels (see buildRows.js) — a curator editing
// a displayLabel upstream should rename a predicate everywhere it appears, not just on the card.
const withPredicateDisplay = (
  data: LoadedOntology
): { titles: Record<string, string>; tooltips: Record<string, string> } => {
  const titles = { ...predicateLabels(data.mappings) };
  const tooltips = { ...predicateTooltips(data.mappings) };
  for (const [localName, display] of Object.entries(data.predicateDisplay)) {
    titles[localName] = display.label;
    if (display.description) tooltips[localName] = display.description;
  }
  return { titles, tooltips };
};

// Facets built from the data. displayedOnly=true → only the properties shown on the tiles, which
// the mappings define (see `displayedProperties`); the minimum option count is configured too —
// a facet offering a single value (Cell class = only "neuron") can't narrow anything.
// `alwaysInclude` rescues named facets from that cut only: a Cell Card row can deep-link a filter
// on a uniform-value predicate (its control warns it cannot narrow), and the pane must then show
// that facet checked rather than silently ignoring the URL. It never adds a facet no cell carries.
export const getFacets = (
  data: LoadedOntology,
  displayedOnly: boolean,
  alwaysInclude: string[] = []
): Facet[] => {
  const { titles, tooltips } = withPredicateDisplay(data);
  const facets = buildFacets(
    data.cells,
    facetNames(data.cells, displayedProperties(data.mappings), displayedOnly),
    titles,
    tooltips,
    1
  );
  const minOptions = data.mappings.regions.filters.minOptions;
  return facets.filter(
    (facet) => facet.values.length >= minOptions || alwaysInclude.includes(facet.localName)
  );
};
