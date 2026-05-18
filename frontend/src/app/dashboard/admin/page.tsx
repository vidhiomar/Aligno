"use client";

import { AlertTriangle, CheckCircle2, Send, Target, Users } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { DashboardHeader } from "@/components/analytics/dashboard-header";
import { KpiCard } from "@/components/analytics/kpi-card";
import { ProgressChart } from "@/components/analytics/progress-chart";
import { QuarterlyLineChart } from "@/components/analytics/quarterly-line-chart";
import { StatusPieChart } from "@/components/analytics/status-pie-chart";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useAnalyticsStore } from "@/store/analytics.store";
import { useGoalStore } from "@/store/goal.store";
import type { ExportFormat } from "@/types/analytics";
import type { SharedGoalPayload, UomType } from "@/types/goal";

const emptySharedGoal: SharedGoalPayload = {
  employee_ids: [],
  primary_owner_id: 0,
  title: "",
  thrust_area: "",
  description: "",
  target: "",
  uom: "",
  uom_type: "numeric",
  weightage: 10,
};

export default function AdminDashboardPage() {
  const [departmentSearch, setDepartmentSearch] = useState("");
  const [sharedGoal, setSharedGoal] = useState<SharedGoalPayload>(emptySharedGoal);
  const [employeeIds, setEmployeeIds] = useState("");
  const {
    orgAnalytics,
    loading,
    error,
    exportLoading,
    fetchOrgAnalytics,
    exportReport,
  } = useAnalyticsStore();
  const { actionLoading, createSharedGoal } = useGoalStore();

  useEffect(() => {
    fetchOrgAnalytics().catch(() => {
      toast.error("Unable to load organization analytics.");
    });
  }, [fetchOrgAnalytics]);

  const filteredDepartmentPerformance = useMemo(() => {
    const search = departmentSearch.trim().toLowerCase();
    if (!orgAnalytics || !search)
      return orgAnalytics?.department_performance ?? [];
    return orgAnalytics.department_performance.filter((item) =>
      item.department.toLowerCase().includes(search),
    );
  }, [departmentSearch, orgAnalytics]);

  async function handleExport(format: ExportFormat) {
    try {
      await exportReport(format);
      toast.success("Report exported.");
    } catch {
      toast.error("Unable to export report.");
    }
  }

  async function pushSharedGoal() {
    const parsedEmployeeIds = employeeIds
      .split(",")
      .map((item) => Number(item.trim()))
      .filter(Boolean);

    if (!sharedGoal.title.trim() || !sharedGoal.target?.trim()) {
      toast.error("Shared KPI title and target are required.");
      return;
    }
    if (!parsedEmployeeIds.length || !sharedGoal.primary_owner_id) {
      toast.error("Enter recipient employee IDs and a primary owner ID.");
      return;
    }

    try {
      await createSharedGoal({
        ...sharedGoal,
        employee_ids: parsedEmployeeIds,
        title: sharedGoal.title.trim(),
        thrust_area: sharedGoal.thrust_area?.trim() || null,
        description: sharedGoal.description?.trim() || null,
        target: sharedGoal.target?.trim() || null,
        uom: sharedGoal.uom?.trim() || null,
      });
      setSharedGoal(emptySharedGoal);
      setEmployeeIds("");
      toast.success("Shared departmental KPI pushed.");
    } catch {
      toast.error("Unable to push shared KPI.");
    }
  }

  return (
    <DashboardShell>
      <div className="space-y-6">
        <DashboardHeader
          title="Organization Analytics"
          description="Monitor organization completion, goal distribution, and performance trends."
          exportLoading={exportLoading}
          onExport={handleExport}
        />

        {error ? <p className="text-destructive text-sm">{error}</p> : null}

        {loading || !orgAnalytics ? (
          <AdminSkeleton />
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

            <div className="max-w-sm">
              <Input
                value={departmentSearch}
                onChange={(event) => setDepartmentSearch(event.target.value)}
                placeholder="Search departments"
              />
            </div>

            <SharedGoalCard
              employeeIds={employeeIds}
              setEmployeeIds={setEmployeeIds}
              sharedGoal={sharedGoal}
              setSharedGoal={setSharedGoal}
              loading={actionLoading}
              onSubmit={pushSharedGoal}
            />

            <section className="grid gap-4 lg:grid-cols-2">
              <ProgressChart
                title="Department Performance"
                data={filteredDepartmentPerformance}
              />
              <StatusPieChart data={orgAnalytics.status_distribution} />
              <QuarterlyLineChart data={orgAnalytics.quarterly_trends} />
            </section>
          </>
        )}
      </div>
    </DashboardShell>
  );
}

function SharedGoalCard({
  employeeIds,
  setEmployeeIds,
  sharedGoal,
  setSharedGoal,
  loading,
  onSubmit,
}: {
  employeeIds: string;
  setEmployeeIds: (value: string) => void;
  sharedGoal: SharedGoalPayload;
  setSharedGoal: (value: SharedGoalPayload) => void;
  loading: boolean;
  onSubmit: () => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Shared departmental KPI</CardTitle>
        <CardDescription>
          Push one KPI to multiple employees. Recipients can only adjust weightage.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3 lg:grid-cols-4">
        <Input
          value={employeeIds}
          onChange={(event) => setEmployeeIds(event.target.value)}
          placeholder="Employee IDs, e.g. 3,4,5"
        />
        <Input
          type="number"
          value={sharedGoal.primary_owner_id || ""}
          onChange={(event) =>
            setSharedGoal({ ...sharedGoal, primary_owner_id: Number(event.target.value) })
          }
          placeholder="Primary owner ID"
        />
        <Input
          value={sharedGoal.thrust_area ?? ""}
          onChange={(event) =>
            setSharedGoal({ ...sharedGoal, thrust_area: event.target.value })
          }
          placeholder="Thrust area"
        />
        <Input
          value={sharedGoal.title}
          onChange={(event) => setSharedGoal({ ...sharedGoal, title: event.target.value })}
          placeholder="KPI title"
        />
        <Textarea
          className="lg:col-span-2"
          value={sharedGoal.description ?? ""}
          onChange={(event) =>
            setSharedGoal({ ...sharedGoal, description: event.target.value })
          }
          placeholder="Description"
        />
        <Input
          value={sharedGoal.target ?? ""}
          onChange={(event) => setSharedGoal({ ...sharedGoal, target: event.target.value })}
          placeholder="Target"
        />
        <div className="grid grid-cols-[1fr_96px] gap-2">
          <select
            value={sharedGoal.uom_type}
            onChange={(event) =>
              setSharedGoal({ ...sharedGoal, uom_type: event.target.value as UomType })
            }
            className="border-input bg-background h-10 rounded-md border px-3 text-sm"
          >
            <option value="numeric">Numeric</option>
            <option value="percent">%</option>
            <option value="timeline">Timeline</option>
            <option value="zero_based">Zero-based</option>
          </select>
          <Input
            type="number"
            min={10}
            value={sharedGoal.weightage}
            onChange={(event) =>
              setSharedGoal({ ...sharedGoal, weightage: Number(event.target.value) })
            }
          />
        </div>
        <div className="lg:col-span-4">
          <Button disabled={loading} onClick={onSubmit}>
            <Send className="mr-2 h-4 w-4" />
            Push shared KPI
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function AdminSkeleton() {
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
