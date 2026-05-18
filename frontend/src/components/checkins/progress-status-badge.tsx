import { Badge } from "@/components/ui/badge";
import type { ProgressStatus } from "@/types/checkin";

const statusConfig: Record<ProgressStatus, { label: string; className: string; dot: string }> = {
  not_started: {
    label: "Not Started",
    className: "border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300",
    dot: "bg-slate-400",
  },
  on_track: {
    label: "On Track",
    className: "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-300",
    dot: "bg-blue-500",
  },
  completed: {
    label: "Completed",
    className: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
    dot: "bg-emerald-500",
  },
};

export function ProgressStatusBadge({ status }: { status: ProgressStatus }) {
  const config = statusConfig[status] ?? statusConfig.not_started;
  return (
    <Badge variant="outline" className={`font-medium text-xs ${config.className}`}>
      <span className={`mr-1.5 inline-block h-1.5 w-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </Badge>
  );
}
