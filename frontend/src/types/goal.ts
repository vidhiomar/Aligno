import type { GoalStatus } from "@/types/manager";

export type UomType = "numeric" | "percent" | "timeline" | "zero_based";

export interface GoalEmployee {
  id: number;
  email: string;
  full_name: string | null;
}

export interface Goal {
  id: number;
  employee_id: number;
  title: string;
  thrust_area: string | null;
  description: string | null;
  target: string | null;
  uom: string | null;
  uom_type: UomType;
  weightage: number;
  status: GoalStatus;
  is_locked: boolean;
  manager_comment: string | null;
  submitted_at: string | null;
  reviewed_at: string | null;
  reviewed_by: number | null;
  approved_at: string | null;
  shared_goal_group_id: string | null;
  shared_source_goal_id: number | null;
  primary_owner_id: number | null;
  created_at: string;
  employee: GoalEmployee | null;
}

export interface GoalListResponse {
  goals: Goal[];
}

export interface GoalSubmitResponse {
  goals: Goal[];
  total_weightage: number;
}

export interface GoalPayload {
  title: string;
  thrust_area?: string | null;
  description?: string | null;
  target?: string | null;
  uom?: string | null;
  uom_type: UomType;
  weightage: number;
}

export interface SharedGoalPayload extends GoalPayload {
  employee_ids: number[];
  primary_owner_id: number;
}
