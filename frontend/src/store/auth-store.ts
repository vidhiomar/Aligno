"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { authService } from "@/services/auth-service";
import type { LoginPayload, RegisterPayload, User } from "@/types/auth";

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  fetchMe: () => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: false,
      login: async (payload) => {
        set({ isLoading: true });
        try {
          const tokens = await authService.login(payload);
          set({ accessToken: tokens.access_token, isAuthenticated: true });
          await useAuthStore.getState().fetchMe();
        } finally {
          set({ isLoading: false });
        }
      },
      register: async (payload) => {
        set({ isLoading: true });
        try {
          await authService.register(payload);
          await useAuthStore.getState().login({
            email: payload.email,
            password: payload.password,
          });
        } finally {
          set({ isLoading: false });
        }
      },
      fetchMe: async () => {
        const user = await authService.me();
        set({ user, isAuthenticated: true });
      },
      logout: () => {
        set({ user: null, accessToken: null, isAuthenticated: false });
      },
    }),
    {
      name: "aligno-auth",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
