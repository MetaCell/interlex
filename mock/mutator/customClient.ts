import Axios, { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { API_CONFIG } from '../../src/config';

const AXIOS_INSTANCE = Axios.create({
  baseURL: API_CONFIG.BASE_URL,
  validateStatus: function (status) {
    return status !== undefined && status >= 200 && status < 400;
  },
  withCredentials: true,
});

AXIOS_INSTANCE.interceptors.response.use(
  async (response: AxiosResponse) => {
    const redirectUrl = response.headers['x-redirect-location'];

    if (response.status === 303 && redirectUrl) {
      let redirectedPath: string;

      try {
        // If it's a full URL, extract only the pathname
        const parsed = new URL(redirectUrl);
        redirectedPath = parsed.pathname;
      } catch {
        // If it's already a relative path
        redirectedPath = redirectUrl;
      }

      console.debug('Redirect intercepted. Rewriting to:', redirectedPath);

      try {
        const redirectedResponse = await AXIOS_INSTANCE.get(redirectedPath, {
          headers: {
            Accept: 'text/html',
            ...response.config.headers,
          },
          withCredentials: true,
        });

        return redirectedResponse;
      } catch (fetchError) {
        console.error('Redirect follow failed:', fetchError);
        return Promise.reject(fetchError);
      }
    }

    return response;
  },
  (error) => {
    console.error('Interceptor error:', error);
    return Promise.reject(error);
  }
);

export default AXIOS_INSTANCE;

export const customInstance = <T>(
  config: AxiosRequestConfig,
  options?: AxiosRequestConfig,
): Promise<T> => {
  const source = Axios.CancelToken.source();

  const promise = AXIOS_INSTANCE({
    ...config,
    ...options,
    cancelToken: source.token,
  })
    .then(({ data }) => data)
    .catch((error) => {
      throw error;
    });

  promise.cancel = () => {
    console.log('Query was cancelled');
    source.cancel('Query was cancelled');
  };

  return promise;
};

export type ErrorType<Error> = AxiosError<Error>;

export type BodyType<BodyData> = BodyData;

export type BodyType<BodyData> = CamelCase<BodyData>;
