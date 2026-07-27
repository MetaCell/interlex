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
  OntologyMeta,
  ParsedOntology,
  Facet,
  FacetValue,
} from "../components/CellCards/model/types";

// --- label + value helpers -------------------------------------------------

// Display-label sources, ordered most-human-readable → machine-id last (spec §2.2 / §8).
// Try the curated short label, then the standard label, then a title; only when a node
// carries none of these do we fall back to its CURIE (the machine id). ilxtr:genLabel is
// deliberately excluded — it is the verbose machine-generated string, never a title.
const LABEL_KEYS = ["ilxtr:localLabel", "rdfs:label", "dc:title", "dcterms:title"];

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

// Turn a predicate value (ref object, array, or literal) into ResolvedRefs.
const resolveValue = (raw: unknown, idx: Index): ResolvedRef[] => {
  const out: ResolvedRef[] = [];
  const push = (item: unknown) => {
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

// "neurdf.eqv:hasSomaLocatedIn" -> { family:'eqv', negated:false, localName:'hasSomaLocatedIn' }
// "neurdf.eqv.neg:hasMorphologicalPhenotype" -> { family:'eqv', negated:true, ... }
const parseNeurdfKey = (
  key: string
): { family: "eqv" | "ent"; negated: boolean; localName: string } | null => {
  if (!key.startsWith("neurdf.")) return null;
  const [prefix, local] = key.split(":");
  if (!local) return null;
  const fam = prefix.replace("neurdf.", ""); // "eqv" | "ent" | "eqv.neg" | "ent.neg"
  return {
    family: fam.startsWith("ent") ? "ent" : "eqv",
    negated: fam.endsWith(".neg"),
    localName: local,
  };
};

// A few literal-valued ilxtr predicates we surface directly (not neurdf refs).
const LITERAL_PREDICATES: Record<string, string> = {
  "ilxtr:neurondmBaseClass": "neurondmBaseClass",
};

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
  let sources: ResolvedRef[] = [];

  for (const [key, raw] of Object.entries(node)) {
    if (key === "ilxtr:literatureCitation") {
      sources = resolveValue(raw, idx); // a cell may cite several publications
      continue;
    }
    if (key in LITERAL_PREDICATES) {
      const local = LITERAL_PREDICATES[key];
      const values = resolveValue(raw, idx);
      if (values.length) properties[local] = { localName: local, family: "eqv", negated: false, values };
      continue;
    }
    const parsed = parseNeurdfKey(key);
    if (!parsed) continue; // skip @id/@type/owl:*/rdfs:*/ilxtr:error/genLabel/etc.
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
        values: mergeValues(prev.values, values),
      };
    }
  }

  return {
    id,
    curie,
    iri: toIri(id),
    label: labelFor(id, idx),
    properties,
    negated,
    sources,
  };
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
export const parseNeurdf = (data: OntologyGraph, rootClass: string): ParsedOntology => {
  const graph = data["@graph"] || [];
  const idx = indexGraph(graph);
  const neurons = graph.filter((n) => asType(n["@type"]).includes("neurdf:Neuron"));
  const inScope = rootClass
    ? neurons.filter((n) => reaches(String(n["@id"] ?? ""), rootClass, idx))
    : neurons;
  const cells = inScope.map((n) => buildCell(n, idx));
  cells.sort((a, b) => a.label.localeCompare(b.label));
  return { meta: parseOntologyMeta(graph), cells };
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
        else counts.set(v.id, { key: v.id, label: v.label, iri: v.iri, kind: v.kind, count: 1 });
      }
    }
    if (counts.size >= minOptions) {
      facets.push({
        localName,
        title: titles[localName] || humanizeLocalName(localName),
        tooltip: tooltips[localName],
        values: [...counts.values()].sort((a, b) => a.label.localeCompare(b.label)),
      });
    }
  }
  return facets;
};
