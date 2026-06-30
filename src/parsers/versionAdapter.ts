import { shortenIri } from '../configuration/predicateConfig';

// Normalize @type to the curie string termParser/buildPredicateGroupsForFocus expect.
// The versions endpoint returns it as an array of full IRIs.
const normalizeType = (type: any): string | undefined => {
  if (!type) return undefined;
  const raw = Array.isArray(type) ? type[0] : type;
  return shortenIri(raw) || raw;
};

// Unwrap expanded JSON-LD value objects to plain scalars.
// Regular getRawData returns compacted JSON-LD (context applied) so values are
// plain strings already. The versions endpoint returns expanded JSON-LD, so
// string values arrive as { "@value": "Brain" } — termParser only handles @id,
// not @value, causing React to receive objects as children.
const unwrapValue = (v: any): any => {
  if (v == null) return v;
  if (Array.isArray(v)) return v.map(unwrapValue);
  if (typeof v === 'object' && '@value' in v) return v['@value'];
  return v;
};

// Adapt the raw JSON-LD array from getTermVersion into the shape the pipeline expects:
//   { "@graph": [{ "@id": ..., "@type": "owl:Class", ... }] }
// - @type: array of full IRIs → single curie string
// - property values: { "@value": x } → x  (termParser handles @id objects already)
// - predicate keys (full IRIs) left as-is — termParser calls shortenIri on each key
export const adaptVersionJsonLd = (raw: any): any => {
  const nodes: any[] = Array.isArray(raw) ? raw : raw != null ? [raw] : [];
  const graph = nodes.map((node) => {
    const out: Record<string, any> = {};
    for (const key of Object.keys(node)) {
      if (key === '@type') {
        out['@type'] = normalizeType(node['@type']);
      } else if (key === '@id') {
        out['@id'] = node['@id'];
      } else {
        out[key] = unwrapValue(node[key]);
      }
    }
    return out;
  });
  return { '@graph': graph };
};
