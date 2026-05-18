"use client";

import { create } from "zustand";
import type { StoreApi } from "zustand";

import { managerService } from "@/services/manager.service";
import type { ManagerGoal, ManagerGoalUpdatePayload } from "@/types/manager";

type ReviewAction = "approve" | "rework" | "reject" | "edit";

interface ManagerState {
  pendingGoals: ManagerGoal[];
  selectedGoal: ManagerGoal | null;
  isLoading: boolean;
  error: string | null;
  actionLoading: Record<number, ReviewAction | null>;
  reviewedCounts: {
    approved: number;
    rework: number;
    rejected: number;
  };
  fetchPendingGoals: () => Promise<void>;
  selectGoal: (goal: ManagerGoal) => void;
  clearSelectedGoal: () => void;
  approveGoal: (goalId: number, comment?: string) => Promise<void>;
  updateGoalInline: (
    goalId: number,
    payload: ManagerGoalUpdatePayload,
  ) => Promise<void>;
  reworkGoal: (goalId: number, comment: string) => Promise<void>;
  rejectGoal: (goalId: number, comment: string) => Promise<void>;
}

function removeGoal(goals: ManagerGoal[], goalId: number) {
  return goals.filter((goal) => goal.id !== goalId);
}

async function withOptimisticReview(
  set: StoreApi<ManagerState>["setState"],
  get: () => ManagerState,
  goalId: number,
  action: ReviewAction,
  request: () => Promise<ManagerGoal>,
) {
  const previousGoals = get().pendingGoals;
  set((state) => ({
    pendingGoals: removeGoal(state.pendingGoals, goalId),
    actionLoading: { ...state.actionLoading, [goalId]: action },
    error: null,
  }));

  try {
    await request();
    const countKey =
      action === "approve"
        ? "approved"
        : action === "reject"
          ? "rejected"
          : "rework";
    set((state) => ({
      actionLoading: { ...state.actionLoading, [goalId]: null },
      reviewedCounts: {
        ...state.reviewedCounts,
        [countKey]: state.reviewedCounts[countKey] + 1,
      },
    }));
  } catch (error) {
    set((state) => ({
      pendingGoals: previousGoals,
      actionLoading: { ...state.actionLoading, [goalId]: null },
      error: error instanceof Error ? error.message : "Review action failed",
    }));
    throw error;
  }
}

export const useManagerStore = create<ManagerState>()((set, get) => ({
  pendingGoals: [],
  selectedGoal: null,
  isLoading: false,
  error: null,
  actionLoading: {},
  reviewedCounts: {
    approved: 0,
    rework: 0,
    rejected: 0,
  },
  fetchPendingGoals: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await managerService.getPendingGoals();
      set({ pendingGoals: response.goals });
    } catch (error) {
      set({
        error:
          error instanceof Error
            ? error.message
            : "Unable to load manager goals",
      });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },
  selectGoal: (goal) => set({ selectedGoal: goal }),
  clearSelectedGoal: () => set({ selectedGoal: null }),
  approveGoal: (goalId, comment) =>
    withOptimisticReview(set, get, goalId, "approve", () =>
      managerService.approveGoal(goalId, { comment }),
    ),
  updateGoalInline: async (goalId, payload) => {
    const previousGoals = get().pendingGoals;
    set((state) => ({
      actionLoading: { ...state.actionLoading, [goalId]: "edit" },
      error: null,
      pendingGoals: state.pendingGoals.map((goal) =>
        goal.id === goalId ? { ...goal, ...payload } : goal,
      ),
      selectedGoal:
        state.selectedGoal?.id === goalId
          ? { ...state.selectedGoal, ...payload }
          : state.selectedGoal,
    }));
    try {
      const goal = await managerService.updateGoalInline(goalId, payload);
      set((state) => ({
        actionLoading: { ...state.actionLoading, [goalId]: null },
        pendingGoals: state.pendingGoals.map((item) =>
          item.id === goalId ? goal : item,
        ),
        selectedGoal: state.selectedGoal?.id === goalId ? goal : state.selectedGoal,
      }));
    } catch (error) {
      set((state) => ({
        pendingGoals: previousGoals,
        actionLoading: { ...state.actionLoading, [goalId]: null },
        error:
          error instanceof Error ? error.message : "Unable to update goal",
      }));
      throw error;
    }
  },
  reworkGoal: (goalId, comment) =>
    withOptimisticReview(set, get, goalId, "rework", () =>
      managerService.reworkGoal(goalId, { comment }),
    ),
  rejectGoal: (goalId, comment) =>
    withOptimisticReview(set, get, goalId, "reject", () =>
      managerService.rejectGoal(goalId, { comment }),
    ),
}));
