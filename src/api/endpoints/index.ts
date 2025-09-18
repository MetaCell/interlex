import { Organizations, Variants, Versions, User, Organization, Terms, Ontologies, Discussions, AddToDiscussion200, AddToTermDiscussion200 } from '../../model/backend';
import * as mockApi from './../../api/endpoints/swaggerMockMissingEndpoints';
import * as api from "./../../api/endpoints/interLexURIStructureAPI";
import { TERM, ONTOLOGY, ORGANIZATION } from '../../model/frontend/types'
import curieParser from '../../parsers/curieParser';
import termParser, { elasticSearchParser, getTerm } from '../../parsers/termParser';
import axios from 'axios';
import { API_CONFIG } from '../../config';

const useApi = () => api;
const useMockApi = () => mockApi;

const BASE_EXTENSION = "jsonld";

export const getOrganizations = async (group) => {
    const {  getPrivRoleOtherGroup } = useApi();

    /** Call Endpoint */
    return await getPrivRoleOtherGroup(group).then((data) => {
        return data;
      })
      .catch((error) => {
        return error;
      });
}

export const getOrganization = async (id) => {
  const {  getOrganization } = useMockApi();

  /** Call Endpoint */
  return getOrganization(id).then((data) => {
      return data as Organization;
    })
    .catch((error) => {
      return error;
    });
}

export const getOrganizationTerms = async (id) => {
  const {  getOrganizationsTerms } = useMockApi();

  /** Call Endpoint */
  return getOrganizationsTerms(id).then((data) => {
      return termParser(data, undefined);
    })
    .catch((error) => {
      return error;
    });
}

export const newOrganization = async (organization) => {
  const {  postPrivOrgNew } = useApi();

  /** Call Endpoint */
  return postPrivOrgNew(organization).then((response) => {
      return response
    })
    .catch((error) => {
      return error;
    });
}

export const getOrganizationCuries = async (id) => {
  const {  getOrganizationsCuries } = useMockApi();

  /** Call Endpoint */
  return getOrganizationsCuries(id).then((data) => {
      return curieParser(data);;
    })
    .catch((error) => {
      return error;
    });
}

export const getOrganizationOntologies = async (id) => {
  const {  getOrganizationsOntologies } = useMockApi();

  return getOrganizationsOntologies(id).then((data) => {
      return data as Ontologies;
    })
    .catch((error) => {
      return error;
    });
}

export const getVariants = async (group, term) => {
  /** Call endpoint for retrieving variants, this is a mock endpoint
  created by us */
  const {  getVariants } = useMockApi();

  /** Call Endpoint */
  return getVariants(group, term).then((data) => {
      return data as Variants;
    })
    .catch((error) => {
      return error;
    });
}

export const getVersions = async (group, term) => {
  /** Call endpoint for retrieving versions, this is a mock endpoint
  created by us */
  const {  getVersions } = useMockApi();

  /** Call Endpoint */
  return getVersions(group, term).then((data) => {
      return data as Versions;
    })
    .catch((error) => {
      return error;
    });
}

export const getCuries = async (term) => {
  /** Call endpoint for retrieving curies, this is a mock endpoint
  created by us */
  const {  getCuries } = useMockApi();

  /** Call Endpoint */
  return getCuries(term).then((data) => {
      return curieParser(data);
    })
    .catch((error) => {
      return error;
    });
}

export const getMatchTerms = async (group, term, filters = {}) => {
  const {  getEndpointsIlx } = useApi();

  /** Call Endpoint */
  return getEndpointsIlx(group,term, BASE_EXTENSION).then((data) => {
      return termParser(data, term);
    })
    .catch((error) => {
      return error;
    });
};

const fetchData = async (url, method = "GET", data: object | null = null) => {
    try {
        const response = await axios({
            url,
            method,
            data,
            headers: {
                "Content-Type": "application/json",
            },
            withCredentials : true
        });
        return response.data;
    } catch (error) {
        console.error(`API Error at ${url}:`, error);
        throw error;
    }
};

export const elasticSearch = async (
  query: string,
  size?: number,
  from: number = 0
) => {
  const url = API_CONFIG.BASE_SCICRUNCH_URL + API_CONFIG.SCICRUNCH_KEY;

  let total = size;

  if (!size) {
    try {
      const initialResponse = await fetchData(url, "POST", {
        size: 1,
        from: 0,
        query: buildQuery(query),
      });

      total = initialResponse?.hits?.total ?? 0;
    } catch (error) {
      console.error("Failed to fetch total count from Elasticsearch:", error);
      return { results: [], total: 0 };
    }
  }

  try {
    const fullResponse = await fetchData(url, "POST", {
      size: total,
      from,
      query: buildQuery(query),
    });

    return {
      results: elasticSearchParser(fullResponse?.hits?.hits),
      total,
    };
  } catch (error) {
    console.error("Error when performing elastic search", error);
    return { results: [], total: 0 };
  }
};

const buildQuery = (query: string) => ({
  "bool": {
    "must": [
      {
        "query_string": {
          "fields": [
            "*"
          ],
          "query": query,
          "type": "cross_fields",
          "default_operator": "and",
          "lenient": "true"
        }
      }
    ]
  }
});

export const searchAll = async (term, filters = {}) => {
  const {  searchAll } = useMockApi();

  /** Call Endpoint */
  return searchAll("base", term, filters).then((data: any) => {
      let terms = termParser((data as any).terms, term, filters);
      terms?.results?.forEach( result => {
        result.type = TERM;
      })
      let organizations = data.organizations;
      organizations?.forEach( organization => {
        organization.type = ORGANIZATION;
      })
      let ontologies = data.ontologies;
      ontologies?.forEach( ontology => {
        ontology.type = ONTOLOGY;
      })
      let results = {...terms, results : [...terms.results, ...organizations, ...ontologies]}
      return results;
    })
    .catch((error) => {
      return error;
    });
}

export const patchTerm = async (group, termID, term) => {
  const {patchEndpointsIlx} = useApi();

  /** Call Endpoint */
  return patchEndpointsIlx(group, termID, { data: term }).then((data: any) => {
      let termParsed = getTerm(data.data);
      let response = {
        status : data.status,
        term : termParsed
      }

      return response;
    })
    .catch((error) => {
      return error;
    });
}

export const getRawData = async (group, termID, format) => {
  const {getEndpointsIlx} = useApi();

  /** Call Endpoint */
  return getEndpointsIlx(group, termID, format).then((data) => {
      return data;
    })
    .catch((error) => {
      return error;
    });
}

export const addTerm = async (user: string, token: string, session: string, term: { label: string; synonyms: string[] }) => {
  const {  postPrivEntityNew } = useApi();

  const headers = {
    'Content-Type': 'application/x-www-form-urlencoded',
  };

  const body = {
    'rdf-type': 'owl:Class',
    label: term.label,
    exact: term.synonyms,
  };

  return await postPrivEntityNew(user, body, { headers });
};


export const bulkEditTerms = async (group, payload) => {
  const { bulkEditTerms } = useMockApi();

  /** Call Endpoint */
  return bulkEditTerms(group, payload).then((data: any) => {
      let termsParsed = termParser(data.data, undefined);
      let response = {
        status : data.status,
        terms : termsParsed
      }

      return response;
    })
    .catch((error) => {
      return error;
    });
}

export const getEndpointsIlx = async (group, term) => {
  const {  getEndpointsIlx } = useApi();

  /** Call Endpoint */
  return getEndpointsIlx(group, term, BASE_EXTENSION).then((data) => {
      return termParser(data, term);
    })
    .catch((error) => {
      return error;
    });
}

export const getUser = async (id) => {
  const {  getUser } = useMockApi();

  /** Call Endpoint */
  return getUser(id).then((data) => {
      return data as User;
    })
    .catch((error) => {
      return error;
    });
}

export const getExistingIDs = async (searchTerm) => {
  /** Call Endpoint */
  return elasticSearch(searchTerm).then((data) => {
      const terms =  data?.results;
      return terms != undefined ? terms : [];
    })
    .catch((error) => {
      return error;
    });
}

export const signup = async (body) => {
  const {  signup } = useMockApi();

  /** Call Endpoint */
  return signup(body).then((data) => {
      console.log("Sign up ", data)
      return data as User;
    })
    .catch((error) => {
      return error;
    });
}

export const getVariantDiscussions = async (group, variantID) => {
  const {  getVariantDiscussions } = useMockApi();

  /** Call Endpoint */
  return getVariantDiscussions(group, variantID).then((data) => {
      return data as Discussions;
    })
    .catch((error) => {
      return error;
    });
}

export const getTermDiscussions = async (group, variantID) => {
  const {  getTermDiscussions } = useMockApi();

  /** Call Endpoint */
  return getTermDiscussions(group, variantID).then((data) => {
      return data as Discussions;
    })
    .catch((error) => {
      return error;
    });
}

export const addMessateToTermDiscussion = async (group, termID, message) => {
  const {  addToTermDiscussion } = useMockApi();

  /** Call Endpoint */
  return addToTermDiscussion(group, termID, message).then((data) => {
      return data as AddToDiscussion200;
    })
    .catch((error) => {
      return error;
    });
}

export const addMessateToVariantDiscussion = async (group, variantID, message) => {
  const {  addToVariantDiscussion } = useMockApi();

  /** Call Endpoint */
  return mockApi.addToVariantDiscussion(group, variantID, message).then((data) => {
      return data as AddToDiscussion200;
    })
    .catch((error) => {
      return error;
    });
}

export const handleLogin = async (username: string, password: string) => {
  try {
    const { postOpsUserLogin } = useApi()
    const response = await postOpsUserLogin({ username: username, password: password });
    console.log("Login successful:", response);
    return response;
  } catch (error) {
    console.error("Login failed:", error);
    throw error;
  }
};

export const handleOrcidLogin = async (code: string) => {
  const response = await fetch(`${API_CONFIG.OLYMPIAN_GODS}/u/ops/orcid-login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    // body: JSON.strijiuigngify({ code }),
  });

  if (!response.ok) {
    throw new Error("ORCID authentication failed");
  }

  return response.json();
};

export const handleRegister = async (
  firstName: string,
  lastName: string,
  email: string,
  password: string,
  organization: string
) => {
  try {
    const { postOpsUserNew } = useApi()
    const response = await postOpsUserNew({
      firstName,
      lastName,
      email,
      password,
      organization,
    });
    console.log("Registration successful:", response);
    return response.data;
  } catch (error) {
    console.error("Registration failed:", error);
    throw error;
  }
};

export const handleForgotPassword = async (email : string) => {
  try {
    const { getOpsPasswordReset } = useApi()
    const response = await getOpsPasswordReset({
      email,
    });
    console.log("Password reset successful:", response);
    return response;
  } catch (error) {
    console.error("Forgot password :", error);
    throw error;
  }
};

export const handleRecoverUser = async (email: string) => {
  try {
    const { postOpsUserRecover } = useApi()
    const response = await postOpsUserRecover({
      email
    });
    console.log("Recover User :", response);
    return response;
  } catch (error) {
    console.error("Recover user failed:", error);
    throw error;
  }
};
