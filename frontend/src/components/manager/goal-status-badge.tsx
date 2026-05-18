import { Badge } from "@/components/ui/badge";
import type { GoalStatus } from "@/types/manager";

const statusConfig: Record<
  GoalStatus,
  { label: string; className: string }
> = {
  draft: {
    label: "Draft",
    className: "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
  },
  submitted: {
    label: "Submitted",
    className: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800",
  },
  approved: {
    label: "Approved",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800",
  },
  rework: {
    label: "Rework",
    className: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800",
  },
  rejected: {
    label: "Rejected",
    className: "bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800",
  },
};

export function GoalStatusBadge({ status }: { status: GoalStatus }) {
  const config = statusConfig[status] ?? statusConfig.draft;
  return (
    <Badge
      variant="outline"
      className={`font-medium text-xs px-2.5 py-0.5 ${config.className}`}
    >
      <span className={`mr-1.5 inline-block h-1.5 w-1.5 rounded-full ${
        status === "approved" ? "bg-emerald-500" :
        status === "submitted" ? "bg-blue-500" :
        status === "rework" ? "bg-amber-500" :
        status === "rejected" ? "bg-red-500" :
        "bg-slate-400"
      }`} />
      {config.label}
    </Badge>
  );
}
