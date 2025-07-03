import { createPostRequest, createGetRequest } from "./apiActions";
import { API_CONFIG } from "../../config";
import termParser from "../../parsers/termParser";

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

export const getSelectedTermLabel = async (searchTerm: string): Promise<string | undefined> => {
  try {
    const response = await createGetRequest<JsonLdResponse, any>(`/base/${searchTerm}.jsonld`)();

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

    return label ? getLabelValue(label) : undefined
  } catch (err: any) {
    console.error(err.message);
    return undefined;
  }
};

export const createNewEntity = async ({ group, data, session }: { group: string; data: any; session: string }) => {
  try {
    const endpoint = `/${group}${API_CONFIG.REAL_API.CREATE_NEW_ENTITY}`;
    const response = await createPostRequest<any, any>(
      endpoint,
      { "Content-Type": "application/x-www-form-urlencoded" }
    )(data);

    // If the response is HTML (a string), extract TMP ID
    if (typeof response === "string") {
      const match = response.match(/TMP:\d{9}/);
      if (match) {
        return {
          term: {
            id: `${match[0]}`,
          },
          raw: response,
          status: 200,
        };
      }
    }

    // Otherwise, return response as-is
    return response;
  } catch (error) {
    if (error?.response.status === 409) {
      const match = error?.response?.data?.existing?.[0];
      if (match) {
        return {
          term: {
            id: `${match}`,
          },
          raw: error?.response,
          status: error?.response?.status,
        };
      }
    }

    return {
      raw: error?.response,
      status: error?.response?.status,
    };
  }

};

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
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };

  try {
    const postResponse = await createPostRequest<any, any>(endpoint, headers)(data);

    // If the POST creates a new location, try fetching it (simulate follow-up GETs from the test)
    if (postResponse?.location) {
      const getResponse = await fetch(postResponse.location, {
        headers: {
          Accept: 'application/json',
        },
      });

      // Optionally fetch HTML if needed (like the .html equivalent in the Python test)
      const htmlResponse = await fetch(endpoint, {
        headers: {
          Accept: 'text/html',
        },
      });

      return {
        created: true,
        data: postResponse,
        jsonResponse: await getResponse.json(),
        htmlAvailable: htmlResponse.ok,
      };
    }

    return {
      created: true,
      data: postResponse,
    };
  } catch (error: any) {
    return {
      created: false,
      error: error?.response?.data || error.message,
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

export const getMatchTerms = async (group: string, term: string, filters = {}) => {
  try {
    const response = await createGetRequest<any, any>(`/${group}/${term}.${BASE_EXTENSION}`, "application/json")();
    return termParser(response, term);
  } catch (err: any) {
    console.error(err.message);
    return undefined;
  }
};

export const getRawData = async (group: string, termID: string, format: string) => {
  try {
    const response = await createGetRequest<any, any>(`/${group}/${termID}.${format}`, "application/json")();
    return response;
  } catch (err: any) {
    console.error(err.message);
    return undefined;
  }
};

export const getVariants = async (group: string, term: string) => {
  return createGetRequest<any, any>(`/${group}/variants/${term}`, "application/json")();
};

export const getVersions = async (group: string, term: string) => {
  return createGetRequest<any, any>(`/${group}/versions/${term}`, "application/json")();
};

export const getTermDiscussions = async (group: string, variantID: string) => {
  return createGetRequest<any, any>(`/${group}/discussions/term/${variantID}`, "application/json")();
};

export const getVariant = (group: string, term: string) => {
  return createGetRequest<any, any>(`/${group}/variant/${term}`, "application/json")();  
};