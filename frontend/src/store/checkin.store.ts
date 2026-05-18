"use client";

import { create } from "zustand";

import { checkinService } from "@/services/checkin.service";
import type {
  AchievementCreatePayload,
  AchievementUpdate,
  AchievementUpdatePayload,
  CheckinGoal,
  ManagerCheckinPayload,
} from "@/types/checkin";

interface CheckinState {
  approvedGoals: CheckinGoal[];
  updates: AchievementUpdate[];
  teamUpdates: AchievementUpdate[];
  selectedGoal: CheckinGoal | null;
  selectedAchievement: AchievementUpdate | null;
  loading: boolean;
  actionLoading: boolean;
  error: string | null;
  fetchUpdates: () => Promise<void>;
  fetchTeamProgress: () => Promise<void>;
  selectGoal: (goal: CheckinGoal | null) => void;
  selectAchievement: (achievement: AchievementUpdate | null) => void;
  createUpdate: (payload: AchievementCreatePayload) => Promise<void>;
  updateAchievement: (
    achievementId: number,
    payload: AchievementUpdatePayload,
  ) => Promise<void>;
  submitManagerReview: (
    achievementId: number,
    payload: ManagerCheckinPayload,
  ) => Promise<void>;
}

function replaceUpdate(
  updates: AchievementUpdate[],
  nextUpdate: AchievementUpdate,
) {
  const exists = updates.some((update) => update.id === nextUpdate.id);
  if (!exists) return [nextUpdate, ...updates];
  return updates.map((update) =>
    update.id === nextUpdate.id ? nextUpdate : update,
  );
}

export const useCheckinStore = create<CheckinState>()((set, get) => ({
  approvedGoals: [],
  updates: [],
  teamUpdates: [],
  selectedGoal: null,
  selectedAchievement: null,
  loading: false,
  actionLoading: false,
  error: null,
  fetchUpdates: async () => {
    set({ loading: true, error: null });
    try {
      const [goalsResponse, updatesResponse] = await Promise.all([
        checkinService.getApprovedGoals(),
        checkinService.getUpdates(),
      ]);
      set({
        approvedGoals: goalsResponse.goals,
        updates: updatesResponse.updates,
      });
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : "Unable to load check-ins",
      });
      throw error;
    } finally {
      set({ loading: false });
    }
  },
  fetchTeamProgress: async () => {
    set({ loading: true, error: null });
    try {
      const response = await checkinService.getTeamProgress();
      set({ teamUpdates: response.updates });
    } catch (error) {
      set({
        error:
          error instanceof Error
            ? error.message
            : "Unable to load team progress",
      });
      throw error;
    } finally {
      set({ loading: false });
    }
  },
  selectGoal: (goal) => set({ selectedGoal: goal }),
  selectAchievement: (achievement) => set({ selectedAchievement: achievement }),
  createUpdate: async (payload) => {
    set({ actionLoading: true, error: null });
    try {
      const update = await checkinService.createUpdate(payload);
      set((state) => ({ updates: replaceUpdate(state.updates, update) }));
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : "Unable to create update",
      });
      throw error;
    } finally {
      set({ actionLoading: false });
    }
  },
  updateAchievement: async (achievementId, payload) => {
    const previousUpdates = get().updates;
    set((state) => ({
      actionLoading: true,
      error: null,
      updates: state.updates.map((update) =>
        update.id === achievementId ? { ...update, ...payload } : update,
      ),
    }));
    try {
      const update = await checkinService.updateAchievement(
        achievementId,
        payload,
      );
      set((state) => ({ updates: replaceUpdate(state.updates, update) }));
    } catch (error) {
      set({
        updates: previousUpdates,
        error:
          error instanceof Error
            ? error.message
            : "Unable to update achievement",
      });
      throw error;
    } finally {
      set({ actionLoading: false });
    }
  },
  submitManagerReview: async (achievementId, payload) => {
    set({ actionLoading: true, error: null });
    try {
      const checkin = await checkinService.submitManagerReview(
        achievementId,
        payload,
      );
      set((state) => ({
        teamUpdates: state.teamUpdates.map((update) =>
          update.id === achievementId
            ? {
                ...update,
                manager_checkins: [checkin, ...update.manager_checkins],
              }
            : update,
        ),
      }));
    } catch (error) {
      set({
        error:
          error instanceof Error
            ? error.message
            : "Unable to submit manager review",
      });
      throw error;
    } finally {
      set({ actionLoading: false });
    }
  },
}));
