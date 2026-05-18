"use client";

import { create } from "zustand";

import { goalService } from "@/services/goal.service";
import type { Goal, GoalPayload, SharedGoalPayload } from "@/types/goal";

interface GoalState {
  goals: Goal[];
  loading: boolean;
  actionLoading: boolean;
  error: string | null;
  fetchGoals: () => Promise<void>;
  createGoal: (payload: GoalPayload) => Promise<void>;
  updateGoal: (goalId: number, payload: Partial<GoalPayload>) => Promise<void>;
  deleteGoal: (goalId: number) => Promise<void>;
  submitGoalSheet: () => Promise<void>;
  createSharedGoal: (payload: SharedGoalPayload) => Promise<void>;
}

function upsertGoal(goals: Goal[], nextGoal: Goal) {
  if (!goals.some((goal) => goal.id === nextGoal.id)) return [nextGoal, ...goals];
  return goals.map((goal) => (goal.id === nextGoal.id ? nextGoal : goal));
}

export const useGoalStore = create<GoalState>()((set, get) => ({
  goals: [],
  loading: false,
  actionLoading: false,
  error: null,
  fetchGoals: async () => {
    set({ loading: true, error: null });
    try {
      const response = await goalService.getMyGoals();
      set({ goals: response.goals });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : "Unable to load goals" });
      throw error;
    } finally {
      set({ loading: false });
    }
  },
  createGoal: async (payload) => {
    set({ actionLoading: true, error: null });
    try {
      const goal = await goalService.createGoal(payload);
      set((state) => ({ goals: upsertGoal(state.goals, goal) }));
    } catch (error) {
      set({ error: error instanceof Error ? error.message : "Unable to create goal" });
      throw error;
    } finally {
      set({ actionLoading: false });
    }
  },
  updateGoal: async (goalId, payload) => {
    const previousGoals = get().goals;
    set((state) => ({
      actionLoading: true,
      error: null,
      goals: state.goals.map((goal) =>
        goal.id === goalId ? { ...goal, ...payload } : goal,
      ),
    }));
    try {
      const goal = await goalService.updateGoal(goalId, payload);
      set((state) => ({ goals: upsertGoal(state.goals, goal) }));
    } catch (error) {
      set({
        goals: previousGoals,
        error: error instanceof Error ? error.message : "Unable to update goal",
      });
      throw error;
    } finally {
      set({ actionLoading: false });
    }
  },
  deleteGoal: async (goalId) => {
    const previousGoals = get().goals;
    set((state) => ({
      actionLoading: true,
      error: null,
      goals: state.goals.filter((goal) => goal.id !== goalId),
    }));
    try {
      await goalService.deleteGoal(goalId);
    } catch (error) {
      set({
        goals: previousGoals,
        error: error instanceof Error ? error.message : "Unable to delete goal",
      });
      throw error;
    } finally {
      set({ actionLoading: false });
    }
  },
  submitGoalSheet: async () => {
    set({ actionLoading: true, error: null });
    try {
      await goalService.submitGoalSheet();
      await get().fetchGoals();
    } catch (error) {
      set({ error: error instanceof Error ? error.message : "Unable to submit goal sheet" });
      throw error;
    } finally {
      set({ actionLoading: false });
    }
  },
  createSharedGoal: async (payload) => {
    set({ actionLoading: true, error: null });
    try {
      await goalService.createSharedGoal(payload);
    } catch (error) {
      set({ error: error instanceof Error ? error.message : "Unable to create shared goal" });
      throw error;
    } finally {
      set({ actionLoading: false });
    }
  },
}));
