export type GoalStatus =
  | "draft"
  | "submitted"
  | "approved"
  | "rework"
  | "rejected";

export interface GoalEmployee {
  id: number;
  email: string;
  full_name: string | null;
}

export interface ManagerGoal {
  id: number;
  employee_id: number;
  title: string;
  description: string | null;
  target: string | null;
  uom: string | null;
  uom_type: "numeric" | "percent" | "timeline" | "zero_based";
  weightage: number;
  status: GoalStatus;
  is_locked: boolean;
  manager_comment: string | null;
  submitted_at: string | null;
  reviewed_at: string | null;
  reviewed_by: number | null;
  approved_at: string | null;
  created_at: string;
  employee: GoalEmployee | null;
}

export interface ManagerGoalListResponse {
  goals: ManagerGoal[];
}

export interface ManagerReviewPayload {
  comment?: string;
}

export interface ManagerGoalUpdatePayload {
  target?: string | null;
  uom?: string | null;
  uom_type?: "numeric" | "percent" | "timeline" | "zero_based";
  weightage?: number;
}
