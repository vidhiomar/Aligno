import axios, { AxiosError, type AxiosRequestConfig } from "axios";

import { useAuthStore } from "@/store/auth-store";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
    }

    return Promise.reject(error);
  },
);

export const apiClient = {
  get: async <T>(url: string, config?: AxiosRequestConfig) =>
    (await api.get<T>(url, config)).data,
  post: async <T, D = unknown>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig,
  ) => (await api.post<T>(url, data, config)).data,
  put: async <T, D = unknown>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig,
  ) => (await api.put<T>(url, data, config)).data,
  patch: async <T, D = unknown>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig,
  ) => (await api.patch<T>(url, data, config)).data,
  delete: async <T>(url: string, config?: AxiosRequestConfig) =>
    (await api.delete<T>(url, config)).data,
};
