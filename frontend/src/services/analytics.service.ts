import { api, apiClient } from "@/services/api";
import type {
  EmployeeAnalytics,
  ExportFormat,
  OrgAnalytics,
  TeamAnalytics,
} from "@/types/analytics";

export const analyticsService = {
  getMyAnalytics: () => apiClient.get<EmployeeAnalytics>("/analytics/me"),
  getTeamAnalytics: () => apiClient.get<TeamAnalytics>("/analytics/team"),
  getOrgAnalytics: () => apiClient.get<OrgAnalytics>("/analytics/org"),
  exportReport: async (format: ExportFormat) => {
    const response = await api.get<Blob>("/reports/export", {
      params: { format },
      responseType: "blob",
    });
    return response.data;
  },
};
