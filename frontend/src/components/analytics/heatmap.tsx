import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { HeatmapCell } from "@/types/analytics";

const quarters = ["Q1", "Q2", "Q3", "Q4"];
const statusStyles: Record<string, string> = {
  completed: "bg-emerald-100 text-emerald-700",
  on_track: "bg-blue-100 text-blue-700",
  not_started: "bg-slate-100 text-slate-700",
  missing: "bg-red-50 text-red-700",
};

export function Heatmap({ data }: { data: HeatmapCell[] }) {
  const employees = Array.from(new Set(data.map((item) => item.employee)));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Employee Quarter Activity</CardTitle>
      </CardHeader>
      <CardContent className="overflow-auto">
        {employees.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            No activity to display.
          </p>
        ) : (
          <div className="min-w-[520px] space-y-2">
            <div className="text-muted-foreground grid grid-cols-5 gap-2 text-xs font-medium">
              <span>Employee</span>
              {quarters.map((quarter) => (
                <span key={quarter}>{quarter}</span>
              ))}
            </div>
            {employees.map((employee) => (
              <div key={employee} className="grid grid-cols-5 gap-2 text-sm">
                <span className="truncate font-medium">{employee}</span>
                {quarters.map((quarter) => {
                  const status =
                    data.find(
                      (item) =>
                        item.employee === employee && item.quarter === quarter,
                    )?.status ?? "missing";
                  return (
                    <span
                      key={quarter}
                      className={`rounded-md px-2 py-1 text-center ${statusStyles[status] ?? statusStyles.missing}`}
                    >
                      {status.replace("_", " ")}
                    </span>
                  );
                })}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
