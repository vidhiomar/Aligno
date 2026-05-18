"use client";

import { useState } from "react";
import { toast } from "sonner";

import { ProgressBar } from "@/components/checkins/progress-bar";
import { ProgressStatusBadge } from "@/components/checkins/progress-status-badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useCheckinStore } from "@/store/checkin.store";
import type { AchievementUpdate } from "@/types/checkin";

interface ManagerReviewDialogProps {
  achievement: AchievementUpdate | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ManagerReviewDialog({
  achievement,
  open,
  onOpenChange,
}: ManagerReviewDialogProps) {
  const [comment, setComment] = useState("");
  const [error, setError] = useState<string | null>(null);
  const { actionLoading, submitManagerReview } = useCheckinStore();

  if (!achievement || !achievement.goal) return null;
  const activeAchievement = achievement;
  const activeGoal = achievement.goal;

  async function submit() {
    const trimmedComment = comment.trim();
    if (!trimmedComment) {
      setError("Manager feedback is required.");
      return;
    }

    try {
      await submitManagerReview(activeAchievement.id, {
        manager_comment: trimmedComment,
      });
      toast.success("Manager review submitted.");
      setComment("");
      setError(null);
      onOpenChange(false);
    } catch {
      toast.error("Unable to submit manager review.");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{activeGoal.title}</DialogTitle>
          <DialogDescription>
            Review the employee check-in and add feedback.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid gap-3 rounded-lg border p-4 sm:grid-cols-2">
            <div>
              <p className="text-muted-foreground text-xs">Employee</p>
              <p className="text-sm font-medium">
                {activeGoal.employee?.full_name ?? activeGoal.employee?.email}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Quarter</p>
              <p className="text-sm font-medium">{activeAchievement.quarter}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Planned</p>
              <p className="text-sm font-medium">
                {activeAchievement.planned_value ?? "Not set"}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Actual</p>
              <p className="text-sm font-medium">
                {activeAchievement.actual_value ?? "Pending"}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between gap-4">
            <ProgressBar
              value={activeAchievement.progress_score}
              className="flex-1"
            />
            <ProgressStatusBadge status={activeAchievement.status} />
          </div>

          <div className="space-y-2">
            <label htmlFor="manager-feedback" className="text-sm font-medium">
              Manager feedback
            </label>
            <Textarea
              id="manager-feedback"
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              placeholder="Add review comments"
            />
            {error ? <p className="text-destructive text-sm">{error}</p> : null}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button disabled={actionLoading} onClick={submit}>
            {actionLoading ? "Submitting..." : "Submit review"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
