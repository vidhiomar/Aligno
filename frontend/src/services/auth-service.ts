import { apiClient } from "@/services/api";
import type {
  AuthTokens,
  LoginPayload,
  RegisterPayload,
  User,
} from "@/types/auth";

export const authService = {
  login: (payload: LoginPayload) =>
    apiClient.post<AuthTokens, LoginPayload>(
      "/auth/login",
      payload
    ),

  register: (payload: RegisterPayload) =>
    apiClient.post<User, RegisterPayload>(
      "/auth/register", payload
    ),

  me: () => apiClient.get<User>("/auth/me"),
};