import { createPostRequest, createGetRequest } from "./apiActions";
import { API_CONFIG } from "../../config";
import termParser from "../../parsers/termParser";
import { jsonldToTriplesAndEdges, PART_OF_IRI } from '../../parsers/hierarchies-parser'
import { buildPredicateGroupsForFocus } from "../../parsers/predicateParser";

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

export const userLogout = (group: string) => {
  const endpoint = `/${group}${API_CONFIG.REAL_API.LOGOUT}`;
  return createGetRequest<any, any>(endpoint, "application/json")();
};

export const getSelectedTermLabel = async (searchTerm: string, group: string = 'base'): Promise<{ label: string | undefined; actualGroup: string }> => {
  try {
    const response = await createGetRequest<JsonLdResponse, any>(`/${group}/${searchTerm}.jsonld`)();

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
        const fallbackResponse = await createGetRequest<JsonLdResponse, any>(`/base/${searchTerm}.jsonld`)();
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

export const createNewEntity = async ({ group, data, session }: { group: string; data: any; session: string }) => {
  const endpoint = `/${group}${API_CONFIG.REAL_API.CREATE_NEW_ENTITY}`;
  
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    
    xhr.open('POST', endpoint, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.withCredentials = true;

    xhr.onreadystatechange = function() {
      if (xhr.readyState === XMLHttpRequest.HEADERS_RECEIVED) {
        if (xhr.status === 303) {
          const redirectUrl = xhr.getResponseHeader('x-redirect-location') || xhr.getResponseHeader('Location');          
          if (redirectUrl) {
            const tmpMatch = redirectUrl.match(/tmp_\d{9}/);
            console.log("Found tmp ID:", tmpMatch?.[0]);
            
            if (tmpMatch) {
              resolve({
                term: {
                  id: tmpMatch[0]
                }
              });
              return;
            }
          }
        }
      }

      if (xhr.readyState === XMLHttpRequest.DONE) {
        if (xhr.status === 0) {
          // Try to find tmp ID in the response text
          const tmpMatch = xhr.responseText?.match(/tmp_\d{9}/);
          if (tmpMatch) {
            resolve({
              term: {
                id: tmpMatch[0]
              },
              raw: xhr.responseText,
              status: 303
            });
            return;
          }
        }
        
        // Handle 409 Conflict
        if (xhr.status === 409) {
          try {
            const responseData = JSON.parse(xhr.responseText);
            const match = responseData?.existing?.[0];
            if (match) {
              resolve({
                term: {
                  id: match
                },
                raw: responseData,
                status: xhr.status
              });
              return;
            }
          } catch (e) {
            console.error("Error parsing 409 response:", e);
          }
        }
        
        resolve({
          raw: xhr.responseText,
          status: xhr.status
        });
      }
    };

    xhr.onerror = function() {
      console.error("XHR Error:", xhr.status, xhr.statusText);
      reject(new Error('Network request failed'));
    };

    xhr.send(JSON.stringify(data));
  });
}

export const createNewOntology = async ({
  groupname,
  token,
  ontologyName,
  title,
  subjects,
}: {
  groupname: string;
  token: string;
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

    if (redirectLocation) {
      const olympianRedirectLocation = redirectLocation.replace('http://uri.interlex.org', '').replace(/\.html$/, '.jsonld');

      const getResponse = await fetch(olympianRedirectLocation);
      const jsonResponse = await getResponse.json();

      const newOntologyID = jsonResponse?.["@graph"]?.find((object) => object["@type"] === "owl:Ontology")?.["@id"] || null;

      return {
        created: true,
        location: olympianRedirectLocation,
        newOntologyID: newOntologyID
      };
    }

    // Try to parse the response as JSON (if present)
    let jsonResponse: any = null;
    try {
      jsonResponse = await postResponse.json();
    } catch (e) {
      // No JSON body, ignore
    }

    return {
      created: postResponse.ok,
      location: endpoint,
      jsonResponse,
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
  try {
    const response = await createGetRequest<any, any>(`/${group}/${term}.${BASE_EXTENSION}`, "application/json")();
    return termParser(response, term);
  } catch (err: any) {
    console.error(err.message);
    // If the request fails and we're not already trying 'base', try with 'base' as fallback
    if (group !== 'base') {
      try {
        const fallbackResponse = await createGetRequest<any, any>(`/base/${term}.${BASE_EXTENSION}`, "application/json")();
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
  try {
    const response = await createGetRequest<any, any>(`/${group}/${termID}.${format}`, "application/json")();
    return response;
  } catch (err: any) {
    console.error(err.message);
    // If the request fails and we're not already trying 'base', try with 'base' as fallback
    if (group !== 'base') {
      try {
        const fallbackResponse = await createGetRequest<any, any>(`/base/${termID}.${format}`, "application/json")();
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
  if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
  const ct = resp.headers.get("content-type") || "";
  if (!/application\/(ld\+json|json)/i.test(ct)) {
    throw new Error(`Server did not return JSON-LD (content-type: ${ct || "n/a"})`);
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
  if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
  const ct = resp.headers.get("content-type") || "";
  if (!/application\/(ld\+json|json)/i.test(ct)) {
    throw new Error(`Server did not return JSON-LD (content-type: ${ct || "n/a"})`);
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