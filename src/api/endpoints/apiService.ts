import { createPostRequest } from "./apiActions";
import { API_CONFIG } from "../../config";

export interface LoginRequest {
  username: string
  password: string
}

export const login = createPostRequest<any, LoginRequest>(API_CONFIG.REAL_API.SIGNIN, "application/x-www-form-urlencoded")
