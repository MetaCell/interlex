// Service seam for the CellCards grid: fetches the neurdf JSON-LD once, parses it
// generically, and exposes cells + data-driven facets. Swap the fetch for a real
// API later without touching the components (they depend only on this contract).

import { parseNeurdf, buildFacets } from "../../../parsers/neurdfParser";
import {
  NEURDF_URL,
  NEURDF_LOCAL_URL,
  PREFER_LOCAL_NEURDF,
  ONTOLOGY_CATALOG,
  DISPLAYED_PROPERTIES,
  PREDICATE_LABELS,
  PREDICATE_TOOLTIPS,
} from "../config/gridConfig";
import type {
  OntologyGraph,
  ParsedOntology,
  Facet,
  CellTerm,
  HierarchyNode,
} from "../model/types";
import type { OntologyEntry } from "../config/gridConfig";

export interface LoadedOntology {
  entry: OntologyEntry;
  meta: ParsedOntology["meta"];
  cells: CellTerm[];
  hierarchy: HierarchyNode[];
  predicateDisplay: ParsedOntology["predicateDisplay"];
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

// Parsed result cache, keyed by ontology slug (parse depends on the root class).
const parsedCache = new Map<string, LoadedOntology>();

export const loadOntology = async (slug: string): Promise<LoadedOntology> => {
  const entry = ONTOLOGY_CATALOG[slug];
  if (!entry) throw new Error(`Unknown ontology "${slug}"`);
  const cached = parsedCache.get(slug);
  if (cached) return cached;

  const graph = await getGraph();
  const parsed = parseNeurdf(graph, entry.rootClass);
  const loaded: LoadedOntology = {
    entry,
    // Header identity is read straight from the file's owl:Ontology node
    // (title/description/version) — no hardcoded overrides.
    meta: parsed.meta,
    cells: parsed.cells,
    hierarchy: parsed.hierarchy,
    predicateDisplay: parsed.predicateDisplay,
  };
  parsedCache.set(slug, loaded);
  return loaded;
};

// Synchronous read of an already-parsed ontology, for callers that must resolve during render.
// Awaiting `loadOntology` costs a frame even on a cache hit, and that frame is a loading state:
// it unmounts the Cell Card and takes every widget's state with it. The hierarchy widget has to
// survive a cell → cell navigation (spec §3.2), so `useCellTerm` reads through this instead and
// only falls back to the async path on a cold load.
export const peekOntology = (slug: string): LoadedOntology | undefined => parsedCache.get(slug);

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
  found.has(n) || (n === "source" && hasSource);

// Facet localnames in display order. displayedOnly=true keeps only the properties shown on
// the tiles; otherwise every property found on the terms, the tile ones first.
const facetNames = (cells: CellTerm[], displayedOnly: boolean): string[] => {
  const { found, hasSource } = presentNames(cells);
  const displayed = DISPLAYED_PROPERTIES.filter((n) => isPresent(n, found, hasSource));
  if (displayedOnly) return displayed;
  const rest = [...found].filter((n) => !DISPLAYED_PROPERTIES.includes(n)).sort();
  return [...displayed, ...rest];
};

// A facet needs at least this many distinct options to be worth showing — filtering on a
// single-option facet (e.g. Cell class = only "neuron") can't narrow anything.
const MIN_FACET_OPTIONS = 2;

// Facets built from the data. displayedOnly=true → only the properties shown on the tiles.
export const getFacets = (cells: CellTerm[], displayedOnly: boolean): Facet[] =>
  buildFacets(cells, facetNames(cells, displayedOnly), PREDICATE_LABELS, PREDICATE_TOOLTIPS, MIN_FACET_OPTIONS);
