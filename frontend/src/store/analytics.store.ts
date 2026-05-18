"use client";

import { create } from "zustand";

import { analyticsService } from "@/services/analytics.service";
import type {
  EmployeeAnalytics,
  ExportFormat,
  OrgAnalytics,
  TeamAnalytics,
} from "@/types/analytics";

interface AnalyticsState {
  dashboardData: EmployeeAnalytics | null;
  teamAnalytics: TeamAnalytics | null;
  orgAnalytics: OrgAnalytics | null;
  loading: boolean;
  exportLoading: boolean;
  error: string | null;
  fetchMyAnalytics: () => Promise<void>;
  fetchTeamAnalytics: () => Promise<void>;
  fetchOrgAnalytics: () => Promise<void>;
  exportReport: (format: ExportFormat) => Promise<void>;
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export const useAnalyticsStore = create<AnalyticsState>()((set) => ({
  dashboardData: null,
  teamAnalytics: null,
  orgAnalytics: null,
  loading: false,
  exportLoading: false,
  error: null,
  fetchMyAnalytics: async () => {
    set({ loading: true, error: null });
    try {
      const dashboardData = await analyticsService.getMyAnalytics();
      set({ dashboardData });
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : "Unable to load analytics",
      });
      throw error;
    } finally {
      set({ loading: false });
    }
  },
  fetchTeamAnalytics: async () => {
    set({ loading: true, error: null });
    try {
      const teamAnalytics = await analyticsService.getTeamAnalytics();
      set({ teamAnalytics });
    } catch (error) {
      set({
        error:
          error instanceof Error
            ? error.message
            : "Unable to load team analytics",
      });
      throw error;
    } finally {
      set({ loading: false });
    }
  },
  fetchOrgAnalytics: async () => {
    set({ loading: true, error: null });
    try {
      const orgAnalytics = await analyticsService.getOrgAnalytics();
      set({ orgAnalytics });
    } catch (error) {
      set({
        error:
          error instanceof Error
            ? error.message
            : "Unable to load organization analytics",
      });
      throw error;
    } finally {
      set({ loading: false });
    }
  },
  exportReport: async (format) => {
    set({ exportLoading: true, error: null });
    try {
      const blob = await analyticsService.exportReport(format);
      downloadBlob(blob, `aligno-report.${format}`);
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : "Unable to export report",
      });
      throw error;
    } finally {
      set({ exportLoading: false });
    }
  },
}));
