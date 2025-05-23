import { AxiosRequestConfig } from 'axios';
import { customInstance } from '../../../mock/mutator/customClient';
import { API_CONFIG } from '../../config';
import { useCookies } from 'react-cookie'


type SecondParameter<T extends (...args: any) => any> = Parameters<T>[1];

export const createPostRequest = <T = any, D = any>(endpoint: string, contentType = "application/json") => {
  return (data?: D, options?: SecondParameter<typeof customInstance>) => {
    return customInstance<T>(
      {
        url: endpoint,
        method: "POST",
        data: data,
        headers: {
          "Content-Type": contentType,
        },
        withCredentials: true
      },
      options,
    )
  }
}

export const createGetRequest = <T = any, P = any>(endpoint: string, contentType?: string) => {
  return (params?: P, options?: SecondParameter<typeof customInstance>, signal?: AbortSignal) => {
    const config: AxiosRequestConfig = {
      url: endpoint,
      method: "GET",
      params,
      signal,
      withCredentials: true
    }

    if (contentType) {
      config.headers = {
        ...config.headers,
        "Content-Type": contentType,
      }
    }

    return customInstance<T>(config, options).then(response => {
      return response;
    });
  }
}
