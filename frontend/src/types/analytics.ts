export interface StatusCount {
  status: string;
  count: number;
}

export interface QuarterTrend {
  quarter: string;
  average_progress: number;
  completed: number;
  total: number;
}

export interface TeamPerformancePoint {
  employee_id?: number | null;
  employee: string;
  average_progress: number;
  completion_rate: number;
  total_updates: number;
}

export interface DepartmentPerformancePoint {
  department: string;
  average_progress: number;
  completion_rate: number;
  total_updates: number;
}

export interface HeatmapCell {
  employee: string;
  quarter: string;
  status: string;
}

export interface EmployeeAnalytics {
  total_goals: number;
  approved_goals: number;
  completed_goals: number;
  average_progress: number;
  quarterly_completion: number;
  status_distribution: StatusCount[];
  quarterly_trends: QuarterTrend[];
}

export interface TeamAnalytics {
  team_size: number;
  pending_approvals: number;
  rework_requests: number;
  team_average_progress: number;
  checkin_completion: number;
  team_performance: TeamPerformancePoint[];
  status_distribution: StatusCount[];
  heatmap: HeatmapCell[];
}

export interface OrgAnalytics {
  organization_completion_rate: number;
  total_employees: number;
  active_goals: number;
  pending_reviews: number;
  escalations: number;
  department_performance: DepartmentPerformancePoint[];
  status_distribution: StatusCount[];
  quarterly_trends: QuarterTrend[];
}

export type ExportFormat = "csv" | "xlsx";
