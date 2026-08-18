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
import type { FieldSource, FieldSources } from "../components/CellCards/model/mappings";
import { DEFAULT_FIELD_SOURCES } from "../components/CellCards/config/mappingDefaults";

// Which source fills which model field is configuration, not code: `FieldSources` binds `title`,
// `description`, the citation and every annotation to an ordered list of predicates, so an
// ontology that names its terms with `skos:prefLabel` needs no edit here. The model's own shape is
// not configurable — a `CellTerm` always has a title and a description, whatever fills them.
// See components/CellCards/model/mappings.ts and config/mappingDefaults.ts for the built-in list.

// --- label + value helpers -------------------------------------------------

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

// --- prefix table: the parsed file's own @context ---------------------------

// Prefix -> base IRI, read from the graph's @context. Every curie <-> IRI conversion below goes
// through it, so no prefix is known to the front end: `npokb:997` is `@context.npokb` + `997`,
// i.e. http://uri.interlex.org/npo/uris/neurons/997, and an ontology that names its terms with a
// different prefix needs no edit here. Every CURIE prefix the shipped graph uses is declared in
// its @context.
export type Prefixes = Record<string, string>;

// A JSON-LD @context mixes prefix declarations ("npokb": ".../neurons/") with term definitions
// ("definition": ".../IAO_0000115"), and either may be written as an object ({"@id": …}). Both
// are kept: expansion only looks up the part before a ":", where a term name cannot appear, and
// compaction requires a non-empty local part, which a term's own IRI cannot leave behind.
export const contextPrefixes = (context?: Record<string, unknown>): Prefixes => {
  const out: Prefixes = {};
  for (const [key, value] of Object.entries(context || {})) {
    if (key.startsWith("@")) continue; // @vocab / @base / @version are not prefixes
    const base =
      typeof value === "string"
        ? value
        : value && typeof value === "object"
          ? firstString((value as { "@id"?: unknown })["@id"])
          : undefined;
    if (base) out[key] = base;
  }
  return out;
};

// Compact an @id (curie or IRI) into { curie, kind } against the @context.
const classify = (id: string, prefixes: Prefixes): { curie: string; kind: RefKind } => {
  if (!isIri(id)) {
    // already a curie like "npokb:1067", "NCBIGene:233222", "ilxtr:SensoryPhenotype"
    const prefix = id.split(":")[0];
    return { curie: id, kind: kindForPrefix(prefix, id) };
  }
  // Full IRI: compact it against the longest declared base that covers it, since a context
  // routinely declares both a family and its members (".../obo/" and ".../obo/UBERON_") and only
  // the longer one names the term. The base must leave a local part behind, which is what stops a
  // term definition — an IRI complete in itself — from being read as a prefix.
  let best = "";
  let bestPrefix = "";
  for (const [prefix, base] of Object.entries(prefixes)) {
    if (base.length > best.length && id.length > base.length && id.startsWith(base)) {
      best = base;
      bestPrefix = prefix;
    }
  }
  if (best) {
    return { curie: `${bestPrefix}:${id.slice(best.length)}`, kind: kindForPrefix(bestPrefix, id) };
  }
  const tail = id.split(/[/#]/).filter(Boolean).pop() || id;
  return { curie: tail, kind: "external" };
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

// Full IRI for linking out: expand a curie through the @context, pass an IRI through. "" when the
// file declares no base for the prefix, which the UI reads as "not addressable" and renders as
// plain text rather than a dead link.
const toIri = (id: string, prefixes: Prefixes): string => {
  if (isIri(id)) return id;
  const [prefix, ...rest] = id.split(":");
  const base = prefixes[prefix];
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

// A predicate key reduced to its local name, so a source can be matched whatever prefix the file
// wrote it under. "rdfs:label" -> "label", "http://…/hasSPARCMap" -> "hasSPARCMap".
const localNameOf = (key: string, prefixes: Prefixes): string =>
  classify(key, prefixes).curie.split(":").pop() || "";

// Where one predicate's values land on the model. Annotation fields are single-purpose — one
// predicate fills one slot — so the configured sources are inverted once into a lookup the
// per-node loop can hit directly, instead of testing every key against every field.
type FieldTarget =
  | { slot: "sources" }
  | { slot: "refs"; field: "dataCitations" }
  | { slot: "text"; field: "atlasAnnotation" | "curatorNotes" | "alertNotes" }
  | { slot: "links"; field: "sparcTranscriptomicsLinks" | "sparcMaps" | "nervoSensusLinks" }
  | { slot: "temporaryId" }
  | { slot: "generatedLabel" }
  | { slot: "errors" }
  | { slot: "property" }
  | { slot: "mapping"; evidence: MappingEvidence };

interface ParseContext {
  idx: Index;
  prefixes: Prefixes;
  fields: FieldSources;
  // Exact key -> target, and (for fields declaring `matchLocalName`) local name -> target.
  exact: Map<string, FieldTarget>;
  local: Map<string, FieldTarget>;
  // Upper-cased "this phenotype is not specified" id prefixes.
  missing: string[];
}

const buildContext = (
  idx: Index,
  prefixes: Prefixes,
  fields: FieldSources
): ParseContext => {
  const exact = new Map<string, FieldTarget>();
  const local = new Map<string, FieldTarget>();

  // First registration wins, so a key claimed by two fields behaves as the ordered checks it
  // replaces did.
  const claim = (field: FieldSource, target: FieldTarget) => {
    for (const key of field.sources) {
      if (!exact.has(key)) exact.set(key, target);
      if (field.matchLocalName) {
        const name = localNameOf(key, prefixes);
        if (name && !local.has(name)) local.set(name, target);
      }
    }
  };

  claim(fields.literatureCitation, { slot: "sources" });
  claim(fields.dataCitation, { slot: "refs", field: "dataCitations" });
  claim(fields.atlasAnnotation, { slot: "text", field: "atlasAnnotation" });
  claim(fields.curatorNote, { slot: "text", field: "curatorNotes" });
  claim(fields.alertNote, { slot: "text", field: "alertNotes" });
  claim(fields.temporaryId, { slot: "temporaryId" });
  claim(fields.generatedLabel, { slot: "generatedLabel" });
  claim(fields.error, { slot: "errors" });
  claim(fields.sparcTranscriptomicsLink, { slot: "links", field: "sparcTranscriptomicsLinks" });
  claim(fields.sparcMap, { slot: "links", field: "sparcMaps" });
  claim(fields.nervoSensusLink, { slot: "links", field: "nervoSensusLinks" });
  for (const [evidence, sources] of Object.entries(fields.crossNomenclature)) {
    claim({ sources }, { slot: "mapping", evidence: evidence as MappingEvidence });
  }
  // Literal-valued predicates surfaced as properties (not neurdf refs), so they are facetable and
  // can fill a tile row.
  claim(fields.literalProperties, { slot: "property" });

  return {
    idx,
    prefixes,
    fields,
    exact,
    local,
    missing: fields.missingValuePrefixes.map((p) => p.toUpperCase()),
  };
};

const targetFor = (key: string, ctx: ParseContext): FieldTarget | undefined => {
  const direct = ctx.exact.get(key);
  if (direct) return direct;
  if (!ctx.local.size || key.startsWith("neurdf.")) return undefined; // a phenotype family
  return ctx.local.get(localNameOf(key, ctx.prefixes));
};

// The first of a field's sources this node actually carries a string for, and how far down the
// fallback chain it was found (which is what tells a curated definition from a generated one).
const firstFieldText = (
  node: GraphNode | undefined,
  field: FieldSource,
  ctx: ParseContext
): { text: string; rank: number } | undefined => {
  if (!node) return undefined;
  for (let rank = 0; rank < field.sources.length; rank++) {
    const key = field.sources[rank];
    const direct = firstString(node[key]);
    if (direct) return { text: direct, rank };
    if (!field.matchLocalName) continue;
    const wanted = localNameOf(key, ctx.prefixes);
    for (const candidate of Object.keys(node)) {
      if (localNameOf(candidate, ctx.prefixes) !== wanted) continue;
      const text = firstString(node[candidate]);
      if (text) return { text, rank };
    }
  }
  return undefined;
};

// The same walk as `firstFieldText`, for a field that names a URL rather than saying something:
// it answers an absolute IRI instead of the text. Both authoring shapes count — a reference
// (`{"@id": …}`, how the graph writes MIRO:development_community) and an `xsd:anyURI` literal
// (how this ontology's curators write every other link predicate, e.g. ilx:hasNervoSensusLink).
const firstFieldIri = (
  node: GraphNode | undefined,
  field: FieldSource,
  ctx: ParseContext
): string | undefined => {
  if (!node) return undefined;
  const linkOf = (value: unknown): string | undefined => {
    for (const item of Array.isArray(value) ? value : [value]) {
      const id =
        item && typeof item === "object" && !("@value" in (item as object))
          ? String((item as JsonLdRefish)["@id"] ?? "")
          : firstString(item);
      const iri = id && toIri(id, ctx.prefixes);
      if (iri) return iri;
    }
    return undefined;
  };
  for (const key of field.sources) {
    const direct = linkOf(node[key]);
    if (direct) return direct;
    if (!field.matchLocalName) continue;
    const wanted = localNameOf(key, ctx.prefixes);
    for (const candidate of Object.keys(node)) {
      if (localNameOf(candidate, ctx.prefixes) !== wanted) continue;
      const iri = linkOf(node[candidate]);
      if (iri) return iri;
    }
  }
  return undefined;
};

// Some cells carry a "TEMP:MISSING_" placeholder meaning the phenotype is *not specified*. It is
// not a real term, so it must never surface as a value / facet option / tile chip.
const isMissingSentinel = (id: string, ctx: ParseContext): boolean => {
  const upper = id.toUpperCase();
  return ctx.missing.some((prefix) => upper.startsWith(prefix));
};

const labelFor = (id: string, ctx: ParseContext): string =>
  firstFieldText(ctx.idx.get(id), ctx.fields.title, ctx)?.text ||
  classify(id, ctx.prefixes).curie; // fall back to a compact curie when no label exists

// Turn a predicate value (ref object, array, @list, or literal) into ResolvedRefs.
//
// `@list` matters: the union/intersection families serialise their members as a JSON-LD list
// ({"@list":[{...},{...}]}), and `neurdf.eqv.uo:hasSomaLocatedIn` is the *only* soma-location
// predicate on 61 of the 161 Precision cells. Treating a list object as an unrecognised value
// silently dropped the property for all of them.
const resolveValue = (raw: unknown, ctx: ParseContext): ResolvedRef[] => {
  const out: ResolvedRef[] = [];
  const push = (item: unknown) => {
    if (item && typeof item === "object" && "@list" in (item as object)) {
      const list = (item as { "@list"?: unknown })["@list"];
      if (Array.isArray(list)) list.forEach(push);
      return;
    }
    if (item && typeof item === "object" && "@id" in (item as object)) {
      const id = String((item as JsonLdRefish)["@id"]);
      if (isBlankNode(id) || isMissingSentinel(id, ctx)) return; // skip restriction blanks + "not specified" sentinels
      const { curie, kind } = classify(id, ctx.prefixes);
      out.push({ id, curie, label: labelFor(id, ctx), iri: toIri(id, ctx.prefixes), kind });
    } else if (item && typeof item === "object" && "@value" in (item as object)) {
      // JSON-LD literal object, e.g. {"@value":"foo"} / {"@value":"foo","@language":"en"}
      const v = (item as { "@value"?: unknown })["@value"];
      const s = v == null ? "" : String(v);
      if (s) out.push({ id: s, curie: s, label: s, iri: "", kind: "literal" });
    } else if (typeof item === "string") {
      if (isMissingSentinel(item, ctx)) return;
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

// The parents a node asserts, through whichever relation `fields.parent` binds (rdfs:subClassOf).
const subClassRefs = (node: GraphNode | undefined, ctx: ParseContext): string[] => {
  if (!node) return [];
  return ctx.fields.parent.sources.flatMap((key) => {
    const s = node[key];
    const arr = Array.isArray(s) ? s : [s];
    return arr
      .map((x) => (x && typeof x === "object" ? String((x as JsonLdRefish)["@id"] ?? "") : ""))
      .filter(Boolean);
  });
};

// Does `startId` reach `targetId` through the transitive parent chain?
const reaches = (startId: string, targetId: string, ctx: ParseContext): boolean => {
  const seen = new Set<string>();
  const stack = subClassRefs(ctx.idx.get(startId), ctx);
  while (stack.length) {
    const cur = stack.pop() as string;
    if (cur === targetId) return true;
    if (seen.has(cur)) continue;
    seen.add(cur);
    stack.push(...subClassRefs(ctx.idx.get(cur), ctx));
  }
  return false;
};

// --- public API -------------------------------------------------------------

const mergeValues = (existing: ResolvedRef[], incoming: ResolvedRef[]): ResolvedRef[] => {
  const byId = new Map(existing.map((r) => [r.id, r]));
  for (const r of incoming) if (!byId.has(r.id)) byId.set(r.id, r);
  return [...byId.values()];
};

const buildCell = (node: GraphNode, ctx: ParseContext): CellTerm => {
  const id = String(node["@id"]);
  const { curie } = classify(id, ctx.prefixes);
  const properties: Record<string, CellProperty> = {};
  const negated: Record<string, CellProperty> = {};
  const annotations = emptyAnnotations();
  const mappings: CellMapping[] = [];
  let sources: ResolvedRef[] = [];

  for (const [key, raw] of Object.entries(node)) {
    // Where this predicate lands is `fields`, inverted into a lookup by `buildContext`. Annotations
    // are deliberately kept off `properties`: everything on `properties` becomes a facet in the
    // grid sidebar as soon as the "Displayed properties" toggle is off, and a curator note or a
    // deep-link URL is not a phenotype.
    const target = targetFor(key, ctx);
    if (target) {
      switch (target.slot) {
        case "sources":
          sources = resolveValue(raw, ctx); // a cell may cite several publications
          break;
        case "refs":
          annotations[target.field] = resolveValue(raw, ctx);
          break;
        case "text":
          // These are plain strings in the graph; resolveValue normalises the literal shapes.
          annotations[target.field] = resolveValue(raw, ctx).map((r) => r.label);
          break;
        case "links":
          // The same link can be asserted under more than one prefix; merge rather than overwrite.
          annotations[target.field] = mergeValues(
            annotations[target.field],
            resolveValue(raw, ctx)
          );
          break;
        case "temporaryId":
          annotations.temporaryId = resolveValue(raw, ctx)[0]?.curie;
          break;
        case "generatedLabel":
          annotations.generatedLabel = firstString(raw);
          break;
        case "errors":
          annotations.errors = resolveValue(raw, ctx).map((r) => r.curie);
          break;
        case "mapping":
          for (const ref of resolveValue(raw, ctx)) {
            // A cell can be related to the same record by more than one relation; the stronger
            // claim (an explicit description) wins over an inferred mapping.
            const prev = mappings.find((m) => m.ref.id === ref.id);
            if (prev) {
              if (target.evidence === "described") prev.evidence = target.evidence;
              continue;
            }
            mappings.push({
              ref,
              evidence: target.evidence,
              source: trailingParenthetical(ref.label),
            });
          }
          break;
        case "property": {
          // Keyed by local name, as every `CellProperty` is.
          const local = localNameOf(key, ctx.prefixes);
          const values = resolveValue(raw, ctx);
          if (local && values.length) {
            properties[local] = { localName: local, family: "eqv", negated: false, values };
          }
          break;
        }
      }
      continue;
    }
    const parsed = parseNeurdfKey(key);
    if (!parsed) continue; // skip @id/@type/owl:*/rdfs:*/etc.
    const values = resolveValue(raw, ctx);
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

  const definition = definitionOf(node, ctx);

  return {
    id,
    curie,
    iri: toIri(id, ctx.prefixes),
    label: labelFor(id, ctx),
    rdfTypes: rdfTypesOf(node, ctx.prefixes),
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
const rdfTypesOf = (node: GraphNode, prefixes: Prefixes): string[] => {
  const all = asType(node["@type"]).map((t) => classify(t, prefixes).curie);
  const owl = all.filter((t) => t.startsWith("owl:"));
  return owl.length ? owl : all;
};

// Everything past `curatedDescriptionSources` is reported as uncurated, so the UI can say where
// the text came from instead of passing generated output off as a definition.
const definitionOf = (
  node: GraphNode,
  ctx: ParseContext
): { text: string; curated: boolean } | undefined => {
  const hit = firstFieldText(node, ctx.fields.description, ctx);
  return hit
    ? { text: hit.text, curated: hit.rank < ctx.fields.curatedDescriptionSources }
    : undefined;
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
  ctx: ParseContext
): HierarchyNode[] => {
  if (!rootClass) return [];
  const inScope = new Set(cells.map((c) => c.id));
  const parentsOf = new Map<string, string[]>();
  for (const cell of cells) {
    parentsOf.set(
      cell.id,
      subClassRefs(ctx.idx.get(cell.id), ctx).filter((p) => p === rootClass || inScope.has(p))
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
      label: cell ? cell.label : labelFor(termId, ctx),
      curie: cell ? cell.curie : classify(termId, ctx.prefixes).curie,
      iri: cell ? cell.iri : toIri(termId, ctx.prefixes),
      children: kids
        .map((kid) => nodeAt(kid, `${path}/${kid}`, nextSeen))
        .sort((a, b) => a.label.localeCompare(b.label)),
    };
  };

  return [nodeAt(rootClass, rootClass, new Set())];
};

// The ontology header. Title, description, version and community link are fixed fields of the
// model; which annotation fills each is the matching `fields.ontology*` binding.
export const parseOntologyMeta = (
  graph: GraphNode[],
  fields: FieldSources = DEFAULT_FIELD_SOURCES,
  prefixes: Prefixes = {}
): OntologyMeta => {
  // No graph index: every field here is a literal or an external reference on the ontology node,
  // never a node the graph has to be walked for.
  const ctx = buildContext(new Map(), prefixes, fields);
  const onto = graph.find((n) => asType(n["@type"]).includes("owl:Ontology"));
  const title = firstFieldText(onto, fields.ontologyTitle, ctx)?.text || "Ontology";
  return {
    iri: onto ? String(onto["@id"] ?? "") : "",
    title,
    description: firstFieldText(onto, fields.ontologyDescription, ctx)?.text,
    version: firstFieldText(onto, fields.ontologyVersion, ctx)?.text,
    communityLink: firstFieldIri(onto, fields.ontologyCommunityLink, ctx),
  };
};

// Parse the graph into cells that are (transitively) subClassOf `rootClass`.
// Row labels and tooltips ship inside the ontology: the ilxtr:* property nodes carry
// ilxtr:displayLabel ("Soma location") and ilxtr:shortDefinition, which between them cover 14
// of the 15 neurdf local names Precision cells use. Reading them here keeps the UI's wording
// in the curators' hands instead of a hardcoded map in the front end — the mappings document's
// `predicates` section is only the fallback for what the file omits. Which annotation carries
// each is itself a field binding (`fields.predicateLabel` / `predicateDescription`).
//
// Keyed by *local name* (`hasSomaLocatedIn`), because that is how a CellProperty is keyed,
// while the annotation lives on the `ilxtr:hasSomaLocatedIn` node.
export const parsePredicateDisplay = (
  graph: GraphNode[],
  prefixes: Prefixes = {},
  fields: FieldSources = DEFAULT_FIELD_SOURCES
): Record<string, PredicateDisplay> => {
  // No graph index: a display annotation is a literal on the property node, never a reference.
  const ctx = buildContext(new Map(), prefixes, fields);
  const out: Record<string, PredicateDisplay> = {};
  for (const node of graph) {
    const id = node["@id"];
    if (typeof id !== "string") continue;
    const label = firstFieldText(node, fields.predicateLabel, ctx)?.text;
    const description = firstFieldText(node, fields.predicateDescription, ctx)?.text;
    if (!label && !description) continue;
    // "ilxtr:hasSomaLocatedIn" and the expanded IRI both reduce to the same local name.
    const localName = localNameOf(id, prefixes);
    if (!localName) continue;
    out[localName] = {
      localName,
      label: label || out[localName]?.label || humanizeLocalName(localName),
      description: description || out[localName]?.description,
    };
  }
  return out;
};

export const parseNeurdf = (
  data: OntologyGraph,
  rootClass: string,
  fields: FieldSources = DEFAULT_FIELD_SOURCES
): ParsedOntology => {
  const graph = data["@graph"] || [];
  // The file's own prefix declarations, which every curie <-> IRI conversion below reads.
  const prefixes = contextPrefixes(data["@context"]);
  const idx = indexGraph(graph);
  const ctx = buildContext(idx, prefixes, fields);
  const cellTypes = fields.cellType.sources;
  const neurons = graph.filter((n) => {
    const types = asType(n["@type"]);
    return cellTypes.some((t) => types.includes(t));
  });
  const inScope = rootClass
    ? neurons.filter((n) => reaches(String(n["@id"] ?? ""), rootClass, ctx))
    : neurons;
  const cells = inScope.map((n) => buildCell(n, ctx));
  cells.sort((a, b) => a.label.localeCompare(b.label));
  return {
    meta: parseOntologyMeta(graph, fields, prefixes),
    cells,
    hierarchy: buildHierarchy(rootClass, cells, ctx),
    predicateDisplay: parsePredicateDisplay(graph, prefixes, fields),
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
