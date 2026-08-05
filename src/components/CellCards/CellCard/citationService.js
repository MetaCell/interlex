/**
 * Publication metadata for a DOI, from CrossRef.
 *
 * The ontology carries `ilxtr:literatureCitation` as a bare DOI IRI with **no node in the
 * graph** — no title, no authors, no year for any citation. The spec anticipated this ("the
 * publication info should be retrieved from a DOI API based on the DOI"), so the Source
 * Publication widget resolves it at runtime.
 *
 * Failure is expected and cheap: on any error the widget falls back to the bare DOI link, which
 * is what it had before. Nothing here ever blocks a card render.
 */

const CROSSREF = "https://api.crossref.org/works";

// One promise per DOI for the session. Sibling cells share a publication, so the card and the
// "Other cells from this source" header would otherwise fetch the same DOI repeatedly.
const cache = new Map();

/** Reduce a DOI IRI ("https://doi.org/10.1016/…") to the bare DOI ("10.1016/…"). */
export const toDoi = (value) => {
  if (!value) return "";
  const s = String(value).trim();
  const m = /(?:^|doi\.org\/|^doi:)(10\.\d{4,9}\/\S+)$/i.exec(s);
  return m ? m[1] : /^10\.\d{4,9}\//.test(s) ? s : "";
};

const formatAuthors = (authors) => {
  if (!Array.isArray(authors) || !authors.length) return undefined;
  const name = (a) => a.family || a.name || a.given || "";
  const first = name(authors[0]);
  if (!first) return undefined;
  // The design shows "Bhuiyan et al" — a single surname plus et al., not the full list, which
  // would not fit the 424px column.
  return authors.length > 1 ? `${first} et al` : first;
};

const mapWork = (message, doi, url) => ({
  doi,
  url,
  title: (message.title || [])[0],
  authors: formatAuthors(message.author),
  // A preprint has no journal, so fall back to the publisher (bioRxiv, Cold Spring Harbor…).
  journal: (message["container-title"] || [])[0] || message.publisher,
  year: String(message.issued?.["date-parts"]?.[0]?.[0] || "") || undefined,
  type: message.type,
});

/**
 * Resolve one citation. Always resolves — never rejects — so callers can render optimistically.
 * @param {string} value a DOI, a DOI IRI, or any other citation IRI
 * @returns {Promise<import("../model/types").Citation|null>}
 */
export const fetchCitation = async (value) => {
  const doi = toDoi(value);
  const url = doi ? `https://doi.org/${doi}` : String(value || "");
  if (!doi) return url ? { doi: "", url } : null;

  if (cache.has(doi)) return cache.get(doi);

  const promise = (async () => {
    try {
      const res = await fetch(`${CROSSREF}/${encodeURI(doi)}`, {
        headers: { Accept: "application/json" },
        credentials: "omit",
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const body = await res.json();
      if (!body?.message) throw new Error("Unexpected CrossRef response");
      return mapWork(body.message, doi, url);
    } catch {
      // Unknown DOI, offline, or CrossRef down — the bare link is still useful.
      return { doi, url };
    }
  })();

  cache.set(doi, promise);
  return promise;
};

export default fetchCitation;
