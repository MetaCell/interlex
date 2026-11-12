// Service seam for the ontology views: fetches an ontology's JSON-LD once, parses it
// generically, and exposes its terms, its cells and their data-driven facets. Swap the fetch for
// a real API later without touching the components (they depend only on this contract).

import { parseNeurdf, buildFacets, buildHierarchy } from "../../../parsers/neurdfParser";
import {
  BROWSE_TAB,
  PREFER_LOCAL_NEURDF,
  SPECIFICATION_TAB,
  ontologyRouteSlug,
  termLink,
  termPath,
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
  GraphNode,
  ParsedOntology,
  Facet,
  CellTerm,
  HierarchyNode,
  HierarchyRelation,
  OntologyTerm,
  ResolvedRef,
} from "../model/types";
import type { FieldSources, OntologyMappings } from "../model/mappings";
import { SOURCE_PREDICATE } from "../model/mappings";
import type { OntologyEntry } from "../config/gridConfig";

export interface LoadedOntology {
  entry: OntologyEntry;
  meta: ParsedOntology["meta"];
  spec: ParsedOntology["spec"];
  terms: OntologyTerm[];
  rootClasses: ResolvedRef[];
  cells: CellTerm[];
  hierarchy: HierarchyNode[];
  predicateDisplay: ParsedOntology["predicateDisplay"];
  // Which predicate feeds which tile row / widget row / graph edge, fetched alongside the graph
  // so a view never renders before it knows what to show. See config/mappingsService.
  mappings: OntologyMappings;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// JSON-LD compacts a document holding a single node to that node, without a @graph — which is what
// InterLex serves for an ontology no term has been added to yet.
const asGraphDocument = (data: Partial<OntologyGraph> & GraphNode): OntologyGraph => {
  if (!data || Array.isArray(data["@graph"]) || !data["@id"]) return data as OntologyGraph;
  const { "@context": context, ...node } = data;
  return { "@context": context, "@graph": [node] };
};

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
    data = asGraphDocument(JSON.parse(text));
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
const fetchWithRetry = async (url: string): Promise<OntologyGraph> => {
  let lastErr: unknown;
  for (let i = 0; i < LIVE_RETRIES; i++) {
    try {
      return await fetchGraph(url);
    } catch (err) {
      lastErr = err;
      if (i < LIVE_RETRIES - 1) await sleep(600 * (i + 1));
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error("Failed to load ontology data");
};

// Only an ontology with a baked copy goes through the shim above; a group's ontology is a small
// document InterLex serves directly.
const loadGraph = async ({ dataUrl, localDataUrl }: OntologyEntry): Promise<OntologyGraph> => {
  if (!localDataUrl) return fetchGraph(dataUrl);
  const fetchLocal = () => fetchGraph(localDataUrl);
  const fetchUpstream = () => fetchWithRetry(dataUrl);
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

// Fetch + JSON.parse only once per session, per source. Keyed by the same-origin copy as well: an
// ontology addressed by its served path must be read from there, never from a catalogued
// ontology's baked copy of the same document.
const graphs = new Map<string, Promise<OntologyGraph>>();
const getGraph = (entry: OntologyEntry): Promise<OntologyGraph> => {
  const key = `${entry.dataUrl} ${entry.localDataUrl ?? ""}`;
  const pending = graphs.get(key);
  if (pending) return pending;
  const request = loadGraph(entry).catch((err) => {
    graphs.delete(key); // allow retry on next mount after a failure
    throw err;
  });
  graphs.set(key, request);
  return request;
};

// Parsed result cache, keyed by ontology entry (the parse depends on the root class *and* on the
// field sources, so the sources it was produced with are kept alongside it). Split from the
// composed result below so that a mappings fetch which failed on the first load is retried on the
// next navigation, and only re-parses if the retry actually changed where a field reads from.
const parsedCache = new Map<OntologyEntry, { fields: FieldSources; parsed: ParsedOntology }>();
const loadedCache = new Map<OntologyEntry, LoadedOntology>();

export const loadOntology = async (entry: OntologyEntry): Promise<LoadedOntology> => {
  // Cheap and separately cached: resolved config comes back by identity, so an unchanged config
  // hands back the very same LoadedOntology and the grid keeps its filter state.
  const mappings = await loadMappings(entry.slug);
  // Published here rather than from an effect, so the components rendered from the result below
  // never see one frame of the built-in configuration first.
  publishMappings(mappings);
  const cached = loadedCache.get(entry);
  if (cached && cached.mappings === mappings) return cached;

  let entryParse = parsedCache.get(entry);
  if (entryParse?.fields !== mappings.fields) {
    entryParse = {
      fields: mappings.fields,
      parsed: parseNeurdf(await getGraph(entry), entry.rootClass || "", mappings.fields),
    };
    parsedCache.set(entry, entryParse);
  }
  const parsed = entryParse.parsed;

  const loaded: LoadedOntology = {
    entry,
    // Header identity is read straight from the file's owl:Ontology node
    // (title/description/version) — no hardcoded overrides.
    meta: parsed.meta,
    spec: parsed.spec,
    terms: parsed.terms,
    rootClasses: parsed.rootClasses,
    cells: parsed.cells,
    hierarchy: parsed.hierarchy,
    predicateDisplay: parsed.predicateDisplay,
    mappings,
  };
  // A `DEFAULT_MAPPINGS` result means the fetch failed and `loadMappings` will retry it on the
  // next call — caching that here would let `peekOntology`'s synchronous fast path (see
  // useCellTerm) serve the fallback forever instead of picking up the retry.
  if (mappings !== DEFAULT_MAPPINGS) loadedCache.set(entry, loaded);
  return loaded;
};

// Synchronous read of an already-parsed ontology, for callers that must resolve during render.
// Awaiting `loadOntology` costs a frame even on a cache hit, and that frame is a loading state:
// it unmounts the Cell Card and takes every widget's state with it. The hierarchy widget has to
// survive a cell → cell navigation (spec §3.2), so `useCellTerm` reads through this instead and
// only falls back to the async path on a cold load.
export const peekOntology = (entry: OntologyEntry): LoadedOntology | undefined =>
  loadedCache.get(entry);

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

// Where a cell listed by an ontology opens. A cell of a routed ontology stays under that
// ontology's path; one of an ontology addressed by its served path has no such path, and opens
// wherever its IRI leads — its InterLex page, or InterLex's record of an external term.
export const ontologyTermHref = (
  entry: OntologyEntry,
  cell: Pick<CellTerm, "curie" | "iri">,
  tab = ""
): string | undefined =>
  entry.servedPath
    ? termLink(cell, { group: entry.org, ontologySlug: null })
    : termPath(entry.org, entry.slug, curieToSlug(cell.curie), tab);

// Where any term of the ontology opens from the Browse tab. Only a cell has a page the ontology
// itself can fill; every other term opens wherever its IRI leads, kept inside the ontology's
// context when it has a route. Undefined for an IRI no page of this app addresses.
export const browseTermHref = (
  data: Pick<LoadedOntology, "entry" | "cells">,
  term: Pick<OntologyTerm, "id" | "curie" | "iri">
): string | undefined => {
  const { entry } = data;
  if (cellIds(data.cells).has(term.id)) return ontologyTermHref(entry, term);
  return termLink(term, { group: entry.org, ontologySlug: ontologyRouteSlug(entry) });
};

const cellIdsByList = new WeakMap<CellTerm[], Set<string>>();
const cellIds = (cells: CellTerm[]): Set<string> => {
  let ids = cellIdsByList.get(cells);
  if (!ids) {
    ids = new Set(cells.map((cell) => cell.id));
    cellIdsByList.set(cells, ids);
  }
  return ids;
};

// The grid is a view of cells, so an ontology without any has no Grid tab, and opens on its terms
// or, while it has none of those either, on its header.
export const hasCells = (data: Pick<LoadedOntology, "cells">): boolean => data.cells.length > 0;

export const landingTab = (data: Pick<LoadedOntology, "cells" | "terms">): string => {
  if (hasCells(data)) return "";
  return data.terms.length ? BROWSE_TAB : SPECIFICATION_TAB;
};

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

// The other end of one direct subClassOf link of a cell. The link is `secondary` when it is not
// the subclass's primary one — the link the tree draws as the subclass's asterisked leaf.
export interface HierarchyNeighbour {
  term: Pick<CellTerm, "id" | "curie" | "label" | "iri">;
  secondary: boolean;
  // On a secondary link: where the subclass's own position hangs instead.
  primaryParentLabel?: string;
}

// Direct subClassOf parents and children of a cell, read off the positions the hierarchy tree
// draws, so the graph and the tree agree on the links and on which of them is primary. The
// hierarchy is already reduced (transitive edges removed), so a cell does not list its
// grandparents. A configured root class is a parent like any other, and gets the tree's own
// fields since it has no cell record; without one, a top-level cell has no parent at all.
export const hierarchyNeighbours = (
  data: LoadedOntology,
  cell: CellTerm
): { parents: HierarchyNeighbour[]; children: HierarchyNeighbour[] } => {
  const byTermId = new Map(data.cells.map((c) => [c.id, c]));
  // A link is primary or not by the subclass's position under the parent, whichever end the cell is.
  const linkTo = (other: HierarchyNode, subclassPosition: HierarchyNode): HierarchyNeighbour => ({
    term: byTermId.get(other.termId) || {
      id: other.termId,
      curie: other.curie,
      label: other.label,
      iri: other.iri,
    },
    secondary: Boolean(subclassPosition.secondary),
    primaryParentLabel: subclassPosition.primaryParentLabel,
  });

  const parents: HierarchyNeighbour[] = [];
  let children: HierarchyNeighbour[] = [];
  // Every position of the cell sits under a different parent; only its own position has children.
  const walk = (nodes: HierarchyNode[], parent?: HierarchyNode) => {
    for (const node of nodes) {
      if (node.termId === cell.id) {
        if (parent) parents.push(linkTo(parent, node));
        if (!node.secondary) children = node.children.map((child) => linkTo(child, child));
      }
      walk(node.children, node);
    }
  };
  walk(data.hierarchy);
  // The primary parent leads, so the graph draws it first in its row.
  parents.sort((a, b) => Number(a.secondary) - Number(b.secondary));
  return { parents, children };
};

// --- Browse: every term, by type and by hierarchy ------------------------------

export interface TermTypeCount {
  type: string;
  count: number;
}

// Every distinct rdf:type the ontology's terms carry, the most used first.
export const termTypeCounts = (terms: OntologyTerm[]): TermTypeCount[] => {
  const counts = new Map<string, number>();
  for (const term of terms) {
    for (const type of term.rdfTypes) counts.set(type, (counts.get(type) || 0) + 1);
  }
  return [...counts.entries()]
    .map(([type, count]) => ({ type, count }))
    .sort((a, b) => b.count - a.count || a.type.localeCompare(b.type));
};

export const termsOfType = (terms: OntologyTerm[], type?: string): OntologyTerm[] =>
  type ? terms.filter((term) => term.rdfTypes.includes(type)) : terms;

// One hierarchy per relation, never merged: a property is placed by rdfs:subPropertyOf, everything
// else by rdfs:subClassOf.
export const HIERARCHY_RELATIONS: HierarchyRelation[] = ["subClassOf", "subPropertyOf"];

export const relationsIn = (terms: OntologyTerm[]): HierarchyRelation[] =>
  HIERARCHY_RELATIONS.filter((relation) => terms.some((term) => term.relation === relation));

// The forest of the given terms that one relation places. A term whose parents are all outside
// the list — in another ontology, or filtered out with their type — sits at the top level.
export const relationHierarchy = (
  terms: OntologyTerm[],
  relation: HierarchyRelation
): { terms: OntologyTerm[]; roots: HierarchyNode[] } => {
  const placed = terms.filter((term) => term.relation === relation);
  return { terms: placed, roots: buildHierarchy(placed) };
};

// The two directions the Browse tab reads a hierarchy in, around the term selected in its tree:
// the terms below it, or the terms above it.
export const SUBCLASSES = "subclasses" as const;
export const SUPERCLASSES = "superclasses" as const;
export type HierarchyScope = typeof SUBCLASSES | typeof SUPERCLASSES;

// termId -> its direct children / parents, collapsed out of the positional hierarchy. Every link is
// one position — the subclass's own under its primary parent, an asterisked leaf under each other —
// so walking the positions recovers the DAG they were expanded from, secondary links included.
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
// This is a union over *every* path, which the Cell Card widget's superclass tree is not: that one
// reaches each direct parent by its primary chain only, so a parent's own further parents are not
// rows there, while a term list is a set and so takes them all. `start` is never in the result;
// whether the caller wants it back is its own decision (see `scopedTerms`).
const closure = (start: string, edges: Map<string, Set<string>>): Set<string> => {
  const out = new Set<string>();
  const stack = [...(edges.get(start) || [])];
  while (stack.length) {
    const id = stack.pop() as string;
    if (out.has(id)) continue;
    out.add(id);
    stack.push(...(edges.get(id) || []));
  }
  out.delete(start); // a cycle can walk back to it
  return out;
};

// The terms of a hierarchy that sit under (or over) `termId`, in the order they were given.
//
// The two directions are deliberately not symmetric, and the labels the Browse tab puts on them say
// so. Downwards is "<term> and its sub classes" — it includes the term itself, because most terms
// are leaves and a scope that dropped the very term you clicked would answer most of the tree with
// an empty table. Upwards is "super class of <term>", a question about other terms, which the term
// itself is not an answer to. Reading upwards from a top-level term therefore lands on the empty
// list, which is the honest answer: no term in this ontology is above it.
export const scopedTerms = <T extends { id: string }>(
  terms: T[],
  roots: HierarchyNode[],
  termId: string,
  scope: HierarchyScope
): T[] => {
  const { children, parents } = adjacency(roots);
  if (scope === SUPERCLASSES) {
    const above = closure(termId, parents);
    return terms.filter((term) => above.has(term.id));
  }
  const below = closure(termId, children);
  return terms.filter((term) => term.id === termId || below.has(term.id));
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
