"use client";

import { CheckCircle2, Clock3, Target } from "lucide-react";
import type { ComponentType } from "react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { AchievementDialog } from "@/components/checkins/achievement-dialog";
import {
  AchievementTable,
  type AchievementTableItem,
} from "@/components/checkins/achievement-table";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCheckinStore } from "@/store/checkin.store";
import type { Quarter } from "@/types/checkin";

function getCurrentQuarter(): Quarter {
  const month = new Date().getMonth() + 1;
  if (month <= 3) return "Q1";
  if (month <= 6) return "Q2";
  if (month <= 9) return "Q3";
  return "Q4";
}

export default function EmployeeCheckinsPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<AchievementTableItem | null>(
    null,
  );
  const { approvedGoals, updates, loading, error, fetchUpdates, selectGoal } =
    useCheckinStore();
  const currentQuarter = getCurrentQuarter();

  useEffect(() => {
    fetchUpdates().catch(() => {
      toast.error("Unable to load quarterly check-ins.");
    });
  }, [fetchUpdates]);

  const items = useMemo<AchievementTableItem[]>(() => {
    return approvedGoals.map((goal) => ({
      goal,
      achievement:
        updates.find(
          (update) =>
            update.goal_id === goal.id && update.quarter === currentQuarter,
        ) ?? null,
      quarter: currentQuarter,
    }));
  }, [approvedGoals, currentQuarter, updates]);

  const completedUpdates = items.filter((item) => item.achievement).length;
  const pendingUpdates = Math.max(approvedGoals.length - completedUpdates, 0);

  function openUpdate(item: AchievementTableItem) {
    setSelectedItem(item);
    selectGoal(item.goal);
    setDialogOpen(true);
  }

  return (
    <DashboardShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-normal">
            Quarterly Check-ins
          </h1>
          <p className="text-muted-foreground text-sm">
            Update achievement progress for approved goals in {currentQuarter}.
          </p>
        </div>

        <section className="grid gap-4 md:grid-cols-3">
          <SummaryCard
            label="Approved Goals"
            value={approvedGoals.length}
            icon={Target}
          />
          <SummaryCard
            label="Completed Updates"
            value={completedUpdates}
            icon={CheckCircle2}
          />
          <SummaryCard
            label="Pending Updates"
            value={pendingUpdates}
            icon={Clock3}
          />
        </section>

        {error ? <p className="text-destructive text-sm">{error}</p> : null}

        <AchievementTable
          items={items}
          isLoading={loading}
          mode="employee"
          onUpdate={openUpdate}
        />
      </div>

      <AchievementDialog
        key={`${selectedItem?.goal.id ?? "none"}-${selectedItem?.achievement?.id ?? "new"}`}
        goal={selectedItem?.goal ?? null}
        achievement={selectedItem?.achievement ?? null}
        quarter={selectedItem?.quarter ?? currentQuarter}
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) {
            setSelectedItem(null);
            selectGoal(null);
          }
        }}
      />
    </DashboardShell>
  );
}

function SummaryCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon: ComponentType<{ className?: string }>;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-muted-foreground text-sm font-medium">
          {label}
        </CardTitle>
        <Icon className="text-muted-foreground h-4 w-4" />
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-semibold">{value}</div>
      </CardContent>
    </Card>
  );
}
