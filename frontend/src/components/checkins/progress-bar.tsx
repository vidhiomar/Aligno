import { cn } from "@/lib/utils";

interface ProgressBarProps {
  value: number;
  className?: string;
}

export function ProgressBar({ value, className }: ProgressBarProps) {
  const safeValue = Math.max(0, Math.min(value, 100));
  const color =
    safeValue >= 80
      ? "bg-emerald-500"
      : safeValue >= 50
        ? "bg-blue-500"
        : safeValue >= 25
          ? "bg-amber-500"
          : "bg-red-500";

  return (
    <div className={cn("space-y-1.5", className)}>
      <div className="bg-muted h-2.5 w-full overflow-hidden rounded-full">
        <div
          className={`${color} h-full rounded-full transition-all duration-700 ease-out`}
          style={{ width: `${safeValue}%` }}
        />
      </div>
      <p className="text-muted-foreground text-xs font-medium">
        {safeValue.toFixed(0)}% Progress
      </p>
    </div>
  );
}
