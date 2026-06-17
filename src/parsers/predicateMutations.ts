// Helpers to turn a single add/edit/delete of a predicate triple into the
// triple-diff payload the patch endpoint expects:
//   { "add": [[s, p, o], ...], "del": [[s, p, o], ...] }
// where o = { "type": "uri" | "literal", "value": ... }.

type Json = any;

// Flatten a JSON-LD object value to a comparable string (mirrors predicateParser).
const flatten = (v: Json): string => {
  if (v == null) return "";
  if (typeof v === "string") return v;
  if (typeof v === "object") {
    if (v["@id"]) return String(v["@id"]);
    if (v["@value"] != null) return String(v["@value"]);
    return JSON.stringify(v);
  }
  return String(v);
};

// Locate the focus node inside a term JSON-LD document (used to resolve the
// triple subject IRI when a row doesn't carry one).
export const focusNodeFromJsonLd = (jsonData: Json): Json | null => {
  if (!jsonData) return null;
  const graph = jsonData["@graph"];
  if (Array.isArray(graph) && graph.length) {
    const cls = graph.find(
      (n: Json) => flatten(n?.["@type"]).toLowerCase().includes("class")
    );
    return cls || graph[0];
  }
  return jsonData;
};

export type TripleOp = "add" | "edit" | "delete";

export interface MutationInput {
  subject?: string; // triple subject IRI (falls back to focus node @id)
  predicate: string; // predicate IRI / curie
  op: TripleOp;
  kind?: "term" | "text"; // term -> object type "uri", text -> "literal"
  oldValue?: string; // current object value (edit/delete)
  newValue?: string; // new object value (add/edit)
}

export type RdfObject = {
  type: "uri" | "literal";
  value: string;
  lang?: string;
  datatype?: string;
};
export type Triple = [string, string, RdfObject];
export interface TripleDiff {
  add: Triple[];
  del: Triple[];
}

// Resolve the EXACT object as stored on the focus node, so a `del` triple
// matches precisely (including language/datatype). Returns null when the value
// can't be found (caller falls back to a reconstructed object).
export const resolveStoredObject = (
  node: Json,
  predicateKey: string,
  oldValue: string
): RdfObject | null => {
  if (!node) return null;
  const cur = node[predicateKey] ?? node[String(predicateKey).trim()];
  const arr: Json[] = cur == null ? [] : Array.isArray(cur) ? cur : [cur];
  const target = String(oldValue ?? "").trim();
  const match = arr.find((e) => flatten(e).trim() === target);
  if (match == null) return null;

  if (typeof match === "string") return { type: "literal", value: match };
  if (match["@id"]) return { type: "uri", value: String(match["@id"]) };
  if (match["@value"] != null) {
    const obj: RdfObject = { type: "literal", value: String(match["@value"]) };
    if (match["@language"]) obj.lang = String(match["@language"]);
    if (match["@type"]) obj.datatype = String(match["@type"]);
    return obj;
  }
  return { type: "literal", value: flatten(match) };
};

// Expand a curie / @context term to a full IRI so it matches the stored RDF.
// e.g. "rdfs:label" -> "http://www.w3.org/2000/01/rdf-schema#label".
export const expandIri = (term: string, context: Json = {}): string => {
  if (!term) return term;
  if (/^https?:\/\//i.test(term)) return term; // already a full IRI
  if (term === "@id" || term === "@type") return term;

  // Direct term mapping in the @context (term -> IRI or { "@id": IRI }).
  const direct = context[term];
  if (direct) return typeof direct === "string" ? direct : direct["@id"] || term;

  // prefix:local (or dotted prefix.local) -> contextBase + local.
  const sepIdx = term.includes(":") ? term.indexOf(":") : term.includes(".") ? term.indexOf(".") : -1;
  if (sepIdx > 0) {
    const prefix = term.slice(0, sepIdx);
    const local = term.slice(sepIdx + 1);
    const base = context[prefix];
    const baseStr = typeof base === "string" ? base : base?.["@id"];
    if (baseStr) return baseStr + local;
  }

  // Fallback to @vocab if present.
  const vocab = context["@vocab"];
  return vocab ? vocab + term : term;
};

// Build the { add, del } triple diff for a single mutation.
// `oldObject` (when supplied) is the exact stored object resolved from the
// graph and is used verbatim for `del` so it matches precisely.
export const buildTripleDiff = (
  subject: string,
  input: MutationInput & { oldObject?: RdfObject | null },
  context: Json = {}
): TripleDiff => {
  const { predicate, op, kind = "text", oldValue, newValue, oldObject } = input;
  const objType: RdfObject["type"] = kind === "term" ? "uri" : "literal";

  // Trim + fully expand subject/predicate IRIs (trailing whitespace and bare
  // curies are the two things the endpoint will silently fail to match).
  const subj = String(subject).trim();
  const p = expandIri(predicate, context).trim();

  // Exact stored object for del (preferred), else a reconstructed one.
  const delObj: RdfObject | null =
    oldObject ||
    (oldValue != null ? { type: objType, value: oldValue } : null);
  if (delObj && delObj.type === "uri") delObj.value = expandIri(delObj.value, context).trim();

  // New object for add: same type as the old one, carrying lang/datatype.
  const addObj: RdfObject | null =
    newValue != null
      ? {
          type: delObj?.type || objType,
          value:
            (delObj?.type || objType) === "uri"
              ? expandIri(newValue, context).trim()
              : newValue,
          ...(delObj?.lang ? { lang: delObj.lang } : {}),
          ...(delObj?.datatype ? { datatype: delObj.datatype } : {}),
        }
      : null;

  const add: Triple[] = [];
  const del: Triple[] = [];

  if (op === "add") {
    if (addObj) add.push([subj, p, addObj]);
  } else if (op === "delete") {
    if (delObj) del.push([subj, p, delObj]);
  } else if (op === "edit") {
    if (delObj) del.push([subj, p, delObj]);
    if (addObj) add.push([subj, p, addObj]);
  }

  return { add, del };
};
