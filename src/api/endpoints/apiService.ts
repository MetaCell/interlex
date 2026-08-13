import { createPostRequest, createGetRequest } from "./apiActions";
import { API_CONFIG } from "../../config";
import termParser from "../../parsers/termParser";
import { jsonldToTriplesAndEdges, PART_OF_IRI } from '../../parsers/hierarchies-parser'
import { buildPredicateGroupsForFocus } from "../../parsers/predicateParser";
import versionToTerm from "../../parsers/variantParser";

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
  'owl:versionIRI'?: { '@id'?: string };
}

interface JsonLdResponse {
  '@graph'?: GraphNode[];
}

// owl:versionIRI is normally a full IRI (.../version/<id>/...); pull out the
// bare identity-graph id, mirroring Details.jsx's versionDisplay logic.
const extractGraphId = (graph?: GraphNode[]): string | undefined => {
  const versionIRI = graph?.[graph.length - 1]?.['owl:versionIRI']?.['@id'];
  if (!versionIRI) return undefined;
  return versionIRI.includes('/version/') ? versionIRI.split('/version/')[1]?.split('/')[0] : versionIRI;
};

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

export const getSelectedTermLabel = async (searchTerm: string, group: string = 'base'): Promise<{ label: string | undefined; actualGroup: string; graphId: string | undefined }> => {
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
      actualGroup: group,
      graphId: extractGraphId(response['@graph'])
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
          actualGroup: 'base',
          graphId: extractGraphId(fallbackResponse['@graph'])
        };
      } catch (fallbackErr: any) {
        console.error('Fallback request also failed:', fallbackErr.message);
        return { label: undefined, actualGroup: group, graphId: undefined };
      }
    }
    return { label: undefined, actualGroup: group, graphId: undefined };
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

export const createFork = async (
  groupname: string,
  termId: string,
  sourceGroup: string,
  termLabel: string
): Promise<{ ok: boolean; status: number }> => {
  const sourceIri = `${API_CONFIG.INTERLEX_URL}/${sourceGroup}/${termId}`;
  const synonymIri = "http://uri.interlex.org/base/readable/synonym";
  const resp = await fetch(`/${groupname}/${termId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({
      add: [[sourceIri, synonymIri, { type: "literal", value: termLabel }]],
      del: [],
    }),
  });
  return { ok: resp.ok, status: resp.status };
};

export const addEntityToOntology = async ({
  group,
  ontologyUri,
  termId,
}: {
  group: string;
  ontologyUri: string;
  termId: string;
}): Promise<{ success: boolean; status?: number; url?: string; body?: string; error?: string }> => {
  const specUrl = ontologyUri.replace(API_CONFIG.INTERLEX_URL, API_CONFIG.BASE_URL);
  const termIri = `${API_CONFIG.OLYMPIAN_GODS}/${group}/${termId}`;

  try {
    const resp = await fetch(specUrl, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ add: [termIri], del: [] }),
      redirect: 'manual',
    });
    const ok = resp.ok || resp.status === 0;
    if (!ok) {
      let body = '';
      try { body = await resp.text(); } catch { /* ignore */ }
      return { success: false, status: resp.status, url: specUrl, body };
    }
    return { success: true, status: resp.status, url: specUrl };
  } catch (error: any) {
    return { success: false, url: specUrl, error: error?.message || String(error) };
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
  return createGetRequest<any, any>(`/${group}/${term}/versions/${identityGraph}`, "application/ld+json")();
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

/* ------------------------------------------------------------------ *
 * Pull requests (variant → curated merge proposals)
 * ------------------------------------------------------------------ */

export interface PullRequestResult {
  ok: boolean;
  status: number;
  /** URL of the created pull request, e.g. "http://host/base/pulls/3" */
  pullUrl?: string;
  /** Numeric id parsed out of pullUrl */
  pullId?: string;
  /** Human readable failure reason, set when ok === false */
  error?: string;
}

// The backend answers create with 303 + Location. Dev (vite) and prod (nginx) proxies both
// intercept it: the location arrives either as the X-Redirect-Location header or as a JSON
// body ({location} from the proxies, {redirect} when the backend answers Accept: json itself).
const readRedirectLocation = (resp: Response, raw: string): string => {
  const header = resp.headers.get('x-redirect-location');
  if (header) return header;
  try {
    const json = JSON.parse(raw);
    return json?.location || json?.redirect || '';
  } catch {
    return '';
  }
};

// Backend statuses documented for pull-new; anything else falls back to the response body.
const PULL_NEW_ERRORS: Record<number, string> = {
  401: 'You do not have permission to open a merge request from this fork.',
  409: 'There is nothing to merge: this variant does not differ from the curated term.',
  422: 'The merge request is missing required information or it is invalid.',
};

/**
 * Open a merge request proposing the changes made in `groupFrom`'s variant of `termId`
 * against the curated (`groupTo`, normally "base") version.
 *
 * POST /<group-from>/priv/pull-new — `group-from` must match the group in the path.
 */
export const createPullRequest = async ({
  groupFrom,
  groupTo = 'base',
  termId,
  perspectiveFrom,
  perspectiveTo,
}: {
  groupFrom: string;
  groupTo?: string;
  termId: string;
  perspectiveFrom?: string;
  perspectiveTo?: string;
}): Promise<PullRequestResult> => {
  const endpoint = `/${groupFrom}${API_CONFIG.REAL_API.PULL_NEW}`;
  const body: Record<string, string> = {
    subject: `${API_CONFIG.INTERLEX_URL}/${groupFrom}/${termId}`,
    'group-from': groupFrom,
    'group-to': groupTo,
  };
  // Optional; the backend defaults them to the group names.
  if (perspectiveFrom) body['perspective-name-from'] = perspectiveFrom;
  if (perspectiveTo) body['perspective-name-to'] = perspectiveTo;

  try {
    const resp = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      credentials: 'include',
      body: JSON.stringify(body),
    });

    let raw = '';
    try { raw = await resp.text(); } catch { /* body not readable */ }

    const location = readRedirectLocation(resp, raw);
    // 303 is the success path; the proxies rewrite it to 200 + JSON, so accept both.
    if (location) {
      return {
        ok: true,
        status: resp.status,
        pullUrl: location,
        pullId: location.match(/\/pulls\/(\d+)/)?.[1],
      };
    }

    if (resp.ok) return { ok: true, status: resp.status };

    return {
      ok: false,
      status: resp.status,
      error: PULL_NEW_ERRORS[resp.status] || raw || `Request failed with HTTP ${resp.status}.`,
    };
  } catch (error: any) {
    return { ok: false, status: 0, error: error?.message || String(error) };
  }
};

/**
 * Fetch one side of a merge request (`from-variant-uri` / `to-variant-uri`) and parse it into
 * the Term shape the delta panels render.
 *
 * The record carries absolute backend URIs; only the path is used so the request goes through
 * the app's own origin (and therefore the /versions proxy) instead of cross-origin.
 */
export const getVariantTerm = async (variantUri: string, termId?: string) => {
  if (!variantUri) return null;

  let path = variantUri;
  try {
    path = new URL(variantUri).pathname;
  } catch {
    /* already a path */
  }

  const jsonld = await createGetRequest<any, any>(path, "application/ld+json")();
  return versionToTerm(jsonld, termId);
};

/**
 * GET /<group>/priv/role — the signed-in user's role in `group`.
 * Used to decide whether the merge controls apply; returns null when there is no session or
 * the user holds no role there (both answer 401).
 */
export const getUserRoleForGroup = async (group: string) => {
  try {
    return await createGetRequest<any, any>(`/${group}${API_CONFIG.REAL_API.USER_ROLE}`, "application/json")();
  } catch (error: any) {
    if (error?.response?.status !== 401) console.warn(`getUserRoleForGroup(${group}) failed:`, error);
    return null;
  }
};

/** GET /<group>/pulls — every merge request that group is involved in. */
export const getPullRequests = async (group: string) => {
  return createGetRequest<any, any>(`/${group}${API_CONFIG.REAL_API.PULLS}`, "application/json")();
};

/** GET /<group>/pulls/<pullId> — a single merge request, with its status log. */
export const getPullRequest = async (group: string, pullId: string) => {
  return createGetRequest<any, any>(`/${group}${API_CONFIG.REAL_API.PULLS}/${pullId}`, "application/json")();
};

/**
 * Every merge request the backend holds, found by walking the id sequence.
 *
 * `/<group>/pulls` only lists requests *into* that group, so a user's own outgoing requests are
 * invisible from their group and nothing enumerates them — but a single record is readable from
 * any group path (the path group is not cross-checked) and ids are one global sequence, so
 * walking it is the only way to see the whole picture.
 *
 * Walks in batches and stops as soon as a whole batch comes back empty; `truncated` reports
 * hitting `maxId` first, so a caller can say so rather than quietly showing a partial list.
 */
export const listAllPullRequests = async ({
  group = 'base',
  maxId = 200,
  batchSize = 10,
}: { group?: string; maxId?: number; batchSize?: number } = {}): Promise<{ records: any[]; truncated: boolean }> => {
  const records: any[] = [];

  for (let start = 1; start <= maxId; start += batchSize) {
    const ids = Array.from(
      { length: Math.min(batchSize, maxId - start + 1) },
      (_, offset) => start + offset
    );
    const batch = await Promise.all(
      // A 404 is the end of the sequence (or a gap in it), not a failure.
      ids.map(id => getPullRequest(group, String(id)).catch(() => null))
    );
    const found = batch.filter(Boolean);
    records.push(...found);
    if (!found.length) return { records, truncated: false };
  }

  return { records, truncated: true };
};

/**
 * POST /<group>/pulls/<pullId>/ops/merge — accept a merge request.
 * `<group>` must be the *to* group, and the identities come straight off the GET.
 */
export const mergePullRequest = async ({
  group,
  pullId,
  expectedFromIdentity,
  expectedToIdentity,
}: {
  group: string;
  pullId: string;
  expectedFromIdentity: string;
  expectedToIdentity: string;
}): Promise<{ ok: boolean; status: number; error?: string }> => {
  const endpoint = `/${group}${API_CONFIG.REAL_API.PULLS}/${pullId}/ops/merge`;
  try {
    const resp = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        'expected-from-identity': expectedFromIdentity,
        'expected-to-identity': expectedToIdentity,
      }),
    });
    if (resp.ok) return { ok: true, status: resp.status };
    let raw = '';
    try { raw = await resp.text(); } catch { /* body not readable */ }
    const messages: Record<number, string> = {
      401: 'You do not have permission to merge this request.',
      422: 'The merge request is missing the expected identities.',
    };
    return { ok: false, status: resp.status, error: messages[resp.status] || raw || `HTTP ${resp.status}` };
  } catch (error: any) {
    return { ok: false, status: 0, error: error?.message || String(error) };
  }
};