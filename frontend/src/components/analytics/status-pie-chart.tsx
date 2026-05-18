"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { StatusCount } from "@/types/analytics";

const colors: Record<string, string> = {
  draft: "#94a3b8",
  submitted: "#3b82f6",
  approved: "#10b981",
  rework: "#f59e0b",
  rejected: "#ef4444",
};

export function StatusPieChart({ data }: { data: StatusCount[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Status Distribution</CardTitle>
      </CardHeader>
      <CardContent className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="count"
              nameKey="status"
              outerRadius={90}
              label
            >
              {data.map((entry) => (
                <Cell
                  key={entry.status}
                  fill={colors[entry.status] ?? "#64748b"}
                />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
