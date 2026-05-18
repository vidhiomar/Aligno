"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { DashboardHeader } from "@/components/analytics/dashboard-header";
import { Heatmap } from "@/components/analytics/heatmap";
import { KpiCard } from "@/components/analytics/kpi-card";
import { ProgressChart } from "@/components/analytics/progress-chart";
import { StatusPieChart } from "@/components/analytics/status-pie-chart";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { ManagerGoalTable } from "@/components/manager/manager-goal-table";
import { ReviewDialog } from "@/components/manager/review-dialog";
import { ReviewSummary } from "@/components/manager/review-summary";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useAnalyticsStore } from "@/store/analytics.store";
import { useAuthStore } from "@/store/auth-store";
import { useManagerStore } from "@/store/manager.store";
import {
  CheckCircle2,
  Clock3,
  RefreshCcw,
  TrendingUp,
  Users,
} from "lucide-react";
import type { GoalStatus, ManagerGoal } from "@/types/manager";

const statusFilters: Array<"all" | GoalStatus> = [
  "all",
  "submitted",
  "approved",
  "rework",
  "rejected",
];

export default function ManagerDashboardPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | GoalStatus>("all");
  const { user, isAuthenticated } = useAuthStore();
  const {
    teamAnalytics,
    loading: analyticsLoading,
    exportLoading,
    fetchTeamAnalytics,
    exportReport,
  } = useAnalyticsStore();
  const {
    pendingGoals,
    selectedGoal,
    isLoading,
    error,
    reviewedCounts,
    fetchPendingGoals,
    selectGoal,
    clearSelectedGoal,
  } = useManagerStore();

  const canReview = user?.role === "manager" || user?.role === "admin";

  useEffect(() => {
    if (!isAuthenticated || !canReview) return;

    fetchPendingGoals().catch(() => {
      toast.error("Unable to load submitted goals.");
    });
    fetchTeamAnalytics().catch(() => {
      toast.error("Unable to load team analytics.");
    });
  }, [canReview, fetchPendingGoals, fetchTeamAnalytics, isAuthenticated]);

  const reworkCount = useMemo(
    () =>
      pendingGoals.filter((goal) => goal.status === "rework").length +
      reviewedCounts.rework,
    [pendingGoals, reviewedCounts.rework],
  );

  const filteredGoals = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return pendingGoals.filter((goal) => {
      const employee = `${goal.employee?.full_name ?? ""} ${goal.employee?.email ?? ""}`;
      const matchesSearch =
        !normalizedSearch ||
        goal.title.toLowerCase().includes(normalizedSearch) ||
        employee.toLowerCase().includes(normalizedSearch);
      const matchesStatus =
        statusFilter === "all" || goal.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [pendingGoals, search, statusFilter]);

  function openReview(goal: ManagerGoal) {
    selectGoal(goal);
    setDialogOpen(true);
  }

  async function handleExport(format: "csv" | "xlsx") {
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
          title="Manager Dashboard"
          description="Review submitted goals and monitor team performance analytics."
          exportLoading={exportLoading}
          onExport={handleExport}
        />

        {!isAuthenticated || !canReview ? (
          <Card>
            <CardHeader>
              <CardTitle>Manager access required</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground text-sm">
              Sign in with a manager or admin account to review submitted goals.
            </CardContent>
          </Card>
        ) : (
          <>
            {analyticsLoading || !teamAnalytics ? (
              <ManagerAnalyticsSkeleton />
            ) : (
              <>
                <section className="grid gap-4 md:grid-cols-5">
                  <KpiCard
                    label="Team Size"
                    value={teamAnalytics.team_size}
                    icon={Users}
                  />
                  <KpiCard
                    label="Pending Reviews"
                    value={teamAnalytics.pending_approvals}
                    icon={Clock3}
                  />
                  <KpiCard
                    label="Rework Requests"
                    value={teamAnalytics.rework_requests}
                    icon={RefreshCcw}
                  />
                  <KpiCard
                    label="Team Progress"
                    value={`${teamAnalytics.team_average_progress}%`}
                    icon={TrendingUp}
                  />
                  <KpiCard
                    label="Check-in Completion"
                    value={`${teamAnalytics.checkin_completion}%`}
                    icon={CheckCircle2}
                  />
                </section>
                <section className="grid gap-4 lg:grid-cols-2">
                  <ProgressChart
                    title="Team Performance"
                    data={teamAnalytics.team_performance}
                  />
                  <StatusPieChart data={teamAnalytics.status_distribution} />
                  <Heatmap data={teamAnalytics.heatmap} />
                </section>
              </>
            )}

            <ReviewSummary
              pendingCount={pendingGoals.length}
              approvedCount={reviewedCounts.approved}
              reworkCount={reworkCount}
            />
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by employee or goal"
                className="sm:max-w-sm"
              />
              <div className="flex flex-wrap gap-2">
                {statusFilters.map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setStatusFilter(status)}
                    className={`rounded-md border px-3 py-2 text-sm font-medium transition-colors ${
                      statusFilter === status
                        ? "bg-primary text-primary-foreground"
                        : "bg-background text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>
            {error ? <p className="text-destructive text-sm">{error}</p> : null}
            <ManagerGoalTable
              goals={filteredGoals}
              isLoading={isLoading}
              onReview={openReview}
            />
          </>
        )}
      </div>

      <ReviewDialog
        goal={selectedGoal}
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) clearSelectedGoal();
        }}
      />
    </DashboardShell>
  );
}

function ManagerAnalyticsSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-5">
        {Array.from({ length: 5 }).map((_, index) => (
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
