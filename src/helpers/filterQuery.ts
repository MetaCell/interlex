// Faceted pages (the ontology Grid View, the term search results) keep their checks in the URL, so
// the address bar is always a shareable link to the filtered view: one `filter=<facet>:<value>`
// per checked value. Values may be curies or IRIs, so parsing splits on the FIRST colon.
export const FILTER_PARAM = "filter";

// { [facet]: { [value]: checked } }
export type CheckedFilters = Record<string, Record<string, boolean>>;

// `:` and `/` are legal in a query (RFC 3986 §3.4); left literal, a copied link reads
// `source:https://doi.org/…` instead of a run of %3A%2F%2F.
const readableQuery = (params: URLSearchParams): string =>
  params.toString().replace(/%3A/gi, ":").replace(/%2F/gi, "/");

// Other params in `search` are kept: the filters are not the only thing a URL may carry.
export const filterQuerySearch = (search: string, checked: CheckedFilters): string => {
  const params = new URLSearchParams(search);
  params.delete(FILTER_PARAM);
  for (const [facet, values] of Object.entries(checked))
    for (const [value, on] of Object.entries(values))
      if (on) params.append(FILTER_PARAM, `${facet}:${value}`);
  const query = readableQuery(params);
  return query ? `?${query}` : "";
};

// The inverse: URL search -> checked shape. Malformed params are dropped, not errors.
export const parseFilterQuery = (search: string): CheckedFilters => {
  const checked: CheckedFilters = {};
  for (const raw of new URLSearchParams(search).getAll(FILTER_PARAM)) {
    const i = raw.indexOf(":");
    if (i < 1 || i === raw.length - 1) continue;
    const facet = raw.slice(0, i);
    if (!checked[facet]) checked[facet] = {};
    checked[facet][raw.slice(i + 1)] = true;
  }
  return checked;
};
