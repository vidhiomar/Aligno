"use client";

import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useCheckinStore } from "@/store/checkin.store";
import type {
  AchievementUpdate,
  CheckinGoal,
  ProgressStatus,
  Quarter,
} from "@/types/checkin";

interface AchievementDialogProps {
  goal: CheckinGoal | null;
  achievement: AchievementUpdate | null;
  quarter: Quarter;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const statuses: ProgressStatus[] = ["not_started", "on_track", "completed"];

export function AchievementDialog({
  goal,
  achievement,
  quarter,
  open,
  onOpenChange,
}: AchievementDialogProps) {
  const { actionLoading, createUpdate, updateAchievement } = useCheckinStore();
  const [actualValue, setActualValue] = useState(
    achievement?.actual_value ?? "",
  );
  const [status, setStatus] = useState<ProgressStatus>(
    achievement?.status ?? "not_started",
  );
  const [employeeComment, setEmployeeComment] = useState(
    achievement?.employee_comment ?? "",
  );

  if (!goal) return null;
  const activeGoal = goal;
  const activeAchievement = achievement;

  async function submit() {
    try {
      if (activeAchievement) {
        await updateAchievement(activeAchievement.id, {
          actual_value: actualValue || null,
          status,
          employee_comment: employeeComment || null,
        });
        toast.success("Achievement update saved.");
      } else {
        await createUpdate({
          goal_id: activeGoal.id,
          quarter,
          actual_value: actualValue || null,
          status,
          employee_comment: employeeComment || null,
        });
        toast.success("Quarterly update created.");
      }
      onOpenChange(false);
    } catch {
      toast.error("Unable to save achievement update.");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{activeGoal.title}</DialogTitle>
          <DialogDescription>
            Update your achievement for {quarter}.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="grid gap-3 rounded-lg border p-4 sm:grid-cols-2">
            <div>
              <p className="text-muted-foreground text-xs">Target</p>
              <p className="text-sm font-medium">
                {activeGoal.target ?? "Not set"}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Measurement</p>
              <p className="text-sm font-medium">{activeGoal.uom ?? "min"}</p>
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="actual-value" className="text-sm font-medium">
              Actual achievement
            </label>
            <Input
              id="actual-value"
              value={actualValue}
              onChange={(event) => setActualValue(event.target.value)}
              placeholder="Enter actual value"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="progress-status" className="text-sm font-medium">
              Progress status
            </label>
            <select
              id="progress-status"
              value={status}
              onChange={(event) =>
                setStatus(event.target.value as ProgressStatus)
              }
              className="border-input bg-background h-10 w-full rounded-md border px-3 text-sm"
            >
              {statuses.map((item) => (
                <option key={item} value={item}>
                  {item.replace("_", " ")}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor="employee-comment" className="text-sm font-medium">
              Employee comment
            </label>
            <Textarea
              id="employee-comment"
              value={employeeComment}
              onChange={(event) => setEmployeeComment(event.target.value)}
              placeholder="Add progress context"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button disabled={actionLoading} onClick={submit}>
            {actionLoading ? "Saving..." : "Save update"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
