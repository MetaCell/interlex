import { assert } from 'console';
import { OrganizationsIcon } from '../../Icons';
import { Organizations, Organization, Variants, Versions } from '../../model/backend';
import * as mockApi from './../../api/endpoints/swaggerMockMissingEndpoints';
import * as api from './../../api/endpoints/interLexURIStructureAPI'

import curieParser from '../../parsers/curieParser';
import termParser from '../../parsers/termParser';

const useMockApi = () => mockApi;
const useApi = () => api;

export const getOrganizations = () => {
    /** Call endpoint for retrieving organizations, this is a mock endpoint
    created by us */
    const {  getOrganizations } = useMockApi();

    /** Call Endpoint */
    const organizations = getOrganizations().then((data) => {
        return data;
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

export const getMatchTerms = async (term) => {
  /** Call endpoint for retrieving curies, this is a mock endpoint
  created by us */
  const {  getMatchTerms } = useMockApi();

  /** Call Endpoint */
  return getMatchTerms("base", term).then((data) => {
      return termParser(data, term);
    })
    .catch((error) => {
      return error;
    });
}

export const getEndpointsIlx = async (group, term) => {
  /** Call endpoint for retrieving curies, this is a mock endpoint
  created by us */
  const {  getEndpointsIlx } = useApi();

  /** Call Endpoint */
  return getEndpointsIlx(group,term).then((data) => {
      return termParser(data, term);
    })
    .catch((error) => {
      return error;
    });
}