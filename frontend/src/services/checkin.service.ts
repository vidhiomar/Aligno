import { apiClient } from "@/services/api";
import type {
  AchievementCreatePayload,
  AchievementListResponse,
  AchievementUpdate,
  AchievementUpdatePayload,
  GoalListResponse,
  ManagerCheckin,
  ManagerCheckinPayload,
} from "@/types/checkin";

export const checkinService = {
  getApprovedGoals: () => apiClient.get<GoalListResponse>("/goals/approved"),
  getUpdates: () => apiClient.get<AchievementListResponse>("/achievements"),
  getGoalUpdates: (goalId: number) =>
    apiClient.get<AchievementListResponse>(`/achievements/${goalId}`),
  createUpdate: (payload: AchievementCreatePayload) =>
    apiClient.post<AchievementUpdate, AchievementCreatePayload>(
      "/achievements",
      payload,
    ),
  updateAchievement: (
    achievementId: number,
    payload: AchievementUpdatePayload,
  ) =>
    apiClient.put<AchievementUpdate, AchievementUpdatePayload>(
      `/achievements/${achievementId}`,
      payload,
    ),
  getTeamProgress: () =>
    apiClient.get<AchievementListResponse>("/checkins/team"),
  submitManagerReview: (
    achievementId: number,
    payload: ManagerCheckinPayload,
  ) =>
    apiClient.post<ManagerCheckin, ManagerCheckinPayload>(
      `/checkins/${achievementId}`,
      payload,
    ),
};
