"use client";

import { BarChart3, CheckCircle2, Target, TrendingUp } from "lucide-react";
import { useEffect } from "react";
import { toast } from "sonner";

import { DashboardHeader } from "@/components/analytics/dashboard-header";
import { KpiCard } from "@/components/analytics/kpi-card";
import { QuarterlyLineChart } from "@/components/analytics/quarterly-line-chart";
import { StatusPieChart } from "@/components/analytics/status-pie-chart";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Skeleton } from "@/components/ui/skeleton";
import { useAnalyticsStore } from "@/store/analytics.store";
import type { ExportFormat } from "@/types/analytics";

export default function EmployeeDashboardPage() {
  const {
    dashboardData,
    loading,
    error,
    exportLoading,
    fetchMyAnalytics,
    exportReport,
  } = useAnalyticsStore();

  useEffect(() => {
    fetchMyAnalytics().catch(() => {
      toast.error("Unable to load analytics.");
    });
  }, [fetchMyAnalytics]);

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
          title="My Performance"
          description="Track goal progress, quarterly completion, and status distribution."
          exportLoading={exportLoading}
          onExport={handleExport}
        />

        {error ? <p className="text-destructive text-sm">{error}</p> : null}

        {loading || !dashboardData ? (
          <DashboardSkeleton />
        ) : (
          <>
            <section className="grid gap-4 md:grid-cols-4">
              <KpiCard
                label="Total Goals"
                value={dashboardData.total_goals}
                icon={Target}
              />
              <KpiCard
                label="Approved Goals"
                value={dashboardData.approved_goals}
                icon={CheckCircle2}
              />
              <KpiCard
                label="Completed Goals"
                value={dashboardData.completed_goals}
                icon={BarChart3}
              />
              <KpiCard
                label="Average Progress"
                value={`${dashboardData.average_progress}%`}
                icon={TrendingUp}
              />
            </section>

            <section className="grid gap-4 lg:grid-cols-2">
              <QuarterlyLineChart data={dashboardData.quarterly_trends} />
              <StatusPieChart data={dashboardData.status_distribution} />
            </section>
          </>
        )}
      </div>
    </DashboardShell>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-28 w-full" />
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Skeleton className="h-80 w-full" />
        <Skeleton className="h-80 w-full" />
      </div>
    </div>
  );
}
