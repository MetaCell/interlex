/**
 * Generated by orval v6.28.2 🍺
 * Do not edit manually.
 * InterLex URI structure API
 * Resolution, update, and compare for ontologies and ontology identifiers.
 * OpenAPI spec version: 0.0.1
 */
import { customInstance } from './../../mutator/customClient';



  export const getEndpointsOps = (
    group: string,
    operation: string,
 ) => {
      return customInstance<void>(
      {url: `https://uri.olympiangods.org/Operations/${group}/ops/${operation}`, method: 'GET'
    },
      );
    }
  
export const postEndpointsOps = (
    group: string,
    operation: string,
 ) => {
      return customInstance<void>(
      {url: `https://uri.olympiangods.org/Operations/${group}/ops/${operation}`, method: 'POST'
    },
      );
    }
  
export const getEndpointsPriv = (
    group: string,
    page: string,
 ) => {
      return customInstance<void>(
      {url: `https://uri.olympiangods.org/Privileged endpoints/${group}/priv/${page}`, method: 'GET'
    },
      );
    }
  
export const postEndpointsPriv = (
    group: string,
    page: string,
 ) => {
      return customInstance<void>(
      {url: `https://uri.olympiangods.org/Privileged endpoints/${group}/priv/${page}`, method: 'POST'
    },
      );
    }
  
export const getEndpointsContributions = (
    group: string,
 ) => {
      return customInstance<void>(
      {url: `https://uri.olympiangods.org/${group}/contributions/interlex`, method: 'GET'
    },
      );
    }
  
export const postEndpointsCuries = (
    group: string,
 ) => {
      return customInstance<void>(
      {url: `https://uri.olympiangods.org/${group}/curies/`, method: 'POST'
    },
      );
    }
  
export const getEndpointsCuries = (
    group: string,
    prefixIriCurie: string,
 ) => {
      return customInstance<void>(
      {url: `https://uri.olympiangods.org/${group}/curies/${prefixIriCurie}`, method: 'GET'
    },
      );
    }
  
export const getDiffCuries = (
    group: string,
    otherGroupDiff: string,
    prefixIriCurie: string,
 ) => {
      return customInstance<void>(
      {url: `https://uri.olympiangods.org/${group}/diff/${otherGroupDiff}/curies/${prefixIriCurie}`, method: 'GET'
    },
      );
    }
  
export const getDiffLexical = (
    group: string,
    otherGroupDiff: string,
    label: string,
 ) => {
      return customInstance<void>(
      {url: `https://uri.olympiangods.org/${group}/diff/${otherGroupDiff}/lexical/${label}`, method: 'GET'
    },
      );
    }
  
/**
 * @summary needed because ontologies appear under other routes
 */
export const getDiffOntologiesContributions = (
    group: string,
    otherGroupDiff: string,
 ) => {
      return customInstance<void>(
      {url: `https://uri.olympiangods.org/${group}/diff/${otherGroupDiff}/ontologies/contributions`, method: 'GET'
    },
      );
    }
  
/**
 * @summary needed because ontologies appear under other routes
 */
export const getDiffOntologiesUris = (
    group: string,
    otherGroupDiff: string,
    ontPath: string,
    filename: string,
 ) => {
      return customInstance<void>(
      {url: `https://uri.olympiangods.org/${group}/diff/${otherGroupDiff}/ontologies/uris/${ontPath}/${filename}/`, method: 'GET'
    },
      );
    }
  
/**
 * @summary needed because ontologies appear under other routes
 */
export const getDiffOntologiesUrisVersion = (
    group: string,
    otherGroupDiff: string,
    ontPath: string,
    filename: string,
    epochVerstrOnt: string,
    filenameTerminal: string,
    extension: string,
 ) => {
      return customInstance<void>(
      {url: `https://uri.olympiangods.org/${group}/diff/${otherGroupDiff}/ontologies/uris/${ontPath}/${filename}/version/${epochVerstrOnt}/${filenameTerminal}.${extension}`, method: 'GET'
    },
      );
    }
  
/**
 * @summary the main ontologies endpoint
 */
export const getDiffOntologies = (
    group: string,
    otherGroupDiff: string,
    ontPath: string,
    filename: string,
 ) => {
      return customInstance<void>(
      {url: `https://uri.olympiangods.org/${group}/diff/${otherGroupDiff}/ontologies/${ontPath}/${filename}/`, method: 'GET'
    },
      );
    }
  
/**
 * @summary needed because ontologies appear under other routes
 */
export const getDiffOntologiesVersion = (
    group: string,
    otherGroupDiff: string,
    ontPath: string,
    filename: string,
    epochVerstrOnt: string,
    filenameTerminal: string,
    extension: string,
 ) => {
      return customInstance<void>(
      {url: `https://uri.olympiangods.org/${group}/diff/${otherGroupDiff}/ontologies/${ontPath}/${filename}/version/${epochVerstrOnt}/${filenameTerminal}.${extension}`, method: 'GET'
    },
      );
    }
  
export const getDiffOntologiesIlx = (
    group: string,
    otherGroupDiff: string,
    fragPrefId: string,
    extension: string,
 ) => {
      return customInstance<void>(
      {url: `https://uri.olympiangods.org/${group}/diff/${otherGroupDiff}/ontologies/${fragPrefId}.${extension}`, method: 'GET'
    },
      );
    }
  
export const getDiffReadable = (
    group: string,
    otherGroupDiff: string,
    word: string,
 ) => {
      return customInstance<void>(
      {url: `https://uri.olympiangods.org/${group}/diff/${otherGroupDiff}/readable/${word}`, method: 'GET'
    },
      );
    }
  
export const getDiffUris = (
    group: string,
    otherGroupDiff: string,
    uriPath: string,
 ) => {
      return customInstance<void>(
      {url: `https://uri.olympiangods.org/${group}/diff/${otherGroupDiff}/uris/${uriPath}`, method: 'GET'
    },
      );
    }
  
export const getDiffVersionsCuries = (
    group: string,
    otherGroupDiff: string,
    epochVerstrId: string,
 ) => {
      return customInstance<void>(
      {url: `https://uri.olympiangods.org/${group}/diff/${otherGroupDiff}/versions/${epochVerstrId}/curies/`, method: 'GET'
    },
      );
    }
  
export const getDiffVersionsReadable = (
    group: string,
    otherGroupDiff: string,
    epochVerstrId: string,
    word: string,
 ) => {
      return customInstance<void>(
      {url: `https://uri.olympiangods.org/${group}/diff/${otherGroupDiff}/versions/${epochVerstrId}/readable/${word}`, method: 'GET'
    },
      );
    }
  
export const getDiffVersionsUris = (
    group: string,
    otherGroupDiff: string,
    epochVerstrId: string,
    uriPath: string,
 ) => {
      return customInstance<void>(
      {url: `https://uri.olympiangods.org/${group}/diff/${otherGroupDiff}/versions/${epochVerstrId}/uris/${uriPath}`, method: 'GET'
    },
      );
    }
  
export const getDiffVersionsIlx = (
    group: string,
    otherGroupDiff: string,
    epochVerstrId: string,
    fragPrefId: string,
 ) => {
      return customInstance<void>(
      {url: `https://uri.olympiangods.org/${group}/diff/${otherGroupDiff}/versions/${epochVerstrId}/${fragPrefId}`, method: 'GET'
    },
      );
    }
  
export const getDiffIlx = (
    group: string,
    otherGroupDiff: string,
    fragPrefId: string,
 ) => {
      return customInstance<void>(
      {url: `https://uri.olympiangods.org/${group}/diff/${otherGroupDiff}/${fragPrefId}`, method: 'GET'
    },
      );
    }
  
export const getEndpointsMapped = (
    group: string,
 ) => {
      return customInstance<void>(
      {url: `https://uri.olympiangods.org/${group}/external/mapped`, method: 'GET'
    },
      );
    }
  
export const postEndpointsMapped = (
    group: string,
 ) => {
      return customInstance<void>(
      {url: `https://uri.olympiangods.org/${group}/external/mapped`, method: 'POST'
    },
      );
    }
  
export const getEndpointsLexical = (
    group: string,
    label: string,
 ) => {
      return customInstance<void>(
      {url: `https://uri.olympiangods.org/${group}/lexical/${label}`, method: 'GET'
    },
      );
    }
  
/**
 * @summary needed because ontologies appear under other routes
 */
export const getOntologiesOntologiesContributions = (
    group: string,
 ) => {
      return customInstance<void>(
      {url: `https://uri.olympiangods.org/${group}/ontologies/contributions`, method: 'GET'
    },
      );
    }
  
/**
 * @summary needed because ontologies appear under other routes
 */
export const getOntologiesOntologiesUris = (
    group: string,
    ontPath: string,
    filename: string,
 ) => {
      return customInstance<void>(
      {url: `https://uri.olympiangods.org/${group}/ontologies/uris/${ontPath}/${filename}/`, method: 'GET'
    },
      );
    }
  
/**
 * @summary needed because ontologies appear under other routes
 */
export const postOntologiesOntologiesUris = (
    group: string,
    ontPath: string,
    filename: string,
    extension: string,
 ) => {
      return customInstance<void>(
      {url: `https://uri.olympiangods.org/${group}/ontologies/uris/${ontPath}/${filename}.${extension}`, method: 'POST'
    },
      );
    }
  
/**
 * @summary needed because ontologies appear under other routes
 */
export const getOntologiesOntologiesUrisVersion = (
    group: string,
    ontPath: string,
    filename: string,
    epochVerstrOnt: string,
    filenameTerminal: string,
    extension: string,
 ) => {
      return customInstance<void>(
      {url: `https://uri.olympiangods.org/${group}/ontologies/uris/${ontPath}/${filename}/version/${epochVerstrOnt}/${filenameTerminal}.${extension}`, method: 'GET'
    },
      );
    }
  
/**
 * @summary needed because ontologies appear under other routes
 */
export const postOntologiesOntologiesUrisVersion = (
    group: string,
    ontPath: string,
    filename: string,
    epochVerstrOnt: string,
    filenameTerminal: string,
    extension: string,
 ) => {
      return customInstance<void>(
      {url: `https://uri.olympiangods.org/${group}/ontologies/uris/${ontPath}/${filename}/version/${epochVerstrOnt}/${filenameTerminal}.${extension}`, method: 'POST'
    },
      );
    }
  
/**
 * @summary the main ontologies endpoint
 */
export const getOntologiesOntologies = (
    group: string,
    ontPath: string,
    filename: string,
 ) => {
      return customInstance<void>(
      {url: `https://uri.olympiangods.org/${group}/ontologies/${ontPath}/${filename}/`, method: 'GET'
    },
      );
    }
  
/**
 * @summary the main ontologies endpoint
 */
export const postOntologiesOntologies = (
    group: string,
    ontPath: string,
    filename: string,
    extension: string,
 ) => {
      return customInstance<void>(
      {url: `https://uri.olympiangods.org/${group}/ontologies/${ontPath}/${filename}.${extension}`, method: 'POST'
    },
      );
    }
  
/**
 * @summary needed because ontologies appear under other routes
 */
export const getOntologiesOntologiesVersion = (
    group: string,
    ontPath: string,
    filename: string,
    epochVerstrOnt: string,
    filenameTerminal: string,
    extension: string,
 ) => {
      return customInstance<void>(
      {url: `https://uri.olympiangods.org/${group}/ontologies/${ontPath}/${filename}/version/${epochVerstrOnt}/${filenameTerminal}.${extension}`, method: 'GET'
    },
      );
    }
  
export const getOntologiesOntologiesIlx = (
    group: string,
    fragPrefId: string,
    extension: string,
 ) => {
      return customInstance<void>(
      {url: `https://uri.olympiangods.org/${group}/ontologies/${fragPrefId}.${extension}`, method: 'GET'
    },
      );
    }
  
export const postOwnCuries = (
    group: string,
    otherGroup: string,
 ) => {
      return customInstance<void>(
      {url: `https://uri.olympiangods.org/${group}/own/${otherGroup}/curies/`, method: 'POST'
    },
      );
    }
  
export const getOwnCuries = (
    group: string,
    otherGroup: string,
    prefixIriCurie: string,
 ) => {
      return customInstance<void>(
      {url: `https://uri.olympiangods.org/${group}/own/${otherGroup}/curies/${prefixIriCurie}`, method: 'GET'
    },
      );
    }
  
/**
 * @summary needed because ontologies appear under other routes
 */
export const getOwnOntologiesContributions = (
    group: string,
    otherGroup: string,
 ) => {
      return customInstance<void>(
      {url: `https://uri.olympiangods.org/${group}/own/${otherGroup}/ontologies/contributions`, method: 'GET'
    },
      );
    }
  
/**
 * @summary needed because ontologies appear under other routes
 */
export const getOwnOntologiesUris = (
    group: string,
    otherGroup: string,
    ontPath: string,
    filename: string,
 ) => {
      return customInstance<void>(
      {url: `https://uri.olympiangods.org/${group}/own/${otherGroup}/ontologies/uris/${ontPath}/${filename}/`, method: 'GET'
    },
      );
    }
  
/**
 * @summary needed because ontologies appear under other routes
 */
export const postOwnOntologiesUris = (
    group: string,
    otherGroup: string,
    ontPath: string,
    filename: string,
    extension: string,
 ) => {
      return customInstance<void>(
      {url: `https://uri.olympiangods.org/${group}/own/${otherGroup}/ontologies/uris/${ontPath}/${filename}.${extension}`, method: 'POST'
    },
      );
    }
  
/**
 * @summary needed because ontologies appear under other routes
 */
export const getOwnOntologiesUrisVersion = (
    group: string,
    otherGroup: string,
    ontPath: string,
    filename: string,
    epochVerstrOnt: string,
    filenameTerminal: string,
    extension: string,
 ) => {
      return customInstance<void>(
      {url: `https://uri.olympiangods.org/${group}/own/${otherGroup}/ontologies/uris/${ontPath}/${filename}/version/${epochVerstrOnt}/${filenameTerminal}.${extension}`, method: 'GET'
    },
      );
    }
  
/**
 * @summary needed because ontologies appear under other routes
 */
export const postOwnOntologiesUrisVersion = (
    group: string,
    otherGroup: string,
    ontPath: string,
    filename: string,
    epochVerstrOnt: string,
    filenameTerminal: string,
    extension: string,
 ) => {
      return customInstance<void>(
      {url: `https://uri.olympiangods.org/${group}/own/${otherGroup}/ontologies/uris/${ontPath}/${filename}/version/${epochVerstrOnt}/${filenameTerminal}.${extension}`, method: 'POST'
    },
      );
    }
  
/**
 * @summary the main ontologies endpoint
 */
export const getOwnOntologies = (
    group: string,
    otherGroup: string,
    ontPath: string,
    filename: string,
 ) => {
      return customInstance<void>(
      {url: `https://uri.olympiangods.org/${group}/own/${otherGroup}/ontologies/${ontPath}/${filename}/`, method: 'GET'
    },
      );
    }
  
/**
 * @summary the main ontologies endpoint
 */
export const postOwnOntologies = (
    group: string,
    otherGroup: string,
    ontPath: string,
    filename: string,
    extension: string,
 ) => {
      return customInstance<void>(
      {url: `https://uri.olympiangods.org/${group}/own/${otherGroup}/ontologies/${ontPath}/${filename}.${extension}`, method: 'POST'
    },
      );
    }
  
/**
 * @summary needed because ontologies appear under other routes
 */
export const getOwnOntologiesVersion = (
    group: string,
    otherGroup: string,
    ontPath: string,
    filename: string,
    epochVerstrOnt: string,
    filenameTerminal: string,
    extension: string,
 ) => {
      return customInstance<void>(
      {url: `https://uri.olympiangods.org/${group}/own/${otherGroup}/ontologies/${ontPath}/${filename}/version/${epochVerstrOnt}/${filenameTerminal}.${extension}`, method: 'GET'
    },
      );
    }
  
export const getOwnOntologiesIlx = (
    group: string,
    otherGroup: string,
    fragPrefId: string,
    extension: string,
 ) => {
      return customInstance<void>(
      {url: `https://uri.olympiangods.org/${group}/own/${otherGroup}/ontologies/${fragPrefId}.${extension}`, method: 'GET'
    },
      );
    }
  
export const getOwnUris = (
    group: string,
    otherGroup: string,
    uriPath: string,
 ) => {
      return customInstance<void>(
      {url: `https://uri.olympiangods.org/${group}/own/${otherGroup}/uris/${uriPath}`, method: 'GET'
    },
      );
    }
  
export const getOwnVersionsCuries = (
    group: string,
    otherGroup: string,
    epochVerstrId: string,
    prefixIriCurie: string,
 ) => {
      return customInstance<void>(
      {url: `https://uri.olympiangods.org/${group}/own/${otherGroup}/versions/${epochVerstrId}/curies/${prefixIriCurie}`, method: 'GET'
    },
      );
    }
  
export const getOwnVersionsReadable = (
    group: string,
    otherGroup: string,
    epochVerstrId: string,
    word: string,
 ) => {
      return customInstance<void>(
      {url: `https://uri.olympiangods.org/${group}/own/${otherGroup}/versions/${epochVerstrId}/readable/${word}`, method: 'GET'
    },
      );
    }
  
export const getOwnVersionsUris = (
    group: string,
    otherGroup: string,
    epochVerstrId: string,
    uriPath: string,
 ) => {
      return customInstance<void>(
      {url: `https://uri.olympiangods.org/${group}/own/${otherGroup}/versions/${epochVerstrId}/uris/${uriPath}`, method: 'GET'
    },
      );
    }
  
export const getOwnVersionsIlx = (
    group: string,
    otherGroup: string,
    epochVerstrId: string,
    fragPrefId: string,
 ) => {
      return customInstance<void>(
      {url: `https://uri.olympiangods.org/${group}/own/${otherGroup}/versions/${epochVerstrId}/${fragPrefId}`, method: 'GET'
    },
      );
    }
  
/**
 * Show users their personal uploads and then their groups.
Show groups all uploads with the user who did it
 * @summary Return all the identities that an org/user has uploaded
 */
export const getEndpointsProv = (
    group: string,
    identity: string,
 ) => {
      return customInstance<void>(
      {url: `https://uri.olympiangods.org/${group}/prov/identities/${identity}`, method: 'GET'
    },
      );
    }
  
export const getEndpointsReadable = (
    group: string,
    word: string,
 ) => {
      return customInstance<void>(
      {url: `https://uri.olympiangods.org/${group}/readable/${word}`, method: 'GET'
    },
      );
    }
  
export const patchEndpointsReadable = (
    group: string,
    word: string,
 ) => {
      return customInstance<void>(
      {url: `https://uri.olympiangods.org/${group}/readable/${word}`, method: 'PATCH'
    },
      );
    }
  
/**
 * @summary Expects files
 */
export const postEndpointsUpload = (
    group: string,
 ) => {
      return customInstance<void>(
      {url: `https://uri.olympiangods.org/${group}/upload`, method: 'POST'
    },
      );
    }
  
export const getEndpointsUris = (
    group: string,
    uriPath: string,
 ) => {
      return customInstance<void>(
      {url: `https://uri.olympiangods.org/${group}/uris/${uriPath}`, method: 'GET'
    },
      );
    }
  
export const getVersionsCuries = (
    group: string,
    epochVerstrId: string,
    prefixIriCurie: string,
 ) => {
      return customInstance<void>(
      {url: `https://uri.olympiangods.org/${group}/versions/${epochVerstrId}/curies/${prefixIriCurie}`, method: 'GET'
    },
      );
    }
  
export const getVersionsReadable = (
    group: string,
    epochVerstrId: string,
    word: string,
 ) => {
      return customInstance<void>(
      {url: `https://uri.olympiangods.org/${group}/versions/${epochVerstrId}/readable/${word}`, method: 'GET'
    },
      );
    }
  
export const getVersionsUris = (
    group: string,
    epochVerstrId: string,
    uriPath: string,
 ) => {
      return customInstance<void>(
      {url: `https://uri.olympiangods.org/${group}/versions/${epochVerstrId}/uris/${uriPath}`, method: 'GET'
    },
      );
    }
  
export const getVersionsIlx = (
    group: string,
    epochVerstrId: string,
    fragPrefId: string,
 ) => {
      return customInstance<void>(
      {url: `https://uri.olympiangods.org/${group}/versions/${epochVerstrId}/${fragPrefId}`, method: 'GET'
    },
      );
    }
  
export const getEndpointsIlx = (
    group: string,
    fragPrefId: string,
 ) => {
      return customInstance<void>(
      {url: `https://uri.olympiangods.org/${group}/${fragPrefId}`, method: 'GET'
    },
      );
    }
  
export const patchEndpointsIlx = (
    group: string,
    fragPrefId: string,
 ) => {
      return customInstance<void>(
      {url: `https://uri.olympiangods.org/${group}/${fragPrefId}`, method: 'PATCH'
    },
      );
    }
  
export const getEndpointsIlxGet = (
    group: string,
    fragPrefId: string,
    extension: string,
 ) => {
      return customInstance<void>(
      {url: `https://uri.olympiangods.org/${group}/${fragPrefId}.${extension}`, method: 'GET'
    },
      );
    }
  

type AwaitedInput<T> = PromiseLike<T> | T;

    type Awaited<O> = O extends AwaitedInput<infer T> ? T : never;

export type GetEndpointsOpsResult = NonNullable<Awaited<ReturnType<typeof getEndpointsOps>>>
export type PostEndpointsOpsResult = NonNullable<Awaited<ReturnType<typeof postEndpointsOps>>>
export type GetEndpointsPrivResult = NonNullable<Awaited<ReturnType<typeof getEndpointsPriv>>>
export type PostEndpointsPrivResult = NonNullable<Awaited<ReturnType<typeof postEndpointsPriv>>>
export type GetEndpointsContributionsResult = NonNullable<Awaited<ReturnType<typeof getEndpointsContributions>>>
export type GetEndpointsCuriesResult = NonNullable<Awaited<ReturnType<typeof getEndpointsCuries>>>
export type PostEndpointsCuriesResult = NonNullable<Awaited<ReturnType<typeof postEndpointsCuries>>>
export type GetDiffCuriesResult = NonNullable<Awaited<ReturnType<typeof getDiffCuries>>>
export type GetDiffLexicalResult = NonNullable<Awaited<ReturnType<typeof getDiffLexical>>>
export type GetDiffOntologiesContributionsResult = NonNullable<Awaited<ReturnType<typeof getDiffOntologiesContributions>>>
export type GetDiffOntologiesUrisResult = NonNullable<Awaited<ReturnType<typeof getDiffOntologiesUris>>>
export type GetDiffOntologiesUrisVersionResult = NonNullable<Awaited<ReturnType<typeof getDiffOntologiesUrisVersion>>>
export type GetDiffOntologiesResult = NonNullable<Awaited<ReturnType<typeof getDiffOntologies>>>
export type GetDiffOntologiesVersionResult = NonNullable<Awaited<ReturnType<typeof getDiffOntologiesVersion>>>
export type GetDiffOntologiesIlxResult = NonNullable<Awaited<ReturnType<typeof getDiffOntologiesIlx>>>
export type GetDiffReadableResult = NonNullable<Awaited<ReturnType<typeof getDiffReadable>>>
export type GetDiffUrisResult = NonNullable<Awaited<ReturnType<typeof getDiffUris>>>
export type GetDiffVersionsCuriesResult = NonNullable<Awaited<ReturnType<typeof getDiffVersionsCuries>>>
export type GetDiffVersionsCuriesResult = NonNullable<Awaited<ReturnType<typeof getDiffVersionsCuries>>>
export type GetDiffVersionsReadableResult = NonNullable<Awaited<ReturnType<typeof getDiffVersionsReadable>>>
export type GetDiffVersionsUrisResult = NonNullable<Awaited<ReturnType<typeof getDiffVersionsUris>>>
export type GetDiffVersionsIlxResult = NonNullable<Awaited<ReturnType<typeof getDiffVersionsIlx>>>
export type GetDiffIlxResult = NonNullable<Awaited<ReturnType<typeof getDiffIlx>>>
export type GetEndpointsMappedResult = NonNullable<Awaited<ReturnType<typeof getEndpointsMapped>>>
export type PostEndpointsMappedResult = NonNullable<Awaited<ReturnType<typeof postEndpointsMapped>>>
export type GetEndpointsLexicalResult = NonNullable<Awaited<ReturnType<typeof getEndpointsLexical>>>
export type GetOntologiesOntologiesContributionsResult = NonNullable<Awaited<ReturnType<typeof getOntologiesOntologiesContributions>>>
export type GetOntologiesOntologiesUrisResult = NonNullable<Awaited<ReturnType<typeof getOntologiesOntologiesUris>>>
export type PostOntologiesOntologiesUrisResult = NonNullable<Awaited<ReturnType<typeof postOntologiesOntologiesUris>>>
export type GetOntologiesOntologiesUrisVersionResult = NonNullable<Awaited<ReturnType<typeof getOntologiesOntologiesUrisVersion>>>
export type PostOntologiesOntologiesUrisVersionResult = NonNullable<Awaited<ReturnType<typeof postOntologiesOntologiesUrisVersion>>>
export type GetOntologiesOntologiesResult = NonNullable<Awaited<ReturnType<typeof getOntologiesOntologies>>>
export type PostOntologiesOntologiesResult = NonNullable<Awaited<ReturnType<typeof postOntologiesOntologies>>>
export type GetOntologiesOntologiesVersionResult = NonNullable<Awaited<ReturnType<typeof getOntologiesOntologiesVersion>>>
export type GetOntologiesOntologiesIlxResult = NonNullable<Awaited<ReturnType<typeof getOntologiesOntologiesIlx>>>
export type GetOwnCuriesResult = NonNullable<Awaited<ReturnType<typeof getOwnCuries>>>
export type PostOwnCuriesResult = NonNullable<Awaited<ReturnType<typeof postOwnCuries>>>
export type GetOwnOntologiesContributionsResult = NonNullable<Awaited<ReturnType<typeof getOwnOntologiesContributions>>>
export type GetOwnOntologiesUrisResult = NonNullable<Awaited<ReturnType<typeof getOwnOntologiesUris>>>
export type PostOwnOntologiesUrisResult = NonNullable<Awaited<ReturnType<typeof postOwnOntologiesUris>>>
export type GetOwnOntologiesUrisVersionResult = NonNullable<Awaited<ReturnType<typeof getOwnOntologiesUrisVersion>>>
export type PostOwnOntologiesUrisVersionResult = NonNullable<Awaited<ReturnType<typeof postOwnOntologiesUrisVersion>>>
export type GetOwnOntologiesResult = NonNullable<Awaited<ReturnType<typeof getOwnOntologies>>>
export type PostOwnOntologiesResult = NonNullable<Awaited<ReturnType<typeof postOwnOntologies>>>
export type GetOwnOntologiesVersionResult = NonNullable<Awaited<ReturnType<typeof getOwnOntologiesVersion>>>
export type GetOwnOntologiesIlxResult = NonNullable<Awaited<ReturnType<typeof getOwnOntologiesIlx>>>
export type GetOwnUrisResult = NonNullable<Awaited<ReturnType<typeof getOwnUris>>>
export type GetOwnVersionsCuriesResult = NonNullable<Awaited<ReturnType<typeof getOwnVersionsCuries>>>
export type GetOwnVersionsReadableResult = NonNullable<Awaited<ReturnType<typeof getOwnVersionsReadable>>>
export type GetOwnVersionsUrisResult = NonNullable<Awaited<ReturnType<typeof getOwnVersionsUris>>>
export type GetOwnVersionsIlxResult = NonNullable<Awaited<ReturnType<typeof getOwnVersionsIlx>>>
export type GetEndpointsProvResult = NonNullable<Awaited<ReturnType<typeof getEndpointsProv>>>
export type GetEndpointsReadableResult = NonNullable<Awaited<ReturnType<typeof getEndpointsReadable>>>
export type PatchEndpointsReadableResult = NonNullable<Awaited<ReturnType<typeof patchEndpointsReadable>>>
export type PostEndpointsUploadResult = NonNullable<Awaited<ReturnType<typeof postEndpointsUpload>>>
export type GetEndpointsUrisResult = NonNullable<Awaited<ReturnType<typeof getEndpointsUris>>>
export type GetVersionsCuriesResult = NonNullable<Awaited<ReturnType<typeof getVersionsCuries>>>
export type GetVersionsReadableResult = NonNullable<Awaited<ReturnType<typeof getVersionsReadable>>>
export type GetVersionsUrisResult = NonNullable<Awaited<ReturnType<typeof getVersionsUris>>>
export type GetVersionsIlxResult = NonNullable<Awaited<ReturnType<typeof getVersionsIlx>>>
export type GetEndpointsIlxResult = NonNullable<Awaited<ReturnType<typeof getEndpointsIlx>>>
export type PatchEndpointsIlxResult = NonNullable<Awaited<ReturnType<typeof patchEndpointsIlx>>>
export type GetEndpointsIlxGetResult = NonNullable<Awaited<ReturnType<typeof getEndpointsIlxGet>>>
