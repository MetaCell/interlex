// Classification config for the editable Predicates view.
// Decides, per predicate, whether the "+" (add) is shown, whether rows can be
// edited/deleted, and what kind of object input to render.

const norm = (title: string): string => String(title || "").trim().toLowerCase();

// Single-valued predicates: no "+" to add another triple of this type.
const CARDINALITY_ONE = new Set<string>([
  "@id",
  "@type",
  "rdfs:label",
  "definition",
]);

// Predicates the user cannot add/edit/delete inline.
//  - @id / @type: structural.
//  - rdfs:label: backend pred_no_add list rejects it ("working on a way to
//    update these safely"); editing would del the old value then fail to add
//    the new one, so block it outright until a dedicated path exists.
const READ_ONLY = new Set<string>([
  "@id",
  "@type",
  "rdfs:label",
]);

// Predicates whose object is a term/URI reference -> term search + exact URI input.
// Everything else is treated as a literal -> plain text box.
const TERM_OBJECT = new Set<string>([
  "rdfs:subclassof",
  "ilx.partof",
  "ilxr:partof",
  "owl:equivalentclass",
  "isabout",
]);

export type ObjectInputKind = "term" | "text";

export const isCardinalityOne = (title: string): boolean =>
  CARDINALITY_ONE.has(norm(title));

export const isReadOnlyPredicate = (title: string): boolean =>
  READ_ONLY.has(norm(title));

// Whether a per-group "+" (add another triple) should be offered.
export const isAddablePredicate = (title: string): boolean =>
  !isReadOnlyPredicate(title) && !isCardinalityOne(title);

export const getObjectInputKind = (title: string): ObjectInputKind =>
  TERM_OBJECT.has(norm(title)) ? "term" : "text";

// Options for the header-level "add a new predicate" picker.
export const ADDABLE_PREDICATES: Array<{ title: string; label: string }> = [
  { title: "ilxr:synonym", label: "Synonym" },
  { title: "rdfs:subClassOf", label: "Subclass of" },
  { title: "ilx.partOf", label: "Part of" },
  { title: "definition", label: "Definition" },
];

// TODO(predicates-freshness): part of the temporary .jsonld-override workaround
// in OverView (see that TODO). Remove shortenIri/KNOWN_PREFIXES/KNOWN_TERMS once
// the transitive-query endpoint serves head-consistent data after a PATCH.
// The "base" JSON-LD @context is stripped when a term is served from a user's
// group (predicate keys come back as full IRIs). Re-shorten them to the curies
// the UI / predicateConfig expect. Mirrors the base @context.
const KNOWN_PREFIXES: Array<[string, string]> = [
  ["ilxr", "http://uri.interlex.org/base/readable/"],
  ["ilxtr", "http://uri.interlex.org/tgbugs/uris/readable/"],
  ["rdfs", "http://www.w3.org/2000/01/rdf-schema#"],
  ["owl", "http://www.w3.org/2002/07/owl#"],
  ["rdf", "http://www.w3.org/1999/02/22-rdf-syntax-ns#"],
  ["xsd", "http://www.w3.org/2001/XMLSchema#"],
];

const KNOWN_TERMS: Record<string, string> = {
  "http://purl.obolibrary.org/obo/IAO_0000115": "definition",
  "http://purl.obolibrary.org/obo/IAO_0000136": "isAbout",
  "http://uri.interlex.org/base/ilx_0112785": "ilx.partOf",
  "http://uri.interlex.org/base/ilx_0381360": "ilx.hasDbXref",
  "http://uri.interlex.org/base/ilx_0112784": "ilx.hasRole",
  "http://uri.interlex.org/base/ilx_0112796": "ilx.relatedTo",
  "http://uri.interlex.org/base/ilx_0737162": "ilx.anno.hasRelatedSynonym",
};

// Reverse of KNOWN_TERMS: shortname -> full IRI (for predicate expansion before PATCH).
const KNOWN_TERMS_REVERSE: Record<string, string> = Object.fromEntries(
  Object.entries(KNOWN_TERMS).map(([iri, name]) => [name, iri])
);

// Build an expandIri-compatible context from the app's curies list.
// Merges KNOWN_PREFIXES + KNOWN_TERMS_REVERSE + caller-supplied curies.
export const buildExpandContext = (
  curies: Array<{ prefix: string; namespace: string }> = []
): Record<string, string> => {
  const ctx: Record<string, string> = {};
  for (const [prefix, base] of KNOWN_PREFIXES) ctx[prefix] = base;
  for (const { prefix, namespace } of curies) ctx[prefix] = namespace;
  Object.assign(ctx, KNOWN_TERMS_REVERSE);
  return ctx;
};

// Shorten a full predicate IRI to its curie. Checks the app's live curies
// (user/org-registered namespaces) first, then the hardcoded tables above;
// pass through curies/non-IRIs/unmatched IRIs unchanged.
export const shortenIri = (
  iri: string,
  curies: Array<{ prefix: string; namespace: string }> = []
): string => {
  if (!iri || !/^https?:\/\//i.test(iri)) return iri;

  let bestNamespace = "";
  let curieMatch = "";
  for (const { prefix, namespace } of curies) {
    if (namespace && iri.startsWith(namespace) && namespace.length > bestNamespace.length) {
      bestNamespace = namespace;
      curieMatch = `${prefix}:${iri.slice(namespace.length)}`;
    }
  }
  if (curieMatch) return curieMatch;

  if (KNOWN_TERMS[iri]) return KNOWN_TERMS[iri];
  let best = "";
  let curie = iri;
  for (const [prefix, base] of KNOWN_PREFIXES) {
    if (iri.startsWith(base) && base.length > best.length) {
      best = base;
      curie = `${prefix}:${iri.slice(base.length)}`;
    }
  }
  return curie;
};

// Pull the InterLex id (ilx_/tmp_) out of an arbitrary IRI/string, lowercased.
export const extractIlxId = (value: string): string | null => {
  const match = String(value || "").match(/(?:ilx|tmp)_\d+/i);
  return match ? match[0].toLowerCase() : null;
};

// True when a row's subject refers to the focus term (so it lives on the focus
// node and is safe to patch). Inbound rows (subject = another term) are read-only.
export const isRowOnFocus = (rowSubject: string, focusId: string | null): boolean => {
  if (!focusId) return false;
  const subjId = extractIlxId(rowSubject);
  return !!subjId && subjId === extractIlxId(focusId);
};
