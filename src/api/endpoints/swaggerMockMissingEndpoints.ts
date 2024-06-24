/**
 * Generated by orval v6.28.2 🍺
 * Do not edit manually.
 * Swagger Mock Missing Endpoints
 * OpenAPI spec version: 1.0.0
 */
import type {
  Curies,
  Discussions,
  Hierarchies,
  Organization,
  Organizations,
  Terms,
  Variants,
  Versions
} from '../../model/backend'
import { customInstance } from '../../../mock/mutator/customClient';



  /**
 * @summary Log in to OpenAPI space
 */
export const login = (
    
 ) => {
      return customInstance<void>(
      {url: `/operations/login`, method: 'POST'
    },
      );
    }
  
/**
 * @summary Log out from OpenAPI space
 */
export const logout = (
    
 ) => {
      return customInstance<void>(
      {url: `/operations/logout`, method: 'POST'
    },
      );
    }
  
/**
 * @summary Register to OpenAPI space
 */
export const register = (
    
 ) => {
      return customInstance<void>(
      {url: `/operations/register`, method: 'POST'
    },
      );
    }
  
/**
 * @summary Used to retrieve a specific organization.
 */
export const getOrganization = (
    organization: Organization,
 ) => {
      return customInstance<Organization>(
      {url: `/operations/organization`, method: 'GET',
      headers: {'Content-Type': 'application/json', }
    },
      );
    }
  
/**
 * @summary Used to save a new organization.
 */
export const newOrganization = (
    organization: Organization,
 ) => {
      return customInstance<Organization>(
      {url: `/operations/organization`, method: 'POST',
      headers: {'Content-Type': 'application/json', },
      data: organization
    },
      );
    }
  
/**
 * @summary Get all organizations
 */
export const getOrganizations = (
    
 ) => {
      return customInstance<Organizations>(
      {url: `/operations/organizations`, method: 'GET'
    },
      );
    }
  
/**
 * @summary Generic search
 */
export const getSearchResults = (
    group: string,
    string: string,
 ) => {
      return customInstance<Terms>(
      {url: `/${group}/search/${string}`, method: 'GET'
    },
      );
    }
  
/**
 * @summary Retrieve hierarchy results
 */
export const getHierarchyResults = (
    group: string,
    property: string,
    start: string,
 ) => {
      return customInstance<Terms>(
      {url: `/${group}/query/transitive/${property}/${start}?depth`, method: 'GET'
    },
      );
    }
  
/**
 * @summary List all matching terms
 */
export const getMatchTerms = (
    term: string,
 ) => {
      return customInstance<Terms>(
      {url: `/search_term/${term}`, method: 'GET'
    },
      );
    }
  
/**
 * @summary List all curies for group
 */
export const getCuries = (
    group: string,
 ) => {
      return customInstance<Curies>(
      {url: `/get_curies/${group}`, method: 'GET'
    },
      );
    }
  
/**
 * @summary List all variants for a term
 */
export const getVariants = (
    group: string,
    term: string,
 ) => {
      return customInstance<Variants>(
      {url: `/${group}/variants/${term}`, method: 'GET'
    },
      );
    }
  
/**
 * @summary List all versions for a term
 */
export const getVersions = (
    group: string,
    term: string,
 ) => {
      return customInstance<Versions>(
      {url: `/${group}/versions/${term}`, method: 'GET'
    },
      );
    }
  
/**
 * @summary List all discussions for a term
 */
export const getDiscussions = (
    group: string,
    term: string,
 ) => {
      return customInstance<Discussions>(
      {url: `/${group}/discussions/${term}`, method: 'GET'
    },
      );
    }
  
/**
 * @summary List all hierarchies for a term
 */
export const getHierarchies = (
    group: string,
    term: string,
 ) => {
      return customInstance<Hierarchies>(
      {url: `/${group}/hierarchies/${term}`, method: 'GET'
    },
      );
    }
  
/**
 * @summary Checks if the server is running
 */
export const getPing = (
    
 ) => {
      return customInstance<void>(
      {url: `/ping`, method: 'GET'
    },
      );
    }
  

type AwaitedInput<T> = PromiseLike<T> | T;

    type Awaited<O> = O extends AwaitedInput<infer T> ? T : never;

export type LoginResult = NonNullable<Awaited<ReturnType<typeof login>>>
export type LogoutResult = NonNullable<Awaited<ReturnType<typeof logout>>>
export type RegisterResult = NonNullable<Awaited<ReturnType<typeof register>>>
export type GetOrganizationResult = NonNullable<Awaited<ReturnType<typeof getOrganization>>>
export type NewOrganizationResult = NonNullable<Awaited<ReturnType<typeof newOrganization>>>
export type GetOrganizationsResult = NonNullable<Awaited<ReturnType<typeof getOrganizations>>>
export type GetSearchResultsResult = NonNullable<Awaited<ReturnType<typeof getSearchResults>>>
export type GetHierarchyResultsResult = NonNullable<Awaited<ReturnType<typeof getHierarchyResults>>>
export type GetMatchTermsResult = NonNullable<Awaited<ReturnType<typeof getMatchTerms>>>
export type GetCuriesResult = NonNullable<Awaited<ReturnType<typeof getCuries>>>
export type GetVariantsResult = NonNullable<Awaited<ReturnType<typeof getVariants>>>
export type GetVersionsResult = NonNullable<Awaited<ReturnType<typeof getVersions>>>
export type GetDiscussionsResult = NonNullable<Awaited<ReturnType<typeof getDiscussions>>>
export type GetHierarchiesResult = NonNullable<Awaited<ReturnType<typeof getHierarchies>>>
export type GetPingResult = NonNullable<Awaited<ReturnType<typeof getPing>>>
