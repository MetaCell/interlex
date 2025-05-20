import { createPostRequest, createGetRequest } from "./apiActions";
import { API_CONFIG } from "../../config";

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

export const login = createPostRequest<any, LoginRequest>(API_CONFIG.REAL_API.SIGNIN, "application/x-www-form-urlencoded")

export const register = createPostRequest<any, RegisterRequest>(API_CONFIG.REAL_API.NEWUSER_ILX, "application/x-www-form-urlencoded")


export const getUserSettings = (group: string) => {
  const endpoint = `/${group}${API_CONFIG.REAL_API.USER_SETTINGS}`;
  return createGetRequest<any, any>(endpoint, "application/json")();
};

export const createNewOrganization = ({ group, data }: { group: string, data: any }) => {
  const endpoint = `/${group}${API_CONFIG.REAL_API.CREATE_NEW_ORGANIZATION}`;
  return createPostRequest<any, any>(endpoint, "application/json")(data);
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
    const res = await fetch(`https://uri.olympiangods.org/base/${searchTerm}.jsonld`);
    if (!res.ok) throw new Error(`Response status: ${res.status}`);

    const data: JsonLdResponse = await res.json();
    const label = data['@graph']?.[0]?.['rdfs:label'];

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