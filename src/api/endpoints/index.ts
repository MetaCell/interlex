import { Organizations, Variants, Versions, User, Organization, Terms, Ontologies, Discussions, AddToDiscussion200, AddToTermDiscussion200 } from '../../model/backend';
import * as mockApi from './../../api/endpoints/swaggerMockMissingEndpoints';
import * as api from "./../../api/endpoints/interLexURIStructureAPI";
import { TERM, ONTOLOGY, ORGANIZATION } from '../../model/frontend/types'
import curieParser from '../../parsers/curieParser';
import termParser, { elasticSearhParser, getTerm } from '../../parsers/termParser';
import { Curies } from '../../model/frontend/curies';
import axios from 'axios';
import { API_CONFIG } from '../../config';
import { config } from 'dotenv';

const useMockApi = () => mockApi;
const useApi = () => api;

const BASE_GROUP = "base";
const BASE_EXTENSION = "jsonld";

export const getOrganizations = async () => {
    /** Call endpoint for retrieving organizations, this is a mock endpoint
    created by us */
    const {  getOrganizations } = useMockApi();

    /** Call Endpoint */
    return await getOrganizations().then((data) => {
        return data as Organizations;
      })
      .catch((error) => {
        return error;
      });
}

export const getOrganization = async (id) => {
  /** Call endpoint for retrieving organizations, this is a mock endpoint
  created by us */
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
  /** Call endpoint for retrieving organizations, this is a mock endpoint
  created by us */
  const {  getOrganizationsTerms } = useMockApi();

  /** Call Endpoint */
  return getOrganizationsTerms(id).then((data) => {
      return termParser(data, undefined);
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

export const getMatchTerms = async (term, filters = {}) => {
  const {  getEndpointsIlx } = useApi();

  /** Call Endpoint */
  return getEndpointsIlx(BASE_GROUP,term, BASE_EXTENSION).then((data) => {
      return termParser(data, term);
    })
    .catch((error) => {
      return error;
    });
};

const fetchData = async (url, method = "GET", data = null) => {
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

export const elasticSearch = async (query) => {
  const url = API_CONFIG.BASE_SCICRUNCH_URL + import.meta.env.VITE_SCICRUNCH_API_KEY
  try {
    const result = await fetchData(url, "POST", {
      query: {
        match_all: {}
      }
    });
    return elasticSearhParser(result?.hits?.hits)
  } catch (error) {
      console.error("ElasticSearch Query Failed:", error);
  }
}

export const searchAll = async (term, filters = {}) => {
  const {  searchAll } = useMockApi();

  /** Call Endpoint */
  return searchAll("base", term, filters).then((data) => {
      let terms = termParser(data.terms, term, filters);
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
  const patchEndpointsIlx= "";

  /** Call Endpoint */
  return patchEndpointsIlx(group, termID).then((data) => {
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

export const addTerm = async (group, term) => {
  const {  addTerm } = useMockApi();

  /** Call Endpoint */
  return addTerm(group, term).then((data) => {
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

export const bulkEditTerms = async (group, payload) => {
  const { bulkEditTerms } = useMockApi();

  /** Call Endpoint */
  return bulkEditTerms(group, payload).then((data) => {
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
  return getEndpointsIlx(group,term).then((data) => {
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

export const getExistingIDs = async () => {
  const {  getMatchTerms } = useMockApi();

  /** Call Endpoint */
  return getMatchTerms("base", "*").then((data) => {
      const terms =  termParser(data, undefined);
      let existingIds = terms?.results?.map( term => term.id?.split("/").pop() );
      return terms?.results?.[0]?.id != undefined ? existingIds : [];
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