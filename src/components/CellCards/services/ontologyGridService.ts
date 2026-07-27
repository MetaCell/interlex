// Service seam for the CellCards grid: fetches the neurdf JSON-LD once, parses it
// generically, and exposes cells + data-driven facets. Swap the fetch for a real
// API later without touching the components (they depend only on this contract).

import { parseNeurdf, buildFacets } from "../../../parsers/neurdfParser";
import {
  NEURDF_URL,
  NEURDF_FALLBACK_URL,
  ONTOLOGY_CATALOG,
  DISPLAYED_PROPERTIES,
  PREDICATE_LABELS,
  PREDICATE_TOOLTIPS,
} from "../config/gridConfig";
import type { OntologyGraph, ParsedOntology, Facet, CellTerm } from "../model/types";
import type { OntologyEntry } from "../config/gridConfig";

export interface LoadedOntology {
  entry: OntologyEntry;
  meta: ParsedOntology["meta"];
  cells: CellTerm[];
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

const loadGraphWithRetry = async (): Promise<OntologyGraph> => {
  // Try the live endpoint (flaky on the large body), then the optional dev fallback.
  let liveErr: unknown;
  for (let i = 0; i < LIVE_RETRIES; i++) {
    try {
      return await fetchGraph(NEURDF_URL);
    } catch (err) {
      liveErr = err;
      if (i < LIVE_RETRIES - 1) await sleep(600 * (i + 1));
    }
  }
  try {
    return await fetchGraph(NEURDF_FALLBACK_URL);
  } catch {
    // The fallback is a dev-only convenience (gitignored, often absent). If it fails,
    // surface the real live-endpoint error rather than the fallback's parse/HTML error.
  }
  throw liveErr instanceof Error ? liveErr : new Error("Failed to load ontology data");
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
  };
  parsedCache.set(slug, loaded);
  return loaded;
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
