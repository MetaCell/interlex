import { AxiosRequestConfig } from 'axios';
import { customInstance } from '../../../mock/mutator/customClient';

type SecondParameter<T extends (...args: any) => any> = Parameters<T>[1];

interface CustomRequestConfig extends AxiosRequestConfig {
  handleRedirect?: boolean;
}

export const createPostRequest = <T = any, D = any>(endpoint: string, headers: object) => {
  return async (data?: D, options?: CustomRequestConfig) => {
    // Use fetch for handling redirect responses
    if (options?.handleRedirect) {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          ...headers,
        },
        body: JSON.stringify(data),
        credentials: 'include',
        redirect: 'manual'
      });

      // Handle 303 redirect
      if (response.status === 303) {
        const redirectUrl = response.headers.get('x-redirect-location') || response.headers.get('Location');
        if (redirectUrl) {
          const tmpMatch = redirectUrl.match(/tmp_\d{9}/);
          if (tmpMatch) {
            return {
              term: {
                id: tmpMatch[0]
              }
            };
          }
        }
      }

      // Handle 409 Conflict
      if (response.status === 409) {
        const responseData = await response.json();
        const match = responseData?.existing?.[0];
        if (match) {
          return {
            term: {
              id: match
            },
            raw: responseData,
            status: response.status
          };
        }
      }

      // Default response
      const text = await response.text();
      try {
        const json = JSON.parse(text);
        return {
          raw: json,
          status: response.status
        };
      } catch {
        return {
          raw: text,
          status: response.status
        };
      }
    }

    // Default axios behavior for normal requests
    return customInstance<T>(
      {
        url: endpoint,
        method: "POST",
        data: data,
        headers: headers,
        withCredentials: true
      },
      options,
    )
  }
}

export const createGetRequest = <T = any, P = any>(endpoint: string, contentType?: string) => {
  return (params?: P, options?: SecondParameter<typeof customInstance>, signal?: AbortSignal) => {
    const absUrl = endpoint.startsWith('http')
      ? endpoint
      : new URL(endpoint.startsWith('/') ? endpoint : `/${endpoint}`, window.location.origin).toString();

    const config: AxiosRequestConfig = {
      url: absUrl,
      method: "GET",
      params,
      signal,
      withCredentials: true
    };

    if (contentType) {
      config.headers = {
        ...config.headers,
        Accept: contentType,
      };
    }

    return customInstance<T>(config, options).then(response => response);
  }
}