import { createPostRequest, createGetRequest } from "./apiActions";
import { API_CONFIG } from "../../config";
import termParser from "../../parsers/termParser";
import { jsonldToTriplesAndEdges, PART_OF_IRI } from '../../parsers/hierarchies-parser'
import { buildPredicateGroupsForFocus } from "../../parsers/predicateParser";

// Error enriched with the queried URL + the backend's message, so the UI can
// show a meaningful dialog instead of a bare "HTTP 404".
export interface ApiRequestError extends Error {
  url?: string;
  status?: number;
  body?: string;
}

// Read a failed Response body and turn it into a clean, short message. Backend
// errors are often small HTML pages, so pull the <p> text / strip tags.
const buildRequestError = async (resp: Response, url: string): Promise<ApiRequestError> => {
  let raw = "";
  try {
    raw = await resp.text();
  } catch {
    /* body not readable */
  }
  const para = raw.match(/<p>([\s\S]*?)<\/p>/i);
  let message = (para ? para[1] : raw.replace(/<[^>]*>/g, " "))
    .replace(/&#34;/g, '"').replace(/&quot;/g, '"').replace(/&amp;/g, "&")
    .replace(/\s+/g, " ").trim();
  if (message.length > 400) message = `${message.slice(0, 400)}…`;

  const err = new Error(`HTTP ${resp.status}`) as ApiRequestError;
  err.url = url;
  err.status = resp.status;
  err.body = message;
  return err;
};

export interface LoginRequest {
  username: string
  password: string
}

export interface RegisterRequest {
  username: string
  password: string
  firstName: string
  lastName: string
  email: string
  organization: string
}

interface ForgotPasswordReguest {
  username: string;
}

type LabelType =
  | string
  | { '@value': string; '@language'?: string }
  | Array<string | { '@value': string; '@language'?: string }>;

interface GraphNode {
  'rdfs:label'?: LabelType;
}

interface JsonLdResponse {
  '@graph'?: GraphNode[];
}

const BASE_EXTENSION = "jsonld";

// Deduplicate concurrent GET fetches for the same URL.
// All callers that request the same in-flight URL share one network request.
const inflight = new Map<string, Promise<any>>();

const fetchOnce = (url: string, fetcher: () => Promise<any>): Promise<any> => {
  const existing = inflight.get(url);
  if (existing) return existing;
  const p = fetcher().finally(() => inflight.delete(url));
  inflight.set(url, p);
  return p;
};

export const login = createPostRequest<any, LoginRequest>(API_CONFIG.REAL_API.SIGNIN, { "Content-Type": "application/x-www-form-urlencoded" })

export const register = createPostRequest<any, RegisterRequest>(API_CONFIG.REAL_API.NEWUSER_ILX, { "Content-Type": "application/x-www-form-urlencoded" })


export const getUserSettings = (group: string) => {
  const endpoint = `/${group}${API_CONFIG.REAL_API.USER_SETTINGS}`;
  return createGetRequest<any, any>(endpoint, "application/json")();
};

export const createNewOrganization = ({ group, data }: { group: string, data: any }) => {
  const endpoint = `/${group}${API_CONFIG.REAL_API.CREATE_NEW_ORGANIZATION}`;
  return createPostRequest<any, any>(endpoint, { "Content-Type": "application/json" })(data);
};

export const getOrganizations = (group: string) => {
  const endpoint = `/${group}${API_CONFIG.REAL_API.GET_ORGANIZATIONS}`;
  return createGetRequest<any, any>(endpoint, "application/json")();
};

export const getOrganizationsCuries = (group: string) => {
  const endpoint = `/${group}${API_CONFIG.REAL_API.ORG_CURIES}`;
  return createGetRequest<any, any>(endpoint, "application/json")();
};

export const addOrganizationCuries = (group: string, curies: Record<string, string>) => {
  const endpoint = `/${group}${API_CONFIG.REAL_API.ORG_CURIES}`;
  return createPostRequest<any, any>(endpoint, { "Content-Type": "application/json" })(curies);
};

export const getOrganizationsTerms = (group: string) => {
  const endpoint = `/${group}${API_CONFIG.REAL_API.ORG_TERMS}`;
  return createGetRequest<any, any>(endpoint, "application/json")();
};

export const getOrganizationsOntologies = (group: string) => {
  const endpoint = `/${group}${API_CONFIG.REAL_API.ORG_ONTOLOGIES}`;
  return createGetRequest<any, any>(endpoint, "application/json")();
};

// Pull the InterLex id (ilx_/tmp_) out of an arbitrary IRI/string.
const extractIlxId = (value: string): string | null => {
  const match = String(value || "").match(/(?:ilx|tmp)_\d+/i);
  return match ? match[0] : null;
};

/**
 * Fetch an ontology spec (JSON-LD) and return the list of member term ids (ilx_/tmp_).
 * Hits the real backend endpoint - returns [] on any error/404 so callers stay resilient
 * while the backend implementation is completed.
 */
export const getOntologyTerms = async (ontologyUri: string): Promise<string[]> => {
  if (!ontologyUri) return [];

  const url = ontologyUri.replace(API_CONFIG.INTERLEX_URL, API_CONFIG.BASE_URL);

  try {
    const resp = await fetch(url, {
      headers: { Accept: "application/ld+json, application/json" },
      credentials: "include",
    });
    if (!resp.ok) {
      console.warn(`getOntologyTerms: ${resp.status} for ${url}`);
      return [];
    }
    const jsonld = await resp.json();
    const graph = Array.isArray(jsonld?.["@graph"]) ? jsonld["@graph"] : [];

    const ids = graph
      .filter((node: any) => node?.["@type"] !== "owl:Ontology")
      .map((node: any) => extractIlxId(node?.["@id"]))
      .filter(Boolean) as string[];

    // De-duplicate
    return Array.from(new Set(ids));
  } catch (error) {
    console.warn("getOntologyTerms failed:", error);
    return [];
  }
};

export const userLogout = (group: string) => {
  const endpoint = `/${group}${API_CONFIG.REAL_API.LOGOUT}`;
  return createGetRequest<any, any>(endpoint, "application/json")();
};

export const changePassword = (group: string, data: { username: string; currentPassword: string; newPassword: string }) => {
  const endpoint = `/${group}${API_CONFIG.REAL_API.PASSWORD_CHANGE}`;
  return createPostRequest<any, any>(endpoint, { "Content-Type": "application/x-www-form-urlencoded" })(data);
};

export const getSelectedTermLabel = async (searchTerm: string, group: string = 'base'): Promise<{ label: string | undefined; actualGroup: string }> => {
  try {
    const primaryUrl = `/${group}/${searchTerm}.jsonld`;
    const response = await fetchOnce(primaryUrl, () => createGetRequest<JsonLdResponse, any>(primaryUrl)());

    const label = response['@graph']?.[0]?.['rdfs:label'];

    const getLabelValue = (label: LabelType): string => {
      if (typeof label === 'string') return label;
      if (Array.isArray(label)) {
        const en = label.find(
          l => typeof l === 'string' || (typeof l === 'object' && l?.['@language'] === 'en')
        );
        return typeof en === 'string' ? en : en?.['@value'] || '';
      }
      return label?.['@value'] || '';
    };

    return {
      label: label ? getLabelValue(label) : undefined,
      actualGroup: group
    };
  } catch (err: any) {
    console.error(err.message);
    // If the request fails and we're not already trying 'base', try with 'base' as fallback
    if (group !== 'base') {
      try {
        const fallbackUrl = `/base/${searchTerm}.jsonld`;
        const fallbackResponse = await fetchOnce(fallbackUrl, () => createGetRequest<JsonLdResponse, any>(fallbackUrl)());
        const fallbackLabel = fallbackResponse['@graph']?.[0]?.['rdfs:label'];

        const getLabelValue = (label: LabelType): string => {
          if (typeof label === 'string') return label;
          if (Array.isArray(label)) {
            const en = label.find(
              l => typeof l === 'string' || (typeof l === 'object' && l?.['@language'] === 'en')
            );
            return typeof en === 'string' ? en : en?.['@value'] || '';
          }
          return label?.['@value'] || '';
        };

        return {
          label: fallbackLabel ? getLabelValue(fallbackLabel) : undefined,
          actualGroup: 'base'
        };
      } catch (fallbackErr: any) {
        console.error('Fallback request also failed:', fallbackErr.message);
        return { label: undefined, actualGroup: group };
      }
    }
    return { label: undefined, actualGroup: group };
  }
};

export const createNewEntity = async ({ group, data }: { group: string; data: any; session?: string }): Promise<{ termId: string | null; raw: string; status: number }> => {
  const endpoint = `/${group}${API_CONFIG.REAL_API.CREATE_NEW_ENTITY}`;

  // Vite proxy converts 303 → 200 + JSON { location } so fetch can read the redirect target.
  const resp = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
    credentials: 'include',
  });

  const xRedirect = resp.headers.get('x-redirect-location');
  let raw = '';
  try { raw = await resp.text(); } catch { /* ignore */ }

  // Prefer the custom header set by the proxy
  const target = xRedirect || '';
  if (target) {
    const m = target.match(/((?:tmp|ilx)_\d+)/i);
    if (m) return { termId: m[1], raw: target, status: resp.status };
  }

  // Fallback: proxy sent JSON { location: "..." }
  try {
    const json = JSON.parse(raw);
    const loc: string = json?.location || '';
    const m = loc.match(/((?:tmp|ilx)_\d+)/i);
    if (m) return { termId: m[1], raw: loc, status: resp.status };
  } catch { /* not JSON */ }

  // Last resort: scan raw body for the ID pattern
  const hrefMatch = raw.match(/href="[^"]*\/((?:tmp|ilx)_\d+)[^"]*"/i);
  const textMatch = raw.match(/((?:tmp|ilx)_\d+)/i);
  const termId = hrefMatch ? hrefMatch[1] : (textMatch ? textMatch[1] : null);

  return { termId, raw, status: resp.status };
};

export const patchTermPredicates = async ({
  group,
  termId,
  add,
  del = [],
}: {
  group: string;
  termId: string;
  add: [string, string, { type: string; value: string }][];
  del?: any[];
}): Promise<{ ok: boolean }> => {
  const resp = await fetch(`/${group}/${termId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ add, del }),
  });
  return { ok: resp.ok };
};

export const addEntityToOntology = async ({
  group,
  ontologyUri,
  termId,
}: {
  group: string;
  ontologyUri: string;
  termId: string;
}): Promise<{ success: boolean; error?: string }> => {
  const specUrl = ontologyUri.replace(API_CONFIG.INTERLEX_URL, API_CONFIG.BASE_URL);
  const termIri = `${API_CONFIG.OLYMPIAN_GODS}/${group}/${termId}`;

  try {
    const resp = await fetch(specUrl, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ subjects: [termIri] }),
      redirect: 'manual',
    });
    return { success: resp.ok || resp.status === 0 };
  } catch (error: any) {
    return { success: false, error: error?.message || String(error) };
  }
};

export const createNewOntology = async ({
  groupname,
  ontologyName,
  title,
  subjects,
}: {
  groupname: string;
  ontologyName: string;
  title: string;
  subjects: string[];
}) => {
  const endpoint = `/${groupname}/ontologies/uris/${ontologyName}/spec`;

  const data = {
    title: title,
    subjects: subjects,
  };

  const headers = {
    'Content-Type': 'application/json'
  };

  try {
    const postResponse = await fetch(endpoint, {
      method: 'POST',
      headers,
      credentials: "include",
      body: JSON.stringify(data),
      redirect: 'manual',
    });

    // Check for custom redirect header (all lowercase in fetch)
    const redirectLocation = postResponse.headers.get('x-redirect-location');

    // Base success on the POST response, not on the JSONLD fetch
    const isCreated = postResponse.ok || !!redirectLocation;

    if (redirectLocation) {
      const olympianRedirectLocation = redirectLocation.replace(API_CONFIG.INTERLEX_URL, API_CONFIG.BASE_URL).replace(/\.html$/, '.jsonld');

      // Try to fetch JSONLD for additional info, but don't let it determine success
      try {
        const getResponse = await fetch(olympianRedirectLocation);
        const jsonResponse = await getResponse.json();
        const newOntologyID = jsonResponse?.["@graph"]?.find((object: { [x: string]: string; }) => object["@type"] === "owl:Ontology")?.["@id"] || null;

        return {
          created: isCreated,
          location: olympianRedirectLocation,
          newOntologyID: newOntologyID,
          jsonldAvailable: true
        };
      } catch (jsonldError: any) {
        // JSONLD fetch failed, but ontology creation was successful
        console.warn('JSONLD fetch failed, but ontology was created successfully:', jsonldError);
        return {
          created: isCreated,
          location: olympianRedirectLocation,
          newOntologyID: null,
          jsonldAvailable: false,
          jsonldError: jsonldError?.message || String(jsonldError)
        };
      }
    }

    // Try to parse the response as JSON (if present)
    let jsonResponse: any = null;
    try {
      jsonResponse = await postResponse.json();
    } catch (e) {
      // No JSON body, ignore
    }

    return {
      created: isCreated,
      location: endpoint,
      jsonResponse,
      jsonldAvailable: false
    };
  } catch (error: any) {
    let errMsg = error?.message ?? String(error);
    return {
      created: false,
      error: errMsg,
    };
  }
};

export const getNewTokenApi = ({ groupname, data }: { groupname: string, data: any }) => {
  const endpoint = `/${groupname}${API_CONFIG.REAL_API.API_NEW_TOKEN}`;
  return createPostRequest<any, any>(endpoint, { "Content-Type": "application/json" })(data);
};

export const retrieveTokenApi = ({ groupname }: { groupname: string }) => {
  const endpoint = `/${groupname}${API_CONFIG.REAL_API.API_RETRIEVE_TOKEN}`;
  return createGetRequest<any, any>(endpoint, "application/json")();
};

export const forgotPassword = createPostRequest<any, ForgotPasswordReguest>(API_CONFIG.REAL_API.USER_RECOVER, { "Content-Type": "application/x-www-form-urlencoded" })

export const getMatchTerms = async (group: string, term: string, filters = {}) => {
  const primaryUrl = `/${group}/${term}.${BASE_EXTENSION}`;
  try {
    const response = await fetchOnce(primaryUrl, () => createGetRequest<any, any>(primaryUrl, "application/json")());
    return termParser(response, term);
  } catch (err: any) {
    console.error(err.message);
    // If the request fails and we're not already trying 'base', try with 'base' as fallback
    if (group !== 'base') {
      try {
        const fallbackUrl = `/base/${term}.${BASE_EXTENSION}`;
        const fallbackResponse = await fetchOnce(fallbackUrl, () => createGetRequest<any, any>(fallbackUrl, "application/json")());
        return termParser(fallbackResponse, term);
      } catch (fallbackErr: any) {
        console.error('Fallback request also failed:', fallbackErr.message);
        return undefined;
      }
    }
    return undefined;
  }
};

export const getRawData = async (group: string, termID: string, format: string) => {
  const primaryUrl = `/${group}/${termID}.${format}`;
  try {
    const response = await fetchOnce(primaryUrl, () => createGetRequest<any, any>(primaryUrl, "application/json")());
    return response;
  } catch (err: any) {
    console.error(err.message);
    // If the request fails and we're not already trying 'base', try with 'base' as fallback
    if (group !== 'base') {
      try {
        const fallbackUrl = `/base/${termID}.${format}`;
        const fallbackResponse = await fetchOnce(fallbackUrl, () => createGetRequest<any, any>(fallbackUrl, "application/json")());
        return fallbackResponse;
      } catch (fallbackErr: any) {
        console.error('Fallback request also failed:', fallbackErr.message);
        return undefined;
      }
    }
    return undefined;
  }
};

export const getVariants = async (group: string, term: string) => {
  return createGetRequest<any, any>(`/${group}/variants/${term}`, "application/json")();
};

export const getVersions = async (group: string, term: string) => {
  return createGetRequest<any, any>(`/${group}/${term}/versions`, "application/json")();
};

// A single version snapshot of a term, identified by its identity-graph hash.
// Returns { prefixes, triples: [[subject, predicate, object], ...] }.
export const getTermVersion = async (group: string, term: string, identityGraph: string) => {
  return createGetRequest<any, any>(`/${group}/${term}/versions/${identityGraph}`, "application/json")();
};

export const getTermDiscussions = async (group: string, variantID: string) => {
  return createGetRequest<any, any>(`/${group}/discussions/term/${variantID}`, "application/json")();
};

export const getVariant = (group: string, term: string) => {
  return createGetRequest<any, any>(`/${group}/variant/${term}`, "application/json")();
};

export const getTermPredicates = async ({
  groupname,
  termId,
  objToSub = true,
}: {
  groupname: string;
  termId: string;
  objToSub?: boolean;
}) => {
  const url = new URL(
    `/${groupname}/query/transitive/${encodeURIComponent(termId)}/ilx.partOf:?obj-to-sub=true`,
    window.location.origin
  ).toString();

  const resp = await fetch(url, {
    headers: { Accept: "application/ld+json" },
    credentials: "include",
  });
  if (!resp.ok) throw await buildRequestError(resp, url);
  const ct = resp.headers.get("content-type") || "";
  if (!/application\/(ld\+json|json)/i.test(ct)) {
    const err = new Error(`Server did not return JSON-LD (content-type: ${ct || "n/a"})`) as ApiRequestError;
    err.url = url;
    err.status = resp.status;
    err.body = `Expected JSON-LD but received content-type: ${ct || "n/a"}`;
    throw err;
  }
  const jsonld = await resp.json();

  // Build gold-standard predicate groups for the focus owl:Class
  const predicates = buildPredicateGroupsForFocus(jsonld, termId);
  return predicates;
};

export const getTermHierarchies = async ({
  groupname,
  termId,
  objToSub = false,
}: {
  groupname: string;
  termId: string;
  objToSub?: boolean;
}) => {
  const url = new URL(
    `/${groupname}/query/transitive/${encodeURIComponent(termId)}/ilx.partOf:?obj-to-sub=${objToSub}`,
    window.location.origin
  ).toString();

  const resp = await fetch(url, {
    headers: { Accept: "application/ld+json" },
    credentials: "include",
  });
  if (!resp.ok) throw await buildRequestError(resp, url);
  const ct = resp.headers.get("content-type") || "";
  if (!/application\/(ld\+json|json)/i.test(ct)) {
    const err = new Error(`Server did not return JSON-LD (content-type: ${ct || "n/a"})`) as ApiRequestError;
    err.url = url;
    err.status = resp.status;
    err.body = `Expected JSON-LD but received content-type: ${ct || "n/a"}`;
    throw err;
  }
  const jsonld = await resp.json();

  // Only what Hierarchy needs
  const parsed = jsonldToTriplesAndEdges(jsonld);
  const triples = Array.isArray(parsed) ? parsed : (parsed?.triples || parsed?.edges || []);

  return { triples };
};

export const checkPotentialMatches = async (group: string, data: any) => {
  return createPostRequest<any, any>(`/${group}${API_CONFIG.REAL_API.CHECK_ENTITY}`, { "Content-Type": "application/json" })(data);
};