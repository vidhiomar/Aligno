"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

import { GoalStatusBadge } from "@/components/manager/goal-status-badge";
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
import { useManagerStore } from "@/store/manager.store";
import type { ManagerGoal } from "@/types/manager";

interface ReviewDialogProps {
  goal: ManagerGoal | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ReviewDialog({ goal, open, onOpenChange }: ReviewDialogProps) {
  const [comment, setComment] = useState("");
  const [commentError, setCommentError] = useState<string | null>(null);
  const [target, setTarget] = useState("");
  const [uom, setUom] = useState("");
  const [uomType, setUomType] = useState<ManagerGoal["uom_type"]>("numeric");
  const [weightage, setWeightage] = useState(10);
  const { approveGoal, rejectGoal, reworkGoal, updateGoalInline, actionLoading } =
    useManagerStore();

  useEffect(() => {
    if (!goal) return;
    setTarget(goal.target ?? "");
    setUom(goal.uom ?? "");
    setUomType(goal.uom_type ?? "numeric");
    setWeightage(goal.weightage);
  }, [goal]);

  if (!goal) return null;

  const activeAction = actionLoading[goal.id];

  async function review(action: "approve" | "rework" | "reject") {
    if (!goal) return;

    const trimmedComment = comment.trim();
    if ((action === "rework" || action === "reject") && !trimmedComment) {
      setCommentError("Manager comment is required for rework and rejection.");
      return;
    }

    setCommentError(null);
    try {
      if (action === "approve") {
        await approveGoal(goal.id, trimmedComment || undefined);
        toast.success("Goal approved and locked.");
      }
      if (action === "rework") {
        await reworkGoal(goal.id, trimmedComment);
        toast.success("Goal sent back for rework.");
      }
      if (action === "reject") {
        await rejectGoal(goal.id, trimmedComment);
        toast.success("Goal rejected.");
      }
      setComment("");
      onOpenChange(false);
    } catch {
      toast.error("Unable to complete review action.");
    }
  }

  async function saveInlineEdits() {
    if (!goal) return;
    if (weightage < 10) {
      toast.error("Minimum weightage per goal is 10%.");
      return;
    }

    try {
      await updateGoalInline(goal.id, {
        target: target.trim() || null,
        uom: uom.trim() || null,
        uom_type: uomType,
        weightage,
      });
      toast.success("Review edits saved.");
    } catch {
      toast.error("Unable to save review edits.");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{goal.title}</DialogTitle>
          <DialogDescription>
            Review submitted goal details and choose an approval action.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid gap-3 rounded-lg border p-4 sm:grid-cols-3">
            <div>
              <p className="text-muted-foreground text-xs">Employee</p>
              <p className="text-sm font-medium">
                {goal.employee?.full_name ?? goal.employee?.email}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Weightage</p>
              <p className="text-sm font-medium">{goal.weightage}%</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Status</p>
              <div className="mt-1">
                <GoalStatusBadge status={goal.status} />
              </div>
            </div>
          </div>

          <div className="grid gap-3 rounded-lg border p-4 sm:grid-cols-2">
            <label className="space-y-2 text-sm font-medium">
              <span>Target</span>
              <Input
                value={target}
                onChange={(event) => setTarget(event.target.value)}
                placeholder="Planned target"
              />
            </label>
            <label className="space-y-2 text-sm font-medium">
              <span>Weightage</span>
              <Input
                type="number"
                min={10}
                max={100}
                value={weightage}
                onChange={(event) => setWeightage(Number(event.target.value))}
              />
            </label>
            <label className="space-y-2 text-sm font-medium">
              <span>UoM type</span>
              <select
                value={uomType}
                onChange={(event) =>
                  setUomType(event.target.value as ManagerGoal["uom_type"])
                }
                className="border-input bg-background h-10 w-full rounded-md border px-3 text-sm"
              >
                <option value="numeric">Numeric</option>
                <option value="percent">%</option>
                <option value="timeline">Timeline</option>
                <option value="zero_based">Zero-based</option>
              </select>
            </label>
            <label className="space-y-2 text-sm font-medium">
              <span>UoM label</span>
              <Input
                value={uom}
                onChange={(event) => setUom(event.target.value)}
                placeholder="Revenue, %, Date"
              />
            </label>
            <div className="sm:col-span-2">
              <Button
                variant="outline"
                size="sm"
                disabled={Boolean(activeAction)}
                onClick={saveInlineEdits}
              >
                Save target / weightage edits
              </Button>
            </div>
          </div>

          <div>
            <p className="text-sm font-medium">Goal details</p>
            <p className="bg-muted text-muted-foreground mt-2 rounded-lg p-3 text-sm">
              {goal.description ?? "No description provided."}
            </p>
          </div>

          <div className="space-y-2">
            <label htmlFor="manager-comment" className="text-sm font-medium">
              Manager comment
            </label>
            <Textarea
              id="manager-comment"
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              placeholder="Add feedback for the employee"
            />
            {commentError ? (
              <p className="text-destructive text-sm">{commentError}</p>
            ) : null}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            disabled={Boolean(activeAction)}
            onClick={() => review("reject")}
          >
            {activeAction === "reject" ? "Rejecting..." : "Reject"}
          </Button>
          <Button
            variant="secondary"
            disabled={Boolean(activeAction)}
            onClick={() => review("rework")}
          >
            {activeAction === "rework" ? "Sending..." : "Send for rework"}
          </Button>
          <Button
            disabled={Boolean(activeAction)}
            onClick={() => review("approve")}
          >
            {activeAction === "approve" ? "Approving..." : "Approve"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
