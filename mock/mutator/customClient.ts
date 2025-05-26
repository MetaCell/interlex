import Axios, { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { API_CONFIG } from '../../src/config';

export const AXIOS_INSTANCE = Axios.create({
  baseURL: API_CONFIG.BASE_URL,
  withCredentials: true,
});

export const customInstance = <T>(
  config: AxiosRequestConfig,
  options?: AxiosRequestConfig
): Promise<T> => {
  const source = Axios.CancelToken.source();

  const promise = AXIOS_INSTANCE({
    ...config,
    ...options,
    cancelToken: source.token,
    withCredentials: true,
    validateStatus: (status) => status >= 200 && status < 400,
  })
    .then(async (response: AxiosResponse<T>) => {
      const isRedirect = response.status === 303;
      const redirectUrl = response.headers['x-redirect-location'];

      if (isRedirect && redirectUrl) {
        const followUp = await AXIOS_INSTANCE.get<T>(redirectUrl, {
          withCredentials: true,
          headers: {
            Accept: 'text/turtle',
          },
          validateStatus: (status) => status === 200,
        });

        return followUp.data;
      }

      return response.data;
    })
    .catch((error: AxiosError) => {
      throw error;
    });

  // @ts-ignore
  promise.cancel = () => {
    console.log("query was cancelled");
    source.cancel("Query was cancelled");
  };

  return promise;
};

// Error typing helpers
export type ErrorType<Error> = AxiosError<Error>;
export type BodyType<BodyData> = BodyData;
