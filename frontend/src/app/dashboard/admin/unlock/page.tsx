"use client";

import { Lock, RefreshCw, Unlock } from "lucide-react";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { adminService, type LockedGoal } from "@/services/admin.service";

export default function GoalUnlockPage() {
  const [goals, setGoals] = useState<LockedGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [unlockReason, setUnlockReason] = useState("");
  const [unlockingId, setUnlockingId] = useState<number | null>(null);

  async function fetchGoals() {
    setLoading(true);
    try {
      const response = await adminService.getLockedGoals();
      setGoals(response.goals);
    } catch {
      toast.error("Unable to load locked goals.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchGoals();
  }, []);

  async function handleUnlock(goalId: number) {
    if (!unlockReason.trim()) {
      toast.error("Please provide a reason for unlocking.");
      return;
    }
    try {
      await adminService.unlockGoal(goalId, unlockReason.trim());
      setGoals((prev) => prev.filter((g) => g.id !== goalId));
      setUnlockingId(null);
      setUnlockReason("");
      toast.success(`Goal #${goalId} unlocked and returned to draft.`);
    } catch {
      toast.error("Unable to unlock goal.");
    }
  }

  return (
    <DashboardShell>
      <div className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-normal flex items-center gap-2">
              <Lock className="h-6 w-6 text-primary" />
              Goal Unlock Tool
            </h1>
            <p className="text-muted-foreground text-sm">
              Unlock approved/locked goals so employees can edit them. All
              unlocks are logged in the audit trail.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={fetchGoals}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>

        <Card className="animate-in-up">
          <CardHeader>
            <CardTitle>Locked Goals</CardTitle>
            <CardDescription>
              {goals.length} goals currently locked
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : goals.length === 0 ? (
              <div className="rounded-md border border-dashed p-8 text-center">
                <Unlock className="mx-auto h-8 w-8 text-muted-foreground" />
                <p className="mt-2 font-medium">No locked goals</p>
                <p className="text-muted-foreground text-sm">
                  All goals are currently editable.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-16">ID</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Employee ID</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Weightage</TableHead>
                      <TableHead className="w-48">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {goals.map((goal) => (
                      <TableRow key={goal.id}>
                        <TableCell className="font-mono text-xs">
                          {goal.id}
                        </TableCell>
                        <TableCell className="font-medium">
                          {goal.title}
                        </TableCell>
                        <TableCell className="text-sm">
                          Employee #{goal.employee_id}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{goal.status}</Badge>
                        </TableCell>
                        <TableCell>{goal.weightage}%</TableCell>
                        <TableCell>
                          {unlockingId === goal.id ? (
                            <div className="space-y-2">
                              <Textarea
                                value={unlockReason}
                                onChange={(e) =>
                                  setUnlockReason(e.target.value)
                                }
                                placeholder="Reason for unlock..."
                                className="text-sm"
                                rows={2}
                              />
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleUnlock(goal.id)}
                                >
                                  <Unlock className="mr-1 h-3 w-3" />
                                  Confirm
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => {
                                    setUnlockingId(null);
                                    setUnlockReason("");
                                  }}
                                >
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setUnlockingId(goal.id)}
                            >
                              <Unlock className="mr-1 h-3 w-3" />
                              Unlock
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
