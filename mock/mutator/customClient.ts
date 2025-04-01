import Axios, { AxiosRequestConfig } from 'axios';
import { API_CONFIG } from '../../src/config';
export const AXIOS_INSTANCE = Axios.create({ baseURL: API_CONFIG.BASE_URL });

// add a second `options` argument here if you want to pass extra options to each generated query
export const customInstance = <T>(
  config: AxiosRequestConfig,
  options?: AxiosRequestConfig,
): Promise<T> => {
  const source = Axios.CancelToken.source();
  const promise = AXIOS_INSTANCE({
    ...config,
    ...options,
    cancelToken: source.token,
  }).then(({ data }) => data).catch(error => {
    throw error;
  });

  // @ts-ignore
  promise.cancel = () => {
    console.log("query was cancelled")
    source.cancel('Query was cancelled');
  };

  return promise;
};

// In some case with react-query and swr you want to be able to override the return error type so you can also do it here like this
export type ErrorType<Error> = AxiosError<Error>;

export type BodyType<BodyData> = BodyData;

// Or, in case you want to wrap the body type (optional)
// (if the custom instance is processing data before sending it, like changing the case for example)
export type BodyType<BodyData> = CamelCase<BodyData>;
