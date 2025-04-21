import { AxiosRequestConfig } from 'axios';
import { customInstance } from '../../../mock/mutator/customClient';
import { API_CONFIG } from '../../config';
import { useCookies } from 'react-cookie'


type SecondParameter<T extends (...args: any) => any> = Parameters<T>[1];

export const createPostRequest = <T = any, D = any>(endpoint: string, contentType = "application/json") => {
  return (data?: D, options?: SecondParameter<typeof customInstance>) => {
    return customInstance<T>(
      {
        url: API_CONFIG.BASE_URL + endpoint,
        method: "POST",
        data: data,
        headers: {
          "Content-Type": contentType,
        },
      },
      options,
    )
  }
}

export const createPostRequestAnother = <T = any, D = any>(endpoint: string, contentType = "application/json") => {
  return (data?: any, options?: SecondParameter<typeof customInstance>) => {
    console.log("data session: ", data.session)
    return customInstance<T>(
      {
        url: "https://uri.olympiangods.org/aigul/priv/org-new",
        method: "POST",
        // data: "a test",
        headers: {
          "Content-Type": contentType,
          "session": data.session,
          "Access-Control-Allow-Origin": "http://127.0.0.1:5173",
          // "Access-Control-Allow-Credentials": "true",
          // "Access-Control-Allow-Headers": "content-type",
          // "Access-Control-Allow-Methods": "PUT, POST, GET, DELETE, PATCH, OPTIONS",
          // "Cookie": `session=${data.session}`
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
      url: API_CONFIG.BASE_URL + endpoint,
      method: "GET",
      params,
      signal,
    }
    
    if (contentType) {
      config.headers = {
        ...config.headers,
        "Content-Type": contentType,
      }
    }
  
    return customInstance<T>(config, options)
  }
}