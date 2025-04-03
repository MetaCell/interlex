import { createPostRequest } from "./apiActions";
import { API_CONFIG } from "../../config";

export interface LoginRequest {
  username: string
  password: string
}

export interface RegisterRequest {
  username: string
  password: string
  firstName: string
  lastName: string
  email: string
  organization: string
}

export const login = createPostRequest<any, LoginRequest>(API_CONFIG.REAL_API.SIGNIN, "application/x-www-form-urlencoded")
export const register = createPostRequest<any, RegisterRequest>(API_CONFIG.REAL_API.NEWUSER_ILX, "application/x-www-form-urlencoded")