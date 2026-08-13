import { getTerm } from "./termParser";
import { shortenIri } from "../configuration/predicateConfig";

/**
 * Parser for a term *version* (`/<group>/<term>/versions/<identity>`).
 *
 * That endpoint serves expanded JSON-LD — a flat array of nodes, full IRIs for keys, and every
 * object wrapped in a list of `{"@value"}` / `{"@id"}` — while the rest of the app works on the
 * compact `{"@graph": [...]}` shape that termParser understands. Rather than a second term
 * parser, this compacts a version into that shape and hands it to the existing one, so a
 * version and a live term produce identical Term objects and can be diffed field by field.
 */

type JsonLdValue = { "@value"?: unknown; "@id"?: string };

/** [{"@value": "a"}, {"@id": "b"}] -> ["a", "b"]; a lone entry stays a scalar. */
const flattenValues = (value: unknown): unknown => {
  const list = (Array.isArray(value) ? value : [value])
    .map((entry: JsonLdValue | unknown) => {
      if (entry && typeof entry === "object") {
        const node = entry as JsonLdValue;
        if (node["@id"] !== undefined) return node["@id"];
        if (node["@value"] !== undefined) return node["@value"];
      }
      return entry;
    })
    .filter(entry => entry !== undefined && entry !== null);

  return list.length === 1 ? list[0] : list;
};

const isClassNode = (node: any): boolean => {
  const types = Array.isArray(node?.["@type"]) ? node["@type"] : [node?.["@type"]];
  return types.some((type: string) => shortenIri(String(type || "")) === "owl:Class");
};

/** Compact one expanded node: curie keys, plain values, `owl:Class` for @type. */
const compactNode = (node: any) => {
  const compacted: Record<string, unknown> = {};
  Object.entries(node || {}).forEach(([key, value]) => {
    if (key === "@id") {
      compacted["@id"] = value;
      return;
    }
    if (key === "@type") {
      const types = Array.isArray(value) ? value : [value];
      const shortened = types.map((type: string) => shortenIri(String(type || "")));
      compacted["@type"] = shortened.length === 1 ? shortened[0] : shortened;
      return;
    }
    compacted[shortenIri(key) || key] = flattenValues(value);
  });
  return compacted;
};

/**
 * Turn a version's expanded JSON-LD into the Term shape used across the app.
 * `termId` picks the subject node when the payload carries more than one.
 */
export const versionToTerm = (jsonld: any, termId?: string) => {
  const nodes = Array.isArray(jsonld) ? jsonld : Array.isArray(jsonld?.["@graph"]) ? jsonld["@graph"] : [];
  if (!nodes.length) return null;

  const wanted = termId
    ? nodes.find((node: any) => String(node?.["@id"] || "").includes(termId))
    : undefined;
  const subject = wanted || nodes.find(isClassNode) || nodes[0];

  return getTerm({ "@graph": [compactNode(subject)] });
};

export default versionToTerm;
