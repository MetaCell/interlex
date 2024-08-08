import { Organizations, Variants, Versions, User, Organization } from '../../model/backend';
import * as mockApi from './../../api/endpoints/swaggerMockMissingEndpoints';
import * as api from './../../api/endpoints/interLexURIStructureAPI'

import curieParser from '../../parsers/curieParser';
import termParser from '../../parsers/termParser';

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

export const patchTerm = async (group, termID, term) => {
  const {  patchEndpointsIlx } = useApi();

  /** Call Endpoint */
  return patchEndpointsIlx(group, termID, term).then((data) => {
      console.log("patch term response ", data)
      return data;
    })
    .catch((error) => {
      return error;
    });
}

export const addTerm = async (group, term) => {
  const {  addTerm } = useMockApi();

  /** Call Endpoint */
  return addTerm(group, term).then((data) => {
      console.log("add term response ", data)
      return data;
    })
    .catch((error) => {
      return error;
    });
}

export const bulkEditTerms = async (group, payload) => {
  const { bulkEditTerms } = useMockApi();

  /** Call Endpoint */
  return bulkEditTerms(group, payload).then((data) => {
      console.log("bulkEditTerms ", data)
      return data;
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
      return existingIds;
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