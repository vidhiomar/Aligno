"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type {
  DepartmentPerformancePoint,
  TeamPerformancePoint,
} from "@/types/analytics";

type ProgressData = TeamPerformancePoint | DepartmentPerformancePoint;

function getName(item: ProgressData) {
  return "employee" in item ? item.employee : item.department;
}

export function ProgressChart({
  title,
  data,
}: {
  title: string;
  data: ProgressData[];
}) {
  const chartData = data.map((item) => ({
    name: getName(item),
    completion_rate: item.completion_rate,
    average_progress: item.average_progress,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis domain={[0, 100]} />
            <Tooltip />
            <Bar dataKey="completion_rate" fill="#10b981" />
            <Bar dataKey="average_progress" fill="#3b82f6" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
