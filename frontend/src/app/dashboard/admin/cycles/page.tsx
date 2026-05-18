"use client";

import { CalendarClock, Power, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { adminService, type CycleConfig } from "@/services/admin.service";

export default function CycleManagementPage() {
  const [cycles, setCycles] = useState<CycleConfig[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchCycles() {
    setLoading(true);
    try {
      const response = await adminService.getCycles();
      setCycles(response.cycles);
    } catch {
      toast.error("Unable to load cycle configuration.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchCycles();
  }, []);

  async function toggleCycle(cycleId: string, currentActive: boolean) {
    try {
      await adminService.updateCycle(cycleId, { is_active: !currentActive });
      setCycles((prev) =>
        prev.map((c) =>
          c.id === cycleId ? { ...c, is_active: !currentActive } : c,
        ),
      );
      toast.success(`Cycle ${!currentActive ? "activated" : "deactivated"}.`);
    } catch {
      toast.error("Unable to update cycle.");
    }
  }

  async function updateDate(
    cycleId: string,
    field: "opens" | "closes",
    value: string,
  ) {
    try {
      await adminService.updateCycle(cycleId, { [field]: value });
      setCycles((prev) =>
        prev.map((c) => (c.id === cycleId ? { ...c, [field]: value } : c)),
      );
    } catch {
      toast.error("Unable to update date.");
    }
  }

  return (
    <DashboardShell>
      <div className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-normal flex items-center gap-2">
              <CalendarClock className="h-6 w-6 text-primary" />
              Cycle Management
            </h1>
            <p className="text-muted-foreground text-sm">
              Configure goal-setting and quarterly check-in windows.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={fetchCycles}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>

        {loading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-48 w-full" />
            ))}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {cycles.map((cycle, index) => (
              <Card
                key={cycle.id}
                className={`animate-in-up delay-${index + 1} transition-all duration-300 ${
                  cycle.is_active
                    ? "border-primary/40 shadow-md glow-primary"
                    : ""
                }`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base">
                        {cycle.label}
                      </CardTitle>
                      <CardDescription className="font-mono text-xs mt-1">
                        {cycle.id}
                      </CardDescription>
                    </div>
                    <Badge
                      variant={cycle.is_active ? "default" : "secondary"}
                      className="shrink-0"
                    >
                      {cycle.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-muted-foreground">
                        Opens
                      </label>
                      <Input
                        type="date"
                        value={cycle.opens}
                        onChange={(e) =>
                          updateDate(cycle.id, "opens", e.target.value)
                        }
                        className="mt-1 text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground">
                        Closes
                      </label>
                      <Input
                        type="date"
                        value={cycle.closes}
                        onChange={(e) =>
                          updateDate(cycle.id, "closes", e.target.value)
                        }
                        className="mt-1 text-sm"
                      />
                    </div>
                  </div>
                  <Button
                    variant={cycle.is_active ? "destructive" : "default"}
                    size="sm"
                    className="w-full"
                    onClick={() => toggleCycle(cycle.id, cycle.is_active)}
                  >
                    <Power className="mr-2 h-4 w-4" />
                    {cycle.is_active ? "Deactivate" : "Activate"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Card className="animate-in-up">
          <CardHeader>
            <CardTitle>Check-in Schedule Reference</CardTitle>
            <CardDescription>
              Standard quarterly windows as per policy
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="pb-2 text-left font-medium text-muted-foreground">
                      Period
                    </th>
                    <th className="pb-2 text-left font-medium text-muted-foreground">
                      Window Opens
                    </th>
                    <th className="pb-2 text-left font-medium text-muted-foreground">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {[
                    [
                      "Phase 1 — Goal Setting",
                      "1st May",
                      "Goal Creation, Submission & Approval",
                    ],
                    [
                      "Q1 Check-in",
                      "July",
                      "Progress Update — Planned vs. Actual",
                    ],
                    [
                      "Q2 Check-in",
                      "October",
                      "Progress Update — Planned vs. Actual",
                    ],
                    [
                      "Q3 Check-in",
                      "January",
                      "Progress Update — Planned vs. Actual",
                    ],
                    [
                      "Q4 / Annual",
                      "March / April",
                      "Final Achievement Capture",
                    ],
                  ].map(([period, window, action]) => (
                    <tr key={period}>
                      <td className="py-2.5 font-medium">{period}</td>
                      <td className="py-2.5 text-muted-foreground">
                        {window}
                      </td>
                      <td className="py-2.5 text-muted-foreground">
                        {action}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
