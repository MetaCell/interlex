// Generic parser for the neurdf (reasoned-lowered) representation of an NPO-style ontology.
// Turns the raw JSON-LD @graph into a flat, label-resolved list of cell records + facets.
// Design goals: dependency-free, generic to any neurdf ontology (root class is a parameter),
// and driven entirely by the flat `neurdf.*` predicates — the OWL class expressions
// (owl:Restriction / blank nodes) are intentionally ignored, which is the point of neurdf.

import type {
  OntologyGraph,
  GraphNode,
  ResolvedRef,
  RefKind,
  CellTerm,
  CellProperty,
  CellAnnotations,
  CellMapping,
  MappingEvidence,
  ValueCombinator,
  OntologyMeta,
  ParsedOntology,
  HierarchyNode,
  Facet,
  FacetValue,
  PredicateDisplay,
} from "../components/CellCards/model/types";

// --- label + value helpers -------------------------------------------------

// Display-label sources, ordered most-human-readable → machine-id last (spec §2.2 / §8).
// Try the curated short label, then the standard label, then a title; only when a node
// carries none of these do we fall back to its CURIE (the machine id). ilxtr:genLabel is
// deliberately excluded — it is the verbose machine-generated string, never a title.
const LABEL_KEYS = ["ilxtr:localLabel", "rdfs:label", "dc:title", "dcterms:title"];

// Definition sources for the Terms table, best first. The first four are prose written by a
// curator. The last two are fallbacks so the column still describes a term that has none of
// those: ilxtr:genLabel is the phenotype string generated from the term's own axioms, and the
// curator note is a last resort. Everything past CURATED_DEFINITION_KEYS is reported as
// uncurated, so the UI can say where the text came from instead of passing generated output
// off as a definition (the same care LABEL_KEYS takes in excluding genLabel as a *title*).
const DEFINITION_KEYS = [
  "definition",
  "skos:definition",
  "NIFRID:definition",
  "rdfs:comment",
  "ilxtr:genLabel",
  "ilxtr:curatorNote",
];

const CURATED_DEFINITION_KEYS = 4;

type LabelLike =
  | string
  | { "@value"?: string }
  | Array<string | { "@value"?: string }>;

const firstString = (v: unknown): string | undefined => {
  if (typeof v === "string") return v;
  if (Array.isArray(v)) {
    for (const item of v) {
      const s = firstString(item);
      if (s) return s;
    }
    return undefined;
  }
  if (v && typeof v === "object" && "@value" in (v as object)) {
    const val = (v as { "@value"?: unknown })["@value"];
    return typeof val === "string" ? val : undefined;
  }
  return undefined;
};

const isBlankNode = (id: string): boolean => id.startsWith("_:");
const isIri = (id: string): boolean => id.includes("://");

// Some cells carry a "TEMP:MISSING_" placeholder meaning the phenotype is *not specified*.
// It is not a real term, so it must never surface as a value / facet option / tile chip.
const isMissingSentinel = (id: string): boolean => /^TEMP:MISSING/i.test(id);

// Compact an @id (curie or IRI) into { curie, kind } without needing the @context.
const classify = (id: string): { curie: string; kind: RefKind } => {
  if (!isIri(id)) {
    // already a curie like "npokb:1067", "NCBIGene:233222", "ilxtr:SensoryPhenotype"
    const prefix = id.split(":")[0];
    return { curie: id, kind: kindForPrefix(prefix, id) };
  }
  // full IRI — derive a short curie + kind from known bases
  for (const [prefix, base] of Object.entries(IRI_BASES)) {
    if (id.startsWith(base)) {
      return { curie: `${prefix}:${id.slice(base.length)}`, kind: kindForPrefix(prefix, id) };
    }
  }
  const tail = id.split(/[/#]/).filter(Boolean).pop() || id;
  return { curie: tail, kind: "external" };
};

const IRI_BASES: Record<string, string> = {
  UBERON: "http://purl.obolibrary.org/obo/UBERON_",
  CHEBI: "http://purl.obolibrary.org/obo/CHEBI_",
  NCBITaxon: "http://purl.obolibrary.org/obo/NCBITaxon_",
  NCBIGene: "http://www.ncbi.nlm.nih.gov/gene/",
  ILX: "http://uri.interlex.org/base/ilx_",
  ilxtr: "http://uri.interlex.org/tgbugs/uris/readable/",
  npokb: "http://uri.interlex.org/npo/uris/neurons/",
};

const kindForPrefix = (prefix: string, id: string): RefKind => {
  switch (prefix) {
    case "UBERON":
      return "uberon";
    case "CHEBI":
      return "chebi";
    case "NCBIGene":
      return "ncbigene";
    case "NCBITaxon":
      return "ncbitaxon";
    case "ILX":
    case "ilxtr":
    case "npokb":
    case "NIFEXT":
    case "ilxcr":
      return "interlex";
    default:
      return id.includes("interlex.org") ? "interlex" : "external";
  }
};

// Full IRI for linking out (expand a curie via known bases; pass through IRIs).
const toIri = (id: string): string => {
  if (isIri(id)) return id;
  const [prefix, ...rest] = id.split(":");
  const base = IRI_BASES[prefix];
  return base ? base + rest.join(":") : "";
};

// --- graph index + reference resolution ------------------------------------

type Index = Map<string, GraphNode>;

const indexGraph = (graph: GraphNode[]): Index => {
  const idx: Index = new Map();
  for (const node of graph) {
    const id = node["@id"];
    if (typeof id === "string") idx.set(id, node);
  }
  return idx;
};

const labelFor = (id: string, idx: Index): string => {
  const node = idx.get(id);
  if (node) {
    for (const key of LABEL_KEYS) {
      const s = firstString(node[key]);
      if (s) return s;
    }
  }
  return classify(id).curie; // fall back to a compact curie when no label exists
};

// Turn a predicate value (ref object, array, @list, or literal) into ResolvedRefs.
//
// `@list` matters: the union/intersection families serialise their members as a JSON-LD list
// ({"@list":[{...},{...}]}), and `neurdf.eqv.uo:hasSomaLocatedIn` is the *only* soma-location
// predicate on 61 of the 161 Precision cells. Treating a list object as an unrecognised value
// silently dropped the property for all of them.
const resolveValue = (raw: unknown, idx: Index): ResolvedRef[] => {
  const out: ResolvedRef[] = [];
  const push = (item: unknown) => {
    if (item && typeof item === "object" && "@list" in (item as object)) {
      const list = (item as { "@list"?: unknown })["@list"];
      if (Array.isArray(list)) list.forEach(push);
      return;
    }
    if (item && typeof item === "object" && "@id" in (item as object)) {
      const id = String((item as JsonLdRefish)["@id"]);
      if (isBlankNode(id) || isMissingSentinel(id)) return; // skip restriction blanks + "not specified" sentinels
      const { curie, kind } = classify(id);
      out.push({ id, curie, label: labelFor(id, idx), iri: toIri(id), kind });
    } else if (item && typeof item === "object" && "@value" in (item as object)) {
      // JSON-LD literal object, e.g. {"@value":"foo"} / {"@value":"foo","@language":"en"}
      const v = (item as { "@value"?: unknown })["@value"];
      const s = v == null ? "" : String(v);
      if (s) out.push({ id: s, curie: s, label: s, iri: "", kind: "literal" });
    } else if (typeof item === "string") {
      if (isMissingSentinel(item)) return;
      out.push({ id: item, curie: item, label: item, iri: "", kind: "literal" });
    }
  };
  if (Array.isArray(raw)) raw.forEach(push);
  else push(raw);
  return out;
};

type JsonLdRefish = { "@id"?: unknown };

// --- neurdf predicate families ---------------------------------------------

// "neurdf.eqv:hasSomaLocatedIn"                -> { family:'eqv', negated:false, localName:… }
// "neurdf.eqv.neg:hasMorphologicalPhenotype"   -> { family:'eqv', negated:true, … }
// "neurdf.eqv.uo:hasSomaLocatedIn"             -> { …, combinator:'or'  }  (owl:unionOf)
// "neurdf.eqv.io:hasExpressionPhenotype"       -> { …, combinator:'and' }  (owl:intersectionOf)
const parseNeurdfKey = (
  key: string
): {
  family: "eqv" | "ent";
  negated: boolean;
  combinator?: ValueCombinator;
  localName: string;
} | null => {
  if (!key.startsWith("neurdf.")) return null;
  const [prefix, local] = key.split(":");
  if (!local) return null;
  const fam = prefix.replace("neurdf.", ""); // "eqv" | "ent" | "eqv.neg" | "eqv.uo" | "eqv.io" | …
  return {
    family: fam.startsWith("ent") ? "ent" : "eqv",
    negated: fam.endsWith(".neg"),
    combinator: fam.endsWith(".uo") ? "or" : fam.endsWith(".io") ? "and" : undefined,
    localName: local,
  };
};

// A few literal-valued ilxtr predicates we surface directly (not neurdf refs). These land on
// `properties`, so they are facetable and can appear on a tile row.
const LITERAL_PREDICATES: Record<string, string> = {
  "ilxtr:neurondmBaseClass": "neurondmBaseClass",
};

// Cross-nomenclature relations. The evidence type is derived from *which* relation it is,
// since the graph has no dedicated evidence predicate.
const MAPPING_PREDICATES: Record<string, MappingEvidence> = {
  "TEMP:assertedSubClassOf": "described",
  "TEMP:subClassOf": "described",
  "TEMP:mapsTo": "inferred",
};

// Prose / id / dataset annotations. Deliberately kept off `properties` so widening the parser
// cannot add new facets to the grid sidebar or new rows to a tile — they land on
// `CellTerm.annotations` instead, which only the Cell Card reads.
const TEXT_ANNOTATIONS = {
  "ilxtr:atlasAnnotation": "atlasAnnotation",
  "ilxtr:curatorNote": "curatorNotes",
  "ilxtr:alertNote": "alertNotes",
} as const;

// Deep-link targets for the Cell Card's external widgets (SPARC Portal, SPARC Maps, NervoSensus).
// None of these predicates occur in the shipped graph yet, and the front end must not need an edit
// when they arrive — so they are matched by *local name* and every prefix works: `ilx:`, `ilxtr:`
// or the expanded IRI all reduce to the same compact form, exactly as parsePredicateDisplay does
// for the display annotations.
//
// They land on `annotations` rather than `properties` for the same reason TEXT_ANNOTATIONS does: a
// deep-link URL is not a phenotype, and every key on `properties` becomes a facet option in the
// grid sidebar as soon as the "Displayed properties" toggle is off.
const LINK_ANNOTATIONS = {
  hasSPARCTranscriptomicsLink: "sparcTranscriptomicsLinks",
  hasSPARCMap: "sparcMaps",
  hasNervoSensusLink: "nervoSensusLinks",
} as const;

type LinkAnnotationField = (typeof LINK_ANNOTATIONS)[keyof typeof LINK_ANNOTATIONS];

const linkAnnotationField = (key: string): LinkAnnotationField | undefined => {
  if (key.startsWith("neurdf.")) return undefined; // a phenotype family, never a deep link
  const localName = classify(key).curie.split(":").pop() || "";
  return LINK_ANNOTATIONS[localName as keyof typeof LINK_ANNOTATIONS];
};

// A source label like "DRG TG Calca+Bmpr1b human (Bhuiyan2024)" carries its provenance in a
// trailing parenthetical; the Cross-Nomenclature table shows it as its own Source column.
const trailingParenthetical = (label: string): string | undefined =>
  /\(([^()]+)\)\s*$/.exec(label)?.[1];

const emptyAnnotations = (): CellAnnotations => ({
  atlasAnnotation: [],
  curatorNotes: [],
  alertNotes: [],
  dataCitations: [],
  errors: [],
  sparcTranscriptomicsLinks: [],
  sparcMaps: [],
  nervoSensusLinks: [],
});

const asType = (t: unknown): string[] =>
  Array.isArray(t) ? (t as string[]) : typeof t === "string" ? [t] : [];

const subClassRefs = (node: GraphNode | undefined): string[] => {
  if (!node) return [];
  const s = node["rdfs:subClassOf"];
  const arr = Array.isArray(s) ? s : [s];
  return arr
    .map((x) => (x && typeof x === "object" ? String((x as JsonLdRefish)["@id"] ?? "") : ""))
    .filter(Boolean);
};

// Does `startId` reach `targetId` through the transitive rdfs:subClassOf chain?
const reaches = (startId: string, targetId: string, idx: Index): boolean => {
  const seen = new Set<string>();
  const stack = subClassRefs(idx.get(startId));
  while (stack.length) {
    const cur = stack.pop() as string;
    if (cur === targetId) return true;
    if (seen.has(cur)) continue;
    seen.add(cur);
    stack.push(...subClassRefs(idx.get(cur)));
  }
  return false;
};

// --- public API -------------------------------------------------------------

const mergeValues = (existing: ResolvedRef[], incoming: ResolvedRef[]): ResolvedRef[] => {
  const byId = new Map(existing.map((r) => [r.id, r]));
  for (const r of incoming) if (!byId.has(r.id)) byId.set(r.id, r);
  return [...byId.values()];
};

const buildCell = (node: GraphNode, idx: Index): CellTerm => {
  const id = String(node["@id"]);
  const { curie } = classify(id);
  const properties: Record<string, CellProperty> = {};
  const negated: Record<string, CellProperty> = {};
  const annotations = emptyAnnotations();
  const mappings: CellMapping[] = [];
  let sources: ResolvedRef[] = [];

  for (const [key, raw] of Object.entries(node)) {
    if (key === "ilxtr:literatureCitation") {
      sources = resolveValue(raw, idx); // a cell may cite several publications
      continue;
    }
    if (key === "ilxtr:dataCitation") {
      annotations.dataCitations = resolveValue(raw, idx);
      continue;
    }
    if (key in TEXT_ANNOTATIONS) {
      const field = TEXT_ANNOTATIONS[key as keyof typeof TEXT_ANNOTATIONS];
      // These are plain strings in the graph; resolveValue normalises the literal shapes.
      annotations[field] = resolveValue(raw, idx).map((r) => r.label);
      continue;
    }
    if (key === "ilxtr:hasTemporaryId") {
      annotations.temporaryId = resolveValue(raw, idx)[0]?.curie;
      continue;
    }
    if (key === "ilxtr:genLabel") {
      annotations.generatedLabel = firstString(raw);
      continue;
    }
    if (key === "ilxtr:error") {
      annotations.errors = resolveValue(raw, idx).map((r) => r.curie);
      continue;
    }
    const linkField = linkAnnotationField(key);
    if (linkField) {
      // The same link can be asserted under more than one prefix; merge rather than overwrite.
      annotations[linkField] = mergeValues(annotations[linkField], resolveValue(raw, idx));
      continue;
    }
    if (key in MAPPING_PREDICATES) {
      const evidence = MAPPING_PREDICATES[key];
      for (const ref of resolveValue(raw, idx)) {
        // A cell can be related to the same record by more than one relation; the stronger
        // claim (an explicit description) wins over an inferred mapping.
        const prev = mappings.find((m) => m.ref.id === ref.id);
        if (prev) {
          if (evidence === "described") prev.evidence = evidence;
          continue;
        }
        mappings.push({ ref, evidence, source: trailingParenthetical(ref.label) });
      }
      continue;
    }
    if (key in LITERAL_PREDICATES) {
      const local = LITERAL_PREDICATES[key];
      const values = resolveValue(raw, idx);
      if (values.length) properties[local] = { localName: local, family: "eqv", negated: false, values };
      continue;
    }
    const parsed = parseNeurdfKey(key);
    if (!parsed) continue; // skip @id/@type/owl:*/rdfs:*/etc.
    const values = resolveValue(raw, idx);
    if (!values.length) continue;
    const bucket = parsed.negated ? negated : properties;
    const prev = bucket[parsed.localName];
    if (!prev) {
      bucket[parsed.localName] = { ...parsed, values };
    } else {
      // prefer eqv over ent; always union the values
      bucket[parsed.localName] = {
        localName: parsed.localName,
        family: prev.family === "eqv" ? "eqv" : parsed.family,
        negated: parsed.negated,
        // Only keep the combinator when both keys agree — a union merged with a plain
        // assertion has no single "or"/"and" reading, so it is better left unstated.
        combinator: prev.combinator === parsed.combinator ? prev.combinator : undefined,
        values: mergeValues(prev.values, values),
      };
    }
  }

  const definition = definitionOf(node);

  return {
    id,
    curie,
    iri: toIri(id),
    label: labelFor(id, idx),
    rdfTypes: rdfTypesOf(node),
    definition: definition?.text,
    definitionCurated: definition?.curated,
    properties,
    negated,
    sources,
    mappings,
    annotations,
  };
};

// rdf:type for the Terms table. The design asks for the OWL type of the record
// (owl:Class / owl:ObjectProperty), so the neurdf marker types are dropped — but a record
// carrying no owl:* type shows every type it has rather than nothing.
const rdfTypesOf = (node: GraphNode): string[] => {
  const all = asType(node["@type"]).map((t) => classify(t).curie);
  const owl = all.filter((t) => t.startsWith("owl:"));
  return owl.length ? owl : all;
};

const definitionOf = (
  node: GraphNode
): { text: string; curated: boolean } | undefined => {
  for (let i = 0; i < DEFINITION_KEYS.length; i++) {
    const text = firstString(node[DEFINITION_KEYS[i]]);
    if (text) return { text, curated: i < CURATED_DEFINITION_KEYS };
  }
  return undefined;
};

// Build the subClassOf hierarchy over the in-scope terms.
//
// The neurdf file is *reasoned*, so each term asserts a direct rdfs:subClassOf link to the root
// class **as well as** to its real parent(s) — taken literally that yields a flat list of 161
// children. A transitive reduction drops every parent that another parent already implies,
// which recovers the curated shape (here 4 levels deep under the root).
//
// The result is a DAG, not a tree: 15 of the Precision terms have more than one direct parent.
// Each is rendered under every parent, so node ids are the path that reached them.
const buildHierarchy = (
  rootClass: string,
  cells: CellTerm[],
  idx: Index
): HierarchyNode[] => {
  if (!rootClass) return [];
  const inScope = new Set(cells.map((c) => c.id));
  const parentsOf = new Map<string, string[]>();
  for (const cell of cells) {
    parentsOf.set(
      cell.id,
      subClassRefs(idx.get(cell.id)).filter((p) => p === rootClass || inScope.has(p))
    );
  }

  const ancestorCache = new Map<string, Set<string>>();
  const ancestorsOf = (id: string): Set<string> => {
    const cached = ancestorCache.get(id);
    if (cached) return cached;
    const out = new Set<string>();
    const stack = [...(parentsOf.get(id) || [])];
    while (stack.length) {
      const cur = stack.pop() as string;
      if (out.has(cur)) continue;
      out.add(cur);
      stack.push(...(parentsOf.get(cur) || []));
    }
    ancestorCache.set(id, out);
    return out;
  };

  const childrenOf = new Map<string, string[]>();
  for (const cell of cells) {
    const parents = parentsOf.get(cell.id) || [];
    // Keep a parent only when no *other* parent already reaches it: that other parent is the
    // more specific one, and this link is the entailed shortcut.
    const direct = parents.filter((p) => !parents.some((q) => q !== p && ancestorsOf(q).has(p)));
    for (const parent of direct.length ? direct : parents) {
      const siblings = childrenOf.get(parent);
      if (siblings) siblings.push(cell.id);
      else childrenOf.set(parent, [cell.id]);
    }
  }

  const byId = new Map(cells.map((c) => [c.id, c]));
  // `seen` is the current path — it stops a subClassOf cycle from recursing forever.
  const nodeAt = (termId: string, path: string, seen: Set<string>): HierarchyNode => {
    const cell = byId.get(termId);
    const kids = seen.has(termId) ? [] : childrenOf.get(termId) || [];
    const nextSeen = new Set(seen).add(termId);
    return {
      id: path,
      termId,
      label: cell ? cell.label : labelFor(termId, idx),
      curie: cell ? cell.curie : classify(termId).curie,
      iri: cell ? cell.iri : toIri(termId),
      children: kids
        .map((kid) => nodeAt(kid, `${path}/${kid}`, nextSeen))
        .sort((a, b) => a.label.localeCompare(b.label)),
    };
  };

  return [nodeAt(rootClass, rootClass, new Set())];
};

export const parseOntologyMeta = (graph: GraphNode[]): OntologyMeta => {
  const onto = graph.find((n) => asType(n["@type"]).includes("owl:Ontology"));
  const iri = onto ? String(onto["@id"] ?? "") : "";
  const title =
    (onto &&
      (firstString(onto["dc:title"]) ||
        firstString(onto["dcterms:title"]) ||
        firstString(onto["rdfs:label"]) ||
        firstString(onto["skos:prefLabel"]))) ||
    "Ontology";
  const description =
    onto &&
    (firstString(onto["dc:description"]) ||
      firstString(onto["dcterms:description"]) ||
      firstString(onto["rdfs:comment"]));
  const version = onto ? firstString(onto["owl:versionInfo"]) : undefined;
  return { iri, title, description: description || undefined, version };
};

// Parse the graph into cells that are (transitively) subClassOf `rootClass`.
// Row labels and tooltips ship inside the ontology: the ilxtr:* property nodes carry
// ilxtr:displayLabel ("Soma location") and ilxtr:shortDefinition, which between them cover 14
// of the 15 neurdf local names Precision cells use. Reading them here keeps the UI's wording
// in the curators' hands instead of a hardcoded map in the front end — gridConfig's
// PREDICATE_LABELS / PREDICATE_TOOLTIPS are only the fallback for what the file omits.
//
// Keyed by *local name* (`hasSomaLocatedIn`), because that is how a CellProperty is keyed,
// while the annotation lives on the `ilxtr:hasSomaLocatedIn` node.
export const parsePredicateDisplay = (graph: GraphNode[]): Record<string, PredicateDisplay> => {
  const out: Record<string, PredicateDisplay> = {};
  for (const node of graph) {
    const id = node["@id"];
    if (typeof id !== "string") continue;
    const label = firstString(node["ilxtr:displayLabel"]);
    const description = firstString(node["ilxtr:shortDefinition"]);
    if (!label && !description) continue;
    // "ilxtr:hasSomaLocatedIn" and the expanded IRI both reduce to the same local name.
    const localName = classify(id).curie.split(":").pop() || "";
    if (!localName) continue;
    out[localName] = {
      localName,
      label: label || out[localName]?.label || humanizeLocalName(localName),
      description: description || out[localName]?.description,
    };
  }
  return out;
};

export const parseNeurdf = (data: OntologyGraph, rootClass: string): ParsedOntology => {
  const graph = data["@graph"] || [];
  const idx = indexGraph(graph);
  const neurons = graph.filter((n) => asType(n["@type"]).includes("neurdf:Neuron"));
  const inScope = rootClass
    ? neurons.filter((n) => reaches(String(n["@id"] ?? ""), rootClass, idx))
    : neurons;
  const cells = inScope.map((n) => buildCell(n, idx));
  cells.sort((a, b) => a.label.localeCompare(b.label));
  return {
    meta: parseOntologyMeta(graph),
    cells,
    hierarchy: buildHierarchy(rootClass, cells, idx),
    predicateDisplay: parsePredicateDisplay(graph),
  };
};

// Readable fallback title for a predicate with no configured label: drop the "has" prefix
// and "Phenotype" suffix, split camelCase into words (design: section titles come from a
// displayLabel, never a raw predicate name). e.g. hasExpressionPhenotype -> "Expression".
const humanizeLocalName = (s: string): string => {
  const core = s.replace(/^has/, "").replace(/Phenotype$/, "");
  const words = core.replace(/([a-z0-9])([A-Z])/g, "$1 $2").trim();
  return words ? words.charAt(0).toUpperCase() + words.slice(1) : s;
};

// Build facets (checkbox filter groups) from the values present across all cells.
// minOptions omits any facet offering fewer than that many distinct values — a facet with a
// single option can't narrow the results, so it is useless as a filter and dropped.
export const buildFacets = (
  cells: CellTerm[],
  localNames: string[],
  titles: Record<string, string>,
  tooltips: Record<string, string> = {},
  minOptions = 1
): Facet[] => {
  const facets: Facet[] = [];
  for (const localName of localNames) {
    const counts = new Map<string, FacetValue>();
    for (const cell of cells) {
      const prop =
        localName === "source"
          ? cell.sources.length
            ? { values: cell.sources }
            : undefined
          : cell.properties[localName];
      if (!prop) continue;
      for (const v of prop.values) {
        const existing = counts.get(v.id);
        if (existing) existing.count += 1;
        else
          counts.set(v.id, {
            key: v.id,
            label: v.label,
            curie: v.curie,
            iri: v.iri,
            kind: v.kind,
            count: 1,
          });
      }
    }
    if (counts.size >= minOptions) {
      facets.push({
        localName,
        title: titles[localName] || humanizeLocalName(localName),
        tooltip: tooltips[localName],
        // Most frequent value first, so the collapsed list shows the ones that
        // actually narrow the results; labels break ties.
        values: [...counts.values()].sort(
          (a, b) => b.count - a.count || a.label.localeCompare(b.label)
        ),
      });
    }
  }
  return facets;
};
