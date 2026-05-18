import { apiClient } from "@/services/api";

export interface AuditLogEntry {
  id: number;
  goal_id: number;
  changed_by: number;
  field_name: string;
  old_value: string | null;
  new_value: string | null;
  changed_at: string;
}

export interface AdminUser {
  id: number;
  email: string;
  full_name: string | null;
  role: string;
  manager_id: number | null;
  is_active: boolean;
}

export interface CycleConfig {
  id: string;
  label: string;
  opens: string;
  closes: string;
  is_active: boolean;
}

export interface LockedGoal {
  id: number;
  employee_id: number;
  title: string;
  status: string;
  is_locked: boolean;
  weightage: number;
}

export interface EscalationRule {
  id: string;
  condition: string;
  days_threshold: number;
  escalation_chain: string[];
  is_active: boolean;
}

export interface EscalationLog {
  id: string;
  rule_id: string;
  employee_name: string;
  triggered_at: string;
  status: string;
  resolved_at: string | null;
}

export const adminService = {
  getAuditLogs: () =>
    apiClient.get<{ logs: AuditLogEntry[] }>("/admin/audit-logs"),
  getUsers: () => apiClient.get<{ users: AdminUser[] }>("/admin/users"),
  updateUser: (userId: number, payload: Partial<AdminUser>) =>
    apiClient.patch<AdminUser>(`/admin/users/${userId}`, payload),
  getLockedGoals: () =>
    apiClient.get<{ goals: LockedGoal[] }>("/admin/locked-goals"),
  unlockGoal: (goalId: number, reason: string) =>
    apiClient.post(`/admin/goals/${goalId}/unlock`, { reason }),
  getCycles: () =>
    apiClient.get<{ cycles: CycleConfig[] }>("/admin/cycles"),
  updateCycle: (cycleId: string, payload: Partial<CycleConfig>) =>
    apiClient.patch(`/admin/cycles/${cycleId}`, payload),
  getEscalationRules: () =>
    apiClient.get<{ rules: EscalationRule[] }>("/admin/escalation-rules"),
  updateEscalationRule: (ruleId: string, payload: Partial<EscalationRule>) =>
    apiClient.patch(`/admin/escalation-rules/${ruleId}`, payload),
  getEscalationLogs: () =>
    apiClient.get<{ logs: EscalationLog[] }>("/admin/escalation-logs"),
};
