/**
 * Convert a term-version snapshot returned by
 *   GET /{group}/{term}/versions/{identity_graph_hash}
 * into a JSON-LD document with the same shape `getRawData(..., "jsonld")`
 * produces, so the existing OverView pipeline (termParser + predicate builder
 * + RawDataViewer) can render it unchanged.
 *
 * The version endpoint returns:
 *   { prefixes: { rdf, rdfs, owl, ... }, triples: [[subject, predicate, object], ...] }
 * where subject/predicate/object are either `<full-iri>`, a prefixed token
 * (`rdf:type`, `rdfs:label`) or a plain literal / curie string.
 */

export type VersionSnapshot = {
  prefixes?: Record<string, string>;
  triples?: [string, string, string][];
};

// @context from the canonical InterLex .jsonld serialization. Used to compress
// full predicate IRIs back to the curies the rest of the app expects. A live
// head @context (when available) is layered on top of this default.
const DEFAULT_CONTEXT: Record<string, string> = {
  BIRNLEX: "http://uri.neuinfo.org/nif/nifstd/birnlex_",
  FMA: "http://purl.org/sig/ont/fma/fma",
  ILX: "http://uri.interlex.org/base/ilx_",
  NLXWIKI: "http://neurolex.org/wiki/",
  UBERON: "http://purl.obolibrary.org/obo/UBERON_",
  definition: "http://purl.obolibrary.org/obo/IAO_0000115",
  "ilx.anno.hasRelatedSynonym": "http://uri.interlex.org/base/ilx_0737162",
  "ilx.hasDbXref": "http://uri.interlex.org/base/ilx_0381360",
  "ilx.hasRole": "http://uri.interlex.org/base/ilx_0112784",
  "ilx.partOf": "http://uri.interlex.org/base/ilx_0112785",
  "ilx.relatedTo": "http://uri.interlex.org/base/ilx_0112796",
  ilxr: "http://uri.interlex.org/base/readable/",
  ilxtr: "http://uri.interlex.org/tgbugs/uris/readable/",
  isAbout: "http://purl.obolibrary.org/obo/IAO_0000136",
  owl: "http://www.w3.org/2002/07/owl#",
  rdf: "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
  rdfs: "http://www.w3.org/2000/01/rdf-schema#",
  xsd: "http://www.w3.org/2001/XMLSchema#",
};

const RDF_TYPE_IRI = "http://www.w3.org/1999/02/22-rdf-syntax-ns#type";

const stripBrackets = (s: string): string =>
  typeof s === "string" && s.startsWith("<") && s.endsWith(">") ? s.slice(1, -1) : s;

const isBracketedIri = (s: string): boolean =>
  typeof s === "string" && s.startsWith("<") && s.endsWith(">");

// Expand a prefixed token (rdf:type, rdfs:label) to a full IRI using the
// snapshot's prefix map. Leaves plain tokens (literals, curies we don't know)
// untouched.
const expandPrefixed = (token: string, prefixes: Record<string, string>): string => {
  const i = token.indexOf(":");
  if (i === -1) return token;
  const pfx = token.slice(0, i);
  const ns = prefixes[pfx];
  return ns ? ns + token.slice(i + 1) : token;
};

// Build an IRI -> curie compressor from a JSON-LD @context.
const buildCompressor = (context: Record<string, string>) => {
  const exact: Record<string, string> = {};
  const namespaces: [string, string][] = [];
  for (const [key, value] of Object.entries(context)) {
    if (typeof value !== "string") continue;
    if (exact[value] === undefined) exact[value] = key;
    namespaces.push([key, value]);
  }
  // Longest namespace first so the most specific prefix wins.
  namespaces.sort((a, b) => b[1].length - a[1].length);

  return (iri: string): string => {
    if (exact[iri]) return exact[iri];
    for (const [key, ns] of namespaces) {
      if (ns && iri.length > ns.length && iri.startsWith(ns)) {
        return `${key}:${iri.slice(ns.length)}`;
      }
    }
    return iri;
  };
};

// Normalize an object term into the JSON-LD value shape: bracketed IRIs become
// { "@id": iri }, everything else (literals, known curies) stays a string.
const toJsonLdObject = (object: string): any =>
  isBracketedIri(object) ? { "@id": stripBrackets(object) } : object;

const appendValue = (node: Record<string, any>, key: string, value: any) => {
  if (node[key] === undefined) {
    node[key] = value;
  } else if (Array.isArray(node[key])) {
    node[key].push(value);
  } else {
    node[key] = [node[key], value];
  }
};

/**
 * @param snapshot   The /versions/{hash} response.
 * @param identityGraph  The version hash (surfaced as owl:versionIRI for Details).
 * @param headContext    Optional live head @context to layer over the default.
 */
export const versionSnapshotToJsonLd = (
  snapshot: VersionSnapshot,
  identityGraph?: string,
  headContext?: Record<string, string>
): any => {
  const prefixes = snapshot?.prefixes || {};
  const triples = Array.isArray(snapshot?.triples) ? snapshot!.triples! : [];
  const context = { ...DEFAULT_CONTEXT, ...(headContext || {}) };
  const compress = buildCompressor(context);

  const subjectIri = triples.length ? stripBrackets(triples[0][0]) : "";

  // The focus owl:Class node. `isAbout` points at itself so termParser's
  // getTerm() can resolve the matched class (it keys off isAbout).
  const node: Record<string, any> = {
    "@id": subjectIri,
    "@type": "owl:Class",
    isAbout: { "@id": subjectIri },
  };

  for (const [, rawPredicate, rawObject] of triples) {
    // Predicate -> full IRI -> curie.
    const predIri = isBracketedIri(rawPredicate)
      ? stripBrackets(rawPredicate)
      : expandPrefixed(rawPredicate, prefixes);

    // rdf:type is represented by @type, already set above.
    if (predIri === RDF_TYPE_IRI) continue;

    const predicateKey = compress(predIri);
    if (predicateKey === "@id" || predicateKey === "@type" || predicateKey === "isAbout") continue;

    appendValue(node, predicateKey, toJsonLdObject(rawObject));
  }

  // Surface the version identifier for the Details "Version" field.
  if (identityGraph) {
    node["owl:versionIRI"] = { "@id": identityGraph };
  }

  return { "@context": context, "@graph": [node] };
};

export default versionSnapshotToJsonLd;
