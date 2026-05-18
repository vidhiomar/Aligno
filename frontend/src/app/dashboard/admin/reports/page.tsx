"use client";

import { BarChart3, Download, FileSpreadsheet, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAnalyticsStore } from "@/store/analytics.store";
import type { ExportFormat } from "@/types/analytics";

export default function ReportsPage() {
  const {
    orgAnalytics,
    loading,
    exportLoading,
    fetchOrgAnalytics,
    exportReport,
  } = useAnalyticsStore();

  useEffect(() => {
    fetchOrgAnalytics().catch(() => {
      toast.error("Unable to load report data.");
    });
  }, [fetchOrgAnalytics]);

  async function handleExport(format: ExportFormat) {
    try {
      await exportReport(format);
      toast.success(`Report exported as ${format.toUpperCase()}.`);
    } catch {
      toast.error("Unable to export report.");
    }
  }

  return (
    <DashboardShell>
      <div className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-normal flex items-center gap-2">
              <BarChart3 className="h-6 w-6 text-primary" />
              Achievement Reports
            </h1>
            <p className="text-muted-foreground text-sm">
              Export planned vs. actual achievement data for all employees.
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={exportLoading}
              onClick={() => handleExport("csv")}
            >
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
            <Button
              variant="default"
              size="sm"
              disabled={exportLoading}
              onClick={() => handleExport("xlsx")}
            >
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              Export Excel
            </Button>
          </div>
        </div>

        {loading || !orgAnalytics ? (
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-28 w-full" />
              ))}
            </div>
            <Skeleton className="h-80 w-full" />
          </div>
        ) : (
          <>
            <section className="grid gap-4 md:grid-cols-4">
              <Card className="animate-in-up">
                <CardContent className="p-4">
                  <p className="text-3xl font-semibold">
                    {orgAnalytics.organization_completion_rate}%
                  </p>
                  <p className="text-muted-foreground text-sm">
                    Org Completion Rate
                  </p>
                </CardContent>
              </Card>
              <Card className="animate-in-up delay-1">
                <CardContent className="p-4">
                  <p className="text-3xl font-semibold">
                    {orgAnalytics.total_employees}
                  </p>
                  <p className="text-muted-foreground text-sm">
                    Total Employees
                  </p>
                </CardContent>
              </Card>
              <Card className="animate-in-up delay-2">
                <CardContent className="p-4">
                  <p className="text-3xl font-semibold">
                    {orgAnalytics.active_goals}
                  </p>
                  <p className="text-muted-foreground text-sm">Active Goals</p>
                </CardContent>
              </Card>
              <Card className="animate-in-up delay-3">
                <CardContent className="p-4">
                  <p className="text-3xl font-semibold">
                    {orgAnalytics.pending_reviews}
                  </p>
                  <p className="text-muted-foreground text-sm">
                    Pending Reviews
                  </p>
                </CardContent>
              </Card>
            </section>

            <Card className="animate-in-up delay-2">
              <CardHeader>
                <CardTitle>Report Contents</CardTitle>
                <CardDescription>
                  The exported file includes the following columns for each
                  employee
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="pb-2 text-left font-medium text-muted-foreground">
                          Column
                        </th>
                        <th className="pb-2 text-left font-medium text-muted-foreground">
                          Description
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {[
                        ["Employee Name", "Full name of the employee"],
                        ["Goal Title", "Title of the goal"],
                        ["Thrust Area", "Strategic category"],
                        ["UoM Type", "Numeric, %, Timeline, or Zero-based"],
                        ["Planned Target", "Original target value"],
                        ["Actual Achievement", "Reported actual value"],
                        [
                          "Progress Score",
                          "System-computed score using the UoM formula",
                        ],
                        [
                          "Status",
                          "Not Started / On Track / Completed",
                        ],
                        ["Quarter", "Q1, Q2, Q3, or Q4"],
                        ["Weightage", "Goal weightage percentage"],
                      ].map(([col, desc]) => (
                        <tr key={col}>
                          <td className="py-2.5">
                            <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-medium">
                              {col}
                            </code>
                          </td>
                          <td className="py-2.5 text-muted-foreground">
                            {desc}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            <Card className="animate-in-up delay-3">
              <CardHeader>
                <CardTitle>Score Formulas Reference</CardTitle>
                <CardDescription>
                  How progress scores are computed for each UoM type
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  {[
                    {
                      type: "Min (Numeric / %)",
                      desc: "Higher is better",
                      example: "Sales Revenue",
                      formula: "Achievement ÷ Target",
                    },
                    {
                      type: "Max (Numeric / %)",
                      desc: "Lower is better",
                      example: "TAT, Cost",
                      formula: "Target ÷ Achievement",
                    },
                    {
                      type: "Timeline",
                      desc: "Date-based completion",
                      example: "Project Deadline",
                      formula: "Completion date vs. Deadline",
                    },
                    {
                      type: "Zero-based",
                      desc: "Zero = Success",
                      example: "Safety incidents",
                      formula: "If 0 → 100%, else 0%",
                    },
                  ].map((item) => (
                    <div
                      key={item.type}
                      className="rounded-lg border p-4 space-y-2"
                    >
                      <p className="font-semibold text-sm">{item.type}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.desc} — e.g., {item.example}
                      </p>
                      <code className="block rounded bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                        {item.formula}
                      </code>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </DashboardShell>
  );
}
