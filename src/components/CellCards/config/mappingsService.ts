// Fetches the Cell Cards mappings document and normalises it into an `OntologyMappings`.
//
// Fetched rather than imported so the binding between the ontology and the views can be changed on
// a running deployment: edit `config/cell-card-mappings.json` next to the served bundle and reload.
// `cellcard-spec/mappings.md` §1.1 calls this "the ontology Grid JSON file", and the document is
// keyed by ontology slug for exactly that reason — a second ontology names its title, its
// description and its tile layout for itself instead of inheriting Precision's.
//
// Document shape:
//   { "version": 1, "default": <section>, "ontologies": { "<slug>": <section> } }
// A document carrying neither `default` nor `ontologies` is read as a single `<section>`, which is
// what a per-ontology URL wants (set VITE_CELLCARD_MAPPINGS_URL to a template containing `{slug}`
// and each ontology is fetched from its own file).
//
// Resolution is layered, weakest first: DEFAULT_MAPPINGS -> the document's `default` ->
// `ontologies[slug]`. Every key is optional at every layer, so a configuration that only wants to
// re-point the title at another annotation says just that.

import type {
  FieldSource,
  MappingChip,
  MappingRelation,
  MappingRow,
  OntologyMappings,
} from "../model/mappings";
import type { RelationEdgeKind } from "../model/types";
import { DEFAULT_MAPPINGS, isRelationEdgeKind, normalizePredicate } from "./mappingDefaults";

// Same-origin by default: `public/config/` is copied into the served root at build time, so the
// file ships with the bundle and can be edited in place afterwards. `{slug}` in the template is
// replaced with the ontology slug, which is how one file per ontology is configured.
export const CELL_CARD_MAPPINGS_URL: string =
  import.meta.env?.VITE_CELLCARD_MAPPINGS_URL || "/config/cell-card-mappings.json";

const urlFor = (slug: string): string =>
  CELL_CARD_MAPPINGS_URL.replace("{slug}", encodeURIComponent(slug));

// --- shape coercion ----------------------------------------------------------
//
// The document is operator-edited JSON, so every read is defensive: a malformed entry is dropped
// and the layer beneath it shows through, rather than taking a widget down with it.

type Raw = Record<string, unknown>;

const asRecord = (value: unknown): Raw | undefined =>
  value && typeof value === "object" && !Array.isArray(value) ? (value as Raw) : undefined;

const asList = (value: unknown): unknown[] | undefined =>
  Array.isArray(value) ? value : undefined;

const asText = (value: unknown): string | undefined =>
  typeof value === "string" && value.trim() ? value.trim() : undefined;

const asCount = (value: unknown): number | undefined =>
  typeof value === "number" && Number.isFinite(value) ? value : undefined;

// A list of predicate keys, kept verbatim: a field's sources are matched against the graph's own
// keys, where the difference between `definition` and `skos:definition` is the whole point.
const asKeys = (value: unknown): string[] | undefined => {
  const single = asText(value);
  if (single) return [single];
  return asList(value)
    ?.map(asText)
    .filter((key): key is string => Boolean(key));
};

const warn = (message: string) => {
  console.warn(`[cell-card mappings] ${message}`);
};

// --- fields ------------------------------------------------------------------

// `"title": "rdfs:label"`, `"title": ["a", "b"]` and
// `"title": { "sources": ["a"], "matchLocalName": true }` all mean the same kind of thing. An
// explicit empty list is a real answer — "nothing feeds this field" — while a value of the wrong
// shape is a mistake, and leaves the layer beneath in place.
const readField = (raw: unknown): FieldSource | undefined => {
  const shorthand = asKeys(raw);
  if (shorthand) return { sources: shorthand };
  const object = asRecord(raw);
  const sources = object && asKeys(object.sources);
  if (!sources) return undefined;
  return object?.matchLocalName === true ? { sources, matchLocalName: true } : { sources };
};

const FIELD_KEYS = [
  "title",
  "description",
  "cellType",
  "parent",
  "literatureCitation",
  "dataCitation",
  "atlasAnnotation",
  "curatorNote",
  "alertNote",
  "temporaryId",
  "generatedLabel",
  "error",
  "sparcTranscriptomicsLink",
  "sparcMap",
  "nervoSensusLink",
  "literalProperties",
  "predicateLabel",
  "predicateDescription",
  "ontologyTitle",
  "ontologyDescription",
  "ontologyVersion",
] as const;

// Fields the views cannot do without. Clearing one is legal — an empty source list is a real
// answer — but it empties the app (no `cellType` finds no cells at all), so it is said out loud
// rather than left to look like a broken deployment.
const ESSENTIAL_FIELDS = ["title", "cellType", "parent"];

const applyFields = (
  base: OntologyMappings["fields"],
  raw: unknown
): OntologyMappings["fields"] => {
  const section = asRecord(raw);
  if (!section) return base;

  const fields = { ...base };
  for (const key of FIELD_KEYS) {
    if (!(key in section)) continue;
    const field = readField(section[key]);
    if (!field) {
      warn(`ignoring field "${key}": expected a predicate, a list of them, or { sources: [...] }`);
      continue;
    }
    if (!field.sources.length && ESSENTIAL_FIELDS.includes(key)) {
      warn(`field "${key}" was cleared — the views have nothing to read it from`);
    }
    fields[key] = field;
  }

  const evidence = asRecord(section.crossNomenclature);
  if (evidence) {
    fields.crossNomenclature = {
      described: asKeys(evidence.described) || base.crossNomenclature.described,
      inferred: asKeys(evidence.inferred) || base.crossNomenclature.inferred,
      proposed: asKeys(evidence.proposed) || base.crossNomenclature.proposed,
    };
  }
  fields.curatedDescriptionSources =
    asCount(section.curatedDescriptionSources) ?? base.curatedDescriptionSources;
  fields.missingValuePrefixes =
    asKeys(section.missingValuePrefixes) || base.missingValuePrefixes;

  return fields;
};

// --- regions -----------------------------------------------------------------

// An entry names its predicate as `"ilxtr:hasSomaLocatedIn"` (shorthand) or as
// `{ "predicate": "ilxtr:hasSomaLocatedIn", … }`. `localName` is accepted too, since that is what
// the model calls it.
const predicateOf = (entry: unknown): string | undefined => {
  const direct = asText(entry);
  if (direct) return normalizePredicate(direct);
  const object = asRecord(entry);
  const named = object && (asText(object.predicate) || asText(object.localName));
  return named ? normalizePredicate(named) : undefined;
};

const TONES: MappingChip["tone"][] = ["class", "subtype", "species"];
const RENDERS: NonNullable<MappingRow["render"]>[] = ["text", "chip"];
const DIRECTIONS: MappingRelation["direction"][] = ["up", "down", "left", "right"];

// Every list reader below shares one rule: an explicit empty list is a real answer ("nothing
// here"), but a non-empty list where every entry failed to parse is a mistake — falling back to
// `undefined` lets the `readX(...) || base.X` call site keep the existing configuration instead
// of silently emptying the region, and `warn` says why.
const droppedEntirely = <T>(label: string, list: unknown[], parsed: T[]): boolean => {
  if (!list.length || parsed.length) return false;
  warn(`ignoring ${label}: no entry in the list could be parsed, keeping the existing configuration`);
  return true;
};

const readChips = (raw: unknown, label: string): MappingChip[] | undefined => {
  const list = asList(raw);
  if (!list) return undefined;
  const chips = list.flatMap((entry) => {
    const localName = predicateOf(entry);
    if (!localName) return [];
    const tone = asText(asRecord(entry)?.tone) as MappingChip["tone"] | undefined;
    // An unrecognised tone falls back to the neutral one rather than dropping the chip: the
    // predicate is the mapping, the colour is decoration.
    return [{ localName, tone: tone && TONES.includes(tone) ? tone : "species" }];
  });
  return droppedEntirely(label, list, chips) ? undefined : chips;
};

const readRows = (raw: unknown, label: string): MappingRow[] | undefined => {
  const list = asList(raw);
  if (!list) return undefined;
  const rows = list.flatMap((entry) => {
    const localName = predicateOf(entry);
    if (!localName) return [];
    const object = asRecord(entry) || {};
    const render = asText(object.render) as MappingRow["render"] | undefined;
    const row: MappingRow = { localName };
    if (render && RENDERS.includes(render)) row.render = render;
    if (object.required === true) row.required = true;
    const rowLabel = asText(object.label);
    if (rowLabel) row.label = rowLabel;
    return [row];
  });
  return droppedEntirely(label, list, rows) ? undefined : rows;
};

const readRelations = (raw: unknown, label: string): MappingRelation[] | undefined => {
  const list = asList(raw);
  if (!list) return undefined;
  const relations = list.flatMap((entry) => {
    const localName = predicateOf(entry);
    const object = asRecord(entry) || {};
    const kind = asText(object.kind);
    const relationLabel = asText(object.label);
    const direction = asText(object.direction) as MappingRelation["direction"] | undefined;
    if (!localName || !kind || !relationLabel || !direction) return [];
    // The SVG draws a fixed set of edge kinds; anything else would render as an invisible edge.
    if (!isRelationEdgeKind(kind)) {
      warn(`ignoring relation "${localName}": unknown edge kind "${kind}"`);
      return [];
    }
    if (!DIRECTIONS.includes(direction)) return [];
    return [{ localName, kind: kind as RelationEdgeKind, label: relationLabel, direction }];
  });
  return droppedEntirely(label, list, relations) ? undefined : relations;
};

const readLegend = (
  raw: unknown,
  label: string
): { kind: RelationEdgeKind; label: string }[] | undefined => {
  const list = asList(raw);
  if (!list) return undefined;
  const legend = list.flatMap((entry) => {
    const object = asRecord(entry) || {};
    const kind = asText(object.kind);
    const entryLabel = asText(object.label);
    if (!kind || !entryLabel || !isRelationEdgeKind(kind)) return [];
    return [{ kind: kind as RelationEdgeKind, label: entryLabel }];
  });
  return droppedEntirely(label, list, legend) ? undefined : legend;
};

// Used by `filters.displayed`: a list of predicate names.
const readPredicateList = (raw: unknown, label: string): string[] | undefined => {
  const list = asList(raw);
  if (!list) return undefined;
  const names = list.map(predicateOf).filter((name): name is string => Boolean(name));
  return droppedEntirely(label, list, names) ? undefined : names;
};

const readPredicates = (raw: unknown): Record<string, { label?: string; tooltip?: string }> => {
  const object = asRecord(raw);
  if (!object) return {};
  const out: Record<string, { label?: string; tooltip?: string }> = {};
  for (const [key, value] of Object.entries(object)) {
    if (key.startsWith("$")) continue; // "$comment" and friends are documentation, not predicates
    const localName = normalizePredicate(key);
    if (!localName) continue;
    // `"ilxtr:hasSomaLocatedIn": "Soma location"` is the shorthand for a label with no tooltip.
    const shorthand = asText(value);
    const entry = asRecord(value);
    const label = shorthand || (entry && asText(entry.label));
    const tooltip = entry && asText(entry.tooltip);
    if (!label && !tooltip) continue;
    out[localName] = { ...(label ? { label } : {}), ...(tooltip ? { tooltip } : {}) };
  }
  return out;
};

const applyRegions = (
  base: OntologyMappings["regions"],
  raw: unknown
): OntologyMappings["regions"] => {
  const section = asRecord(raw);
  if (!section) return base;

  const tile = asRecord(section.tile);
  const filters = asRecord(section.filters);
  const card = asRecord(section.cellCard);
  const definition = asRecord(card?.definition);
  const biological = asRecord(card?.biologicalProperties);
  const anatomical = asRecord(card?.anatomicalContext);
  const graph = asRecord(card?.relationshipGraph);
  const transcriptomic = asRecord(card?.transcriptomicProfile);
  const grouping = asRecord(card?.cellGrouping);

  // `"footer": null` removes it; anything nameable replaces it; anything else is a mistake and
  // keeps the existing footer rather than silently dropping it.
  const footer = ((): OntologyMappings["regions"]["tile"]["footer"] => {
    if (!tile || !("footer" in tile)) return base.tile.footer;
    if (tile.footer === null) return undefined;
    const localName = predicateOf(tile.footer);
    if (!localName) {
      warn("ignoring tile.footer: expected a predicate name or null, keeping the existing configuration");
      return base.tile.footer;
    }
    return { localName };
  })();

  // A present-but-malformed value (wrong type, empty string, an object missing predicate/
  // localName) keeps `fallback` rather than silently clearing the role, matching every other
  // reader's "a mistake leaves the layer beneath in place" rule.
  const role = (key: string, fallback: string | undefined): string | undefined => {
    if (!definition || !(key in definition)) return fallback;
    const value = predicateOf(definition[key]);
    if (!value) {
      warn(`ignoring cellCard.definition.${key}: expected a predicate name, keeping the existing configuration`);
      return fallback;
    }
    return value;
  };

  return {
    tile: {
      headerChips: readChips(tile?.headerChips, "tile.headerChips") || base.tile.headerChips,
      rows: readRows(tile?.rows, "tile.rows") || base.tile.rows,
      footer,
    },
    filters: {
      minOptions: asCount(filters?.minOptions) ?? base.filters.minOptions,
      displayed:
        readPredicateList(filters?.displayed, "filters.displayed") || base.filters.displayed,
    },
    cellCard: {
      definition: {
        cellClass: role("cellClass", base.cellCard.definition.cellClass),
        species: role("species", base.cellCard.definition.species),
        somaLocation: role("somaLocation", base.cellCard.definition.somaLocation),
        markerGenes: role("markerGenes", base.cellCard.definition.markerGenes),
        minPredicates:
          asCount(definition?.minPredicates) ?? base.cellCard.definition.minPredicates,
      },
      biologicalProperties: {
        rows:
          readRows(biological?.rows, "cellCard.biologicalProperties.rows") ||
          base.cellCard.biologicalProperties.rows,
      },
      anatomicalContext: {
        rows:
          readRows(anatomical?.rows, "cellCard.anatomicalContext.rows") ||
          base.cellCard.anatomicalContext.rows,
      },
      relationshipGraph: {
        predicates:
          readRelations(graph?.predicates, "cellCard.relationshipGraph.predicates") ||
          base.cellCard.relationshipGraph.predicates,
        legend:
          readLegend(graph?.legend, "cellCard.relationshipGraph.legend") ||
          base.cellCard.relationshipGraph.legend,
        subClassOfLabel:
          asText(graph?.subClassOfLabel) || base.cellCard.relationshipGraph.subClassOfLabel,
        assertedSubClassOfLabel:
          asText(graph?.assertedSubClassOfLabel) ||
          base.cellCard.relationshipGraph.assertedSubClassOfLabel,
      },
      transcriptomicProfile: {
        markerGenePredicate:
          predicateOf(transcriptomic?.markerGenePredicate) ||
          base.cellCard.transcriptomicProfile.markerGenePredicate,
      },
      cellGrouping: {
        axonPredicate:
          predicateOf(grouping?.axonPredicate) || base.cellCard.cellGrouping.axonPredicate,
      },
    },
  };
};

// --- layering ----------------------------------------------------------------

// `predicates` merges per predicate *and* per field within it, so the documented relabel
// shorthand (naming just a label) does not erase that predicate's built-in tooltip.
const mergePredicates = (
  base: Record<string, { label?: string; tooltip?: string }>,
  overrides: Record<string, { label?: string; tooltip?: string }>
): Record<string, { label?: string; tooltip?: string }> => {
  const merged = { ...base };
  for (const [key, value] of Object.entries(overrides)) {
    merged[key] = { ...merged[key], ...value };
  }
  return merged;
};

// Apply one document section over the mappings resolved so far. Absent keys leave the layer
// beneath untouched; a present key replaces it wholesale (a configuration listing tile rows is
// stating the whole row set, not appending to the default one). `predicates` is the exception: it
// merges per predicate, so naming one label does not erase the other twelve.
const applySection = (base: OntologyMappings, raw: unknown): OntologyMappings => {
  const section = asRecord(raw);
  if (!section) return base;
  return {
    fields: applyFields(base.fields, section.fields),
    predicates: mergePredicates(base.predicates, readPredicates(section.predicates)),
    regions: applyRegions(base.regions, section.regions),
  };
};

// Resolve a whole document for one ontology: the document's `default` section, then its
// per-ontology one, over the built-in mappings.
export const resolveMappings = (document: unknown, slug: string): OntologyMappings => {
  const root = asRecord(document);
  if (!root) return DEFAULT_MAPPINGS;
  const ontologies = asRecord(root.ontologies);
  // A document with neither key *is* the section — the one-file-per-ontology layout.
  const shared = "default" in root || ontologies ? root.default : root;
  return applySection(applySection(DEFAULT_MAPPINGS, shared), ontologies?.[slug]);
};

// --- fetch -------------------------------------------------------------------

const fetchDocument = async (url: string): Promise<unknown> => {
  const res = await fetch(url, { headers: { Accept: "application/json" }, credentials: "omit" });
  if (!res.ok) throw new Error(`HTTP ${res.status} fetching ${url}`);
  const text = await res.text();
  // A missing path under the SPA answers with index.html (HTTP 200), not JSON — the same trap the
  // ontology loader guards against.
  if (text.trimStart().startsWith("<")) {
    throw new Error(`Expected JSON but received HTML from ${url}`);
  }
  return JSON.parse(text);
};

// One in-flight fetch per resolved URL, dropped again on failure so a later navigation retries
// instead of being served the fallback for the rest of the session.
const documents = new Map<string, Promise<unknown>>();

const getDocument = (url: string): Promise<unknown> => {
  const pending = documents.get(url);
  if (pending) return pending;
  const request = fetchDocument(url).catch((err) => {
    documents.delete(url);
    throw err;
  });
  documents.set(url, request);
  return request;
};

// Resolved mappings per slug, so `loadOntology` gets a stable object identity on repeat calls and
// can tell "same configuration" from "the configuration finally loaded" by reference.
const resolved = new Map<string, OntologyMappings>();

/**
 * The mappings for one ontology. Never rejects: a document that cannot be fetched or parsed leaves
 * the app on `DEFAULT_MAPPINGS`, which is what it renders today, and logs why.
 */
export const loadMappings = async (slug: string): Promise<OntologyMappings> => {
  const cached = resolved.get(slug);
  if (cached) return cached;
  const url = urlFor(slug);
  try {
    const mappings = resolveMappings(await getDocument(url), slug);
    resolved.set(slug, mappings);
    return mappings;
  } catch (err) {
    warn(`${err instanceof Error ? err.message : err} — falling back to the built-in mappings`);
    return DEFAULT_MAPPINGS;
  }
};
