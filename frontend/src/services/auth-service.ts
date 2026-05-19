import { apiClient } from "@/services/api";
import type {
  AuthTokens,
  LoginPayload,
  RegisterPayload,
  User,
} from "@/types/auth";

export const authService = {
  login: async (payload: LoginPayload) => {
    const formData = new URLSearchParams();

    formData.append("username", payload.email);
    formData.append("password", payload.password);

    return apiClient.post<AuthTokens>(
      "/auth/login",
      formData,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );
  },

  register: (payload: RegisterPayload) =>
    apiClient.post<User, RegisterPayload>("/auth/register", payload),

  me: () => apiClient.get<User>("/auth/me"),
};