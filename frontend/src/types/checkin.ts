import type { GoalStatus } from "@/types/manager";

export type Quarter = "Q1" | "Q2" | "Q3" | "Q4";
export type ProgressStatus = "not_started" | "on_track" | "completed";

export interface CheckinEmployee {
  id: number;
  email: string;
  full_name: string | null;
}

export interface CheckinGoal {
  id: number;
  employee_id: number;
  title: string;
  description: string | null;
  target: string | null;
  uom: string | null;
  weightage: number;
  status: GoalStatus;
  is_locked: boolean;
  manager_comment: string | null;
  submitted_at: string | null;
  reviewed_at: string | null;
  reviewed_by: number | null;
  approved_at: string | null;
  created_at: string;
  employee: CheckinEmployee | null;
}

export interface ManagerCheckin {
  id: number;
  achievement_id: number;
  manager_comment: string;
  reviewed_by: number;
  reviewed_at: string;
}

export interface AchievementUpdate {
  id: number;
  goal_id: number;
  quarter: Quarter;
  planned_value: string | null;
  actual_value: string | null;
  progress_score: number;
  status: ProgressStatus;
  employee_comment: string | null;
  created_at: string;
  updated_at: string;
  goal: CheckinGoal | null;
  manager_checkins: ManagerCheckin[];
}

export interface GoalListResponse {
  goals: CheckinGoal[];
}

export interface AchievementListResponse {
  updates: AchievementUpdate[];
}

export interface AchievementCreatePayload {
  goal_id: number;
  quarter: Quarter;
  actual_value?: string | null;
  status: ProgressStatus;
  employee_comment?: string | null;
}

export interface AchievementUpdatePayload {
  actual_value?: string | null;
  status: ProgressStatus;
  employee_comment?: string | null;
}

export interface ManagerCheckinPayload {
  manager_comment: string;
}
