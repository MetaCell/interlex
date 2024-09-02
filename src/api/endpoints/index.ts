import { Organizations, Variants, Versions, User, Organization, Terms, Ontologies, Discussions, AddToDiscussion200, AddToTermDiscussion200 } from '../../model/backend';
import * as mockApi from './../../api/endpoints/swaggerMockMissingEndpoints';
import * as api from './../../api/endpoints/interLexURIStructureAPI'
import { TERM, ONTOLOGY, ORGANIZATION } from '../../model/frontend/types'
import curieParser from '../../parsers/curieParser';
import termParser, { getTerm } from '../../parsers/termParser';
import { Curies } from '../../model/frontend/curies';

const useMockApi = () => mockApi;
const useApi = () => api;

export const getOrganizations = async () => {
    /** Call endpoint for retrieving organizations, this is a mock endpoint
    created by us */
    const {  getOrganizations } = useMockApi();

    /** Call Endpoint */
    return getOrganizations().then((data) => {
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
  const {  getMatchTerms } = useMockApi();

  /** Call Endpoint */
  return getMatchTerms("base", term, filters).then((data) => {
      return termParser(data, term, filters);
    })
    .catch((error) => {
      return error;
    });
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
  const {  patchEndpointsIlx } = useApi();

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