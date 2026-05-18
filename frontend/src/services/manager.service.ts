import { apiClient } from "@/services/api";
import type {
  ManagerGoal,
  ManagerGoalUpdatePayload,
  ManagerGoalListResponse,
  ManagerReviewPayload,
} from "@/types/manager";

export const managerService = {
  getPendingGoals: () =>
    apiClient.get<ManagerGoalListResponse>("/manager/goals"),
  getEmployeeGoals: (employeeId: number) =>
    apiClient.get<ManagerGoalListResponse>(`/manager/goals/${employeeId}`),
  updateGoalInline: (goalId: number, payload: ManagerGoalUpdatePayload) =>
    apiClient.patch<ManagerGoal, ManagerGoalUpdatePayload>(
      `/manager/goals/${goalId}`,
      payload,
    ),
  approveGoal: (goalId: number, payload: ManagerReviewPayload = {}) =>
    apiClient.post<ManagerGoal, ManagerReviewPayload>(
      `/manager/goals/${goalId}/approve`,
      payload,
    ),
  reworkGoal: (goalId: number, payload: Required<ManagerReviewPayload>) =>
    apiClient.post<ManagerGoal, Required<ManagerReviewPayload>>(
      `/manager/goals/${goalId}/rework`,
      payload,
    ),
  rejectGoal: (goalId: number, payload: Required<ManagerReviewPayload>) =>
    apiClient.post<ManagerGoal, Required<ManagerReviewPayload>>(
      `/manager/goals/${goalId}/reject`,
      payload,
    ),
};
