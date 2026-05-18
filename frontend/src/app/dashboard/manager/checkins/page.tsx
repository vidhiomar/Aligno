"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import {
  AchievementTable,
  type AchievementTableItem,
} from "@/components/checkins/achievement-table";
import { ManagerReviewDialog } from "@/components/checkins/manager-review-dialog";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Input } from "@/components/ui/input";
import { useCheckinStore } from "@/store/checkin.store";
import type { AchievementUpdate, Quarter } from "@/types/checkin";

const quarterFilters: Array<"all" | Quarter> = ["all", "Q1", "Q2", "Q3", "Q4"];

export default function ManagerCheckinsPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [quarterFilter, setQuarterFilter] = useState<"all" | Quarter>("all");
  const {
    teamUpdates,
    selectedAchievement,
    loading,
    error,
    fetchTeamProgress,
    selectAchievement,
  } = useCheckinStore();

  useEffect(() => {
    fetchTeamProgress().catch(() => {
      toast.error("Unable to load team progress.");
    });
  }, [fetchTeamProgress]);

  const filteredUpdates = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return teamUpdates.filter((update) => {
      const employee = `${update.goal?.employee?.full_name ?? ""} ${update.goal?.employee?.email ?? ""}`;
      const matchesSearch =
        !normalizedSearch ||
        (update.goal?.title ?? "").toLowerCase().includes(normalizedSearch) ||
        employee.toLowerCase().includes(normalizedSearch);
      const matchesQuarter =
        quarterFilter === "all" || update.quarter === quarterFilter;

      return matchesSearch && matchesQuarter;
    });
  }, [quarterFilter, search, teamUpdates]);

  const items = useMemo<AchievementTableItem[]>(() => {
    return filteredUpdates
      .filter(
        (
          update,
        ): update is AchievementUpdate & {
          goal: NonNullable<AchievementUpdate["goal"]>;
        } => Boolean(update.goal),
      )
      .map((update) => ({
        goal: update.goal,
        achievement: update,
        quarter: update.quarter,
      }));
  }, [filteredUpdates]);

  function openReview(achievement: AchievementUpdate) {
    selectAchievement(achievement);
    setDialogOpen(true);
  }

  return (
    <DashboardShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-normal">
            Team Check-ins
          </h1>
          <p className="text-muted-foreground text-sm">
            Review quarterly achievement updates for your assigned employees.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by employee or goal"
            className="sm:max-w-sm"
          />
          <div className="flex flex-wrap gap-2">
            {quarterFilters.map((quarter) => (
              <button
                key={quarter}
                type="button"
                onClick={() => setQuarterFilter(quarter)}
                className={`rounded-md border px-3 py-2 text-sm font-medium transition-colors ${
                  quarterFilter === quarter
                    ? "bg-primary text-primary-foreground"
                    : "bg-background text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                }`}
              >
                {quarter}
              </button>
            ))}
          </div>
        </div>

        {error ? <p className="text-destructive text-sm">{error}</p> : null}

        <AchievementTable
          items={items}
          isLoading={loading}
          mode="manager"
          onReview={openReview}
        />
      </div>

      <ManagerReviewDialog
        key={selectedAchievement?.id ?? "none"}
        achievement={selectedAchievement}
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) selectAchievement(null);
        }}
      />
    </DashboardShell>
  );
}
