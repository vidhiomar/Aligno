import { apiClient } from "@/services/api";
import type {
  Goal,
  GoalListResponse,
  GoalPayload,
  GoalSubmitResponse,
  SharedGoalPayload,
} from "@/types/goal";

export const goalService = {
  getMyGoals: () => apiClient.get<GoalListResponse>("/goals"),
  createGoal: (payload: GoalPayload) =>
    apiClient.post<Goal, GoalPayload>("/goals", payload),
  updateGoal: (goalId: number, payload: Partial<GoalPayload>) =>
    apiClient.patch<Goal, Partial<GoalPayload>>(`/goals/${goalId}`, payload),
  deleteGoal: (goalId: number) => apiClient.delete<void>(`/goals/${goalId}`),
  submitGoalSheet: () => apiClient.post<GoalSubmitResponse>("/goals/submit"),
  createSharedGoal: (payload: SharedGoalPayload) =>
    apiClient.post<GoalListResponse, SharedGoalPayload>("/goals/shared", payload),
};
