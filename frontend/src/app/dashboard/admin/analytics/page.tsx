"use client";

import { BarChart3, TrendingUp } from "lucide-react";
import { useEffect } from "react";
import { toast } from "sonner";

import { DashboardHeader } from "@/components/analytics/dashboard-header";
import { Heatmap } from "@/components/analytics/heatmap";
import { KpiCard } from "@/components/analytics/kpi-card";
import { ProgressChart } from "@/components/analytics/progress-chart";
import { QuarterlyLineChart } from "@/components/analytics/quarterly-line-chart";
import { StatusPieChart } from "@/components/analytics/status-pie-chart";
import { DashboardShell } from "@/components/layout/dashboard-shell";
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
import {
  AlertTriangle,
  CheckCircle2,
  Target,
  Users,
} from "lucide-react";

export default function AnalyticsDeepDivePage() {
  const {
    orgAnalytics,
    teamAnalytics,
    loading,
    exportLoading,
    fetchOrgAnalytics,
    fetchTeamAnalytics,
    exportReport,
  } = useAnalyticsStore();

  useEffect(() => {
    fetchOrgAnalytics().catch(() => {});
    fetchTeamAnalytics().catch(() => {});
  }, [fetchOrgAnalytics, fetchTeamAnalytics]);

  async function handleExport(format: ExportFormat) {
    try {
      await exportReport(format);
      toast.success("Report exported.");
    } catch {
      toast.error("Unable to export report.");
    }
  }

  return (
    <DashboardShell>
      <div className="space-y-6">
        <DashboardHeader
          title="Analytics Dashboard"
          description="QoQ trends, completion heatmaps, goal distribution, and manager effectiveness."
          exportLoading={exportLoading}
          onExport={handleExport}
        />

        {loading || !orgAnalytics ? (
          <AnalyticsSkeleton />
        ) : (
          <>
            <section className="grid gap-4 md:grid-cols-4">
              <KpiCard
                label="Org Completion"
                value={`${orgAnalytics.organization_completion_rate}%`}
                icon={CheckCircle2}
              />
              <KpiCard
                label="Total Employees"
                value={orgAnalytics.total_employees}
                icon={Users}
              />
              <KpiCard
                label="Active Goals"
                value={orgAnalytics.active_goals}
                icon={Target}
              />
              <KpiCard
                label="Escalations"
                value={orgAnalytics.escalations}
                icon={AlertTriangle}
              />
            </section>

            {/* QoQ Trends */}
            <Card className="animate-in-up">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Quarter-on-Quarter Achievement Trends
                </CardTitle>
                <CardDescription>
                  Average progress and completion rates across quarters
                </CardDescription>
              </CardHeader>
              <CardContent>
                <QuarterlyLineChart data={orgAnalytics.quarterly_trends} />
              </CardContent>
            </Card>

            {/* Status Distribution + Department Performance */}
            <section className="grid gap-4 lg:grid-cols-2">
              <Card className="animate-in-up delay-1">
                <CardHeader>
                  <CardTitle>Goal Status Distribution</CardTitle>
                  <CardDescription>
                    Breakdown across all employees
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <StatusPieChart data={orgAnalytics.status_distribution} />
                </CardContent>
              </Card>

              <Card className="animate-in-up delay-2">
                <CardHeader>
                  <CardTitle>Department Performance</CardTitle>
                  <CardDescription>
                    Average progress by department
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ProgressChart
                    title=""
                    data={orgAnalytics.department_performance}
                  />
                </CardContent>
              </Card>
            </section>

            {/* Team Performance & Heatmap */}
            {teamAnalytics ? (
              <section className="grid gap-4 lg:grid-cols-2">
                <Card className="animate-in-up delay-3">
                  <CardHeader>
                    <CardTitle>Manager Effectiveness</CardTitle>
                    <CardDescription>
                      Check-in completion rates across team members
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ProgressChart
                      title=""
                      data={teamAnalytics.team_performance}
                    />
                  </CardContent>
                </Card>

                <Card className="animate-in-up delay-4">
                  <CardHeader>
                    <CardTitle>Completion Heatmap</CardTitle>
                    <CardDescription>
                      Employee × Quarter check-in status
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Heatmap data={teamAnalytics.heatmap} />
                  </CardContent>
                </Card>
              </section>
            ) : null}

            {/* Goal Distribution Analysis */}
            <Card className="animate-in-up delay-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Goal Distribution Analysis
                </CardTitle>
                <CardDescription>
                  Breakdown by status across the organization
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                  {orgAnalytics.status_distribution.map((item) => (
                    <div
                      key={item.status}
                      className="rounded-lg border p-4 text-center"
                    >
                      <p className="text-3xl font-semibold">{item.count}</p>
                      <p className="mt-1 text-sm font-medium capitalize text-muted-foreground">
                        {item.status.replace("_", " ")}
                      </p>
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

function AnalyticsSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28 w-full" />
        ))}
      </div>
      <Skeleton className="h-80 w-full" />
      <div className="grid gap-4 lg:grid-cols-2">
        <Skeleton className="h-80 w-full" />
        <Skeleton className="h-80 w-full" />
      </div>
    </div>
  );
}
