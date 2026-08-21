/**
 * Publication metadata for a citation, from CrossRef with Europe PMC behind it.
 *
 * The ontology carries `ilxtr:literatureCitation` as a bare IRI with **no node in the graph** —
 * no title, no authors, no year for any citation. The spec anticipated this ("the publication
 * info should be retrieved from a DOI API based on the DOI"), so the Source Publication widget
 * resolves it at runtime.
 *
 * CrossRef leads for DOIs: measured over the shipped graph it answers 160 of the 172 DOI citations
 * against Europe PMC's 146, and Europe PMC turned up none that CrossRef missed. Europe PMC still
 * answers the majority of citations overall, because most of the IRIs are `PMID:` CURIEs and it is
 * the only one of the two that can be queried by PMID at all — 295 of them, which never reach
 * CrossRef because there is no DOI to ask it about.
 *
 * Failure is expected and cheap: on any error the widget falls back to the bare link, which is
 * what it had before. Nothing here ever blocks a card render.
 */

const EUROPE_PMC = "https://www.ebi.ac.uk/europepmc/webservices/rest/search";
const CROSSREF = "https://api.crossref.org/works";
const PUBMED = "https://pubmed.ncbi.nlm.nih.gov";
const PMC = "https://www.ncbi.nlm.nih.gov/pmc/articles";

// One promise per identifier for the session. Sibling cells share a publication, so the card and
// the "Other cells from this source" header would otherwise fetch the same citation repeatedly.
const cache = new Map();

/** Reduce a DOI IRI ("https://doi.org/10.1016/…") to the bare DOI ("10.1016/…"). */
export const toDoi = (value) => {
  if (!value) return "";
  const s = String(value).trim();
  const m = /(?:^|doi\.org\/|^doi:)(10\.\d{4,9}\/\S+)$/i.exec(s);
  return m ? m[1] : /^10\.\d{4,9}\//.test(s) ? s : "";
};

/** Reduce a PubMed CURIE ("PMID:86176") or record URL to the bare id ("86176"). */
export const toPmid = (value) => {
  const m = /(?:^PMID:|pubmed\.ncbi\.nlm\.nih\.gov\/)(\d+)\/?$/i.exec(String(value ?? "").trim());
  return m ? m[1] : "";
};

const toPmcid = (value) => {
  const m = /(?:^PMCID:|\/)(PMC\d+)\/?$/i.exec(String(value ?? "").trim());
  return m ? m[1].toUpperCase() : "";
};

/** The identifiers a citation IRI can be looked up by, at most one of which is ever set. */
const parseRef = (value) => {
  const doi = toDoi(value);
  if (doi) return { doi, pmid: "", pmcid: "" };
  const pmid = toPmid(value);
  if (pmid) return { doi: "", pmid, pmcid: "" };
  return { doi: "", pmid: "", pmcid: toPmcid(value) };
};

const refUrl = ({ doi, pmid, pmcid }) =>
  doi ? `https://doi.org/${doi}` : pmid ? `${PUBMED}/${pmid}/` : pmcid ? `${PMC}/${pmcid}/` : "";

const formatAuthors = (surnames) => {
  const [first] = surnames;
  if (!first) return undefined;
  // The design shows "Bhuiyan et al" — a single surname plus et al., not the full list, which
  // would not fit the 424px column.
  return surnames.length > 1 ? `${first} et al` : first;
};

// Both services stall rather than refuse when they are unhealthy — Europe PMC has been seen taking
// 22s on a PMID it normally answers in 80ms — and a stalled lookup holds the widget on skeletons
// for as long as it takes. A citation is enrichment, so it gets a deadline and then gives up.
const REQUEST_TIMEOUT_MS = 8000;

const fetchJson = async (url) => {
  const res = await fetch(url, {
    headers: { Accept: "application/json" },
    credentials: "omit",
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
};

// `AND SRC:MED` pins a bare id to the PubMed corpus, so it cannot match a preprint or an agricola
// record that happens to share the number.
const europePmcQuery = ({ doi, pmid, pmcid }) =>
  pmid ? `EXT_ID:${pmid} AND SRC:MED` : pmcid ? `PMCID:${pmcid}` : `DOI:"${doi}"`;

// `authorString` is "Hancock MB, Peveto CA." — the surname leads each comma-separated entry. The
// structured `authorList` would be tidier but only ships with `resultType=core`.
const europePmcAuthors = (result) =>
  formatAuthors(
    String(result.authorString || "")
      .split(",")
      .map((entry) => entry.trim().split(/\s+/)[0])
      .filter(Boolean),
  );

const mapEuropePmcResult = (result, ref) => {
  // Europe PMC lowercases the DOI it echoes back, so the ontology's own spelling wins when we had
  // one to query by.
  const doi = ref.doi || result.doi || "";
  const pmid = result.pmid || ref.pmid || "";
  return {
    doi,
    pmid,
    url: refUrl({ doi, pmid, pmcid: ref.pmcid }),
    title: result.title || undefined,
    authors: europePmcAuthors(result),
    // `lite` carries the Medline abbreviation ("Neurosci Lett"), not the full journal name. A
    // preprint has no journal at all, and its publisher (bioRxiv, Zenodo…) sits under
    // bookOrReportDetails instead.
    journal: result.journalTitle || result.bookOrReportDetails?.publisher,
    year: result.pubYear || undefined,
  };
};

const fromEuropePmc = async (ref) => {
  // `lite` is a 1KB response where `core` is 9KB, and the difference is all abstract text and
  // structured author records that this widget never shows.
  const params = new URLSearchParams({
    query: europePmcQuery(ref),
    resultType: "lite",
    format: "json",
    pageSize: "1",
  });
  const body = await fetchJson(`${EUROPE_PMC}?${params}`);
  const [result] = body?.resultList?.result || [];
  return result ? mapEuropePmcResult(result, ref) : null;
};

const mapCrossrefWork = (message, doi) => ({
  doi,
  pmid: "",
  url: `https://doi.org/${doi}`,
  title: (message.title || [])[0],
  authors: formatAuthors(
    (message.author || []).map((author) => author.family || author.name || author.given).filter(Boolean),
  ),
  // A preprint has no journal, so fall back to the publisher (openRxiv, Cold Spring Harbor…).
  journal: (message["container-title"] || [])[0] || message.publisher,
  year: String(message.issued?.["date-parts"]?.[0]?.[0] || "") || undefined,
  type: message.type,
});

const fromCrossref = async (doi) => {
  const body = await fetchJson(`${CROSSREF}/${encodeURI(doi)}`);
  if (!body?.message) throw new Error("Unexpected CrossRef response");
  return mapCrossrefWork(body.message, doi);
};

/**
 * Resolve one citation. Always resolves — never rejects — so callers can render optimistically.
 * @param {string} value a DOI, a PubMed CURIE, or any other citation IRI
 * @returns {Promise<import("../model/types").Citation|null>}
 */
export const fetchCitation = async (value) => {
  const ref = parseRef(value);
  const bare = { doi: ref.doi, pmid: ref.pmid, url: refUrl(ref) || String(value || "") };
  const key = [ref.doi, ref.pmid, ref.pmcid].join("|");
  if (key === "||") return bare.url ? bare : null;

  if (cache.has(key)) return cache.get(key);

  const promise = (async () => {
    if (ref.doi) {
      try {
        return await fromCrossref(ref.doi);
      } catch {
        // Unknown DOI, offline, or CrossRef down or stalled — Europe PMC may still have it.
      }
    }
    // Europe PMC is the only one of the two that can be queried by PMID, so a PubMed CURIE comes
    // straight here; a DOI reaches it only once CrossRef has already failed on it.
    try {
      const found = await fromEuropePmc(ref);
      if (found) return found;
    } catch {
      // Europe PMC unreachable, throwing 5xx, or past its deadline — the bare link still works.
    }
    return bare;
  })();

  cache.set(key, promise);
  return promise;
};

export default fetchCitation;
