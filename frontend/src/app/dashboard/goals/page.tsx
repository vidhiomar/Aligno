"use client";

import {
  CalendarClock,
  CheckCircle2,
  CircleAlert,
  Lock,
  Plus,
  Send,
  Trash2,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { GoalStatusBadge } from "@/components/manager/goal-status-badge";
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
import { Textarea } from "@/components/ui/textarea";
import { useAuthStore } from "@/store/auth-store";
import { useGoalStore } from "@/store/goal.store";
import type { Goal, GoalPayload, UomType } from "@/types/goal";

const emptyForm: GoalPayload = {
  thrust_area: "",
  title: "",
  description: "",
  uom: "",
  uom_type: "numeric",
  target: "",
  weightage: 10,
};

const schedule = [
  ["Goal Setting", "1 May", "Creation, submission and L1 approval"],
  ["Q1 Check-in", "July", "Planned vs. actual update"],
  ["Q2 Check-in", "October", "Planned vs. actual update"],
  ["Q3 Check-in", "January", "Planned vs. actual update"],
  ["Q4 / Annual", "March / April", "Final achievement capture"],
];

export default function GoalSheetPage() {
  const { user } = useAuthStore();
  const {
    goals,
    loading,
    actionLoading,
    error,
    fetchGoals,
    createGoal,
    updateGoal,
    deleteGoal,
    submitGoalSheet,
  } = useGoalStore();
  const [editingGoalId, setEditingGoalId] = useState<number | null>(null);
  const [form, setForm] = useState<GoalPayload>(emptyForm);

  useEffect(() => {
    fetchGoals().catch(() => toast.error("Unable to load your goal sheet."));
  }, [fetchGoals]);

  const activeGoals = useMemo(
    () => goals.filter((goal) => goal.status !== "rejected"),
    [goals],
  );
  const totalWeightage = activeGoals.reduce((sum, goal) => sum + goal.weightage, 0);
  const canSubmit =
    activeGoals.length > 0 &&
    activeGoals.length <= 8 &&
    totalWeightage === 100 &&
    activeGoals.every((goal) => goal.weightage >= 10) &&
    activeGoals.some((goal) => goal.status === "draft" || goal.status === "rework");
  const editingGoal = goals.find((goal) => goal.id === editingGoalId) ?? null;
  const isSharedRecipient =
    Boolean(editingGoal?.shared_goal_group_id) &&
    editingGoal?.primary_owner_id !== user?.id;

  function startEdit(goal: Goal) {
    setEditingGoalId(goal.id);
    setForm({
      thrust_area: goal.thrust_area ?? "",
      title: goal.title,
      description: goal.description ?? "",
      uom: goal.uom ?? "",
      uom_type: goal.uom_type,
      target: goal.target ?? "",
      weightage: goal.weightage,
    });
  }

  function resetForm() {
    setEditingGoalId(null);
    setForm(emptyForm);
  }

  async function saveGoal() {
    if (!form.title.trim()) {
      toast.error("Goal title is required.");
      return;
    }
    if (!form.thrust_area?.trim()) {
      toast.error("Select or enter a thrust area.");
      return;
    }
    if (form.weightage < 10) {
      toast.error("Minimum weightage per goal is 10%.");
      return;
    }
    const payload = {
      ...form,
      title: form.title.trim(),
      thrust_area: form.thrust_area?.trim() || null,
      description: form.description?.trim() || null,
      target: form.target?.trim() || null,
      uom: form.uom?.trim() || null,
    };

    try {
      if (editingGoalId) {
        await updateGoal(
          editingGoalId,
          isSharedRecipient ? { weightage: payload.weightage } : payload,
        );
        toast.success("Goal updated.");
      } else {
        if (goals.length >= 8) {
          toast.error("Employees can have a maximum of 8 goals.");
          return;
        }
        await createGoal(payload);
        toast.success("Goal added.");
      }
      resetForm();
    } catch {
      toast.error("Unable to save goal.");
    }
  }

  async function submitSheet() {
    try {
      await submitGoalSheet();
      toast.success("Goal sheet submitted to your L1 manager.");
    } catch {
      toast.error("Submit failed. Check the validation rules.");
    }
  }

  return (
    <DashboardShell>
      <div className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <div className="rounded-lg bg-primary/10 p-1.5">
                <CheckCircle2 className="h-5 w-5 text-primary" />
              </div>
              Goal Sheet
            </h1>
            <p className="text-muted-foreground text-sm">
              Create goals, balance weightage to 100%, then submit for L1 approval.
            </p>
          </div>
          <Button
            disabled={!canSubmit || actionLoading}
            onClick={submitSheet}
            className="shadow-sm transition-all duration-300 hover:shadow-md"
          >
            <Send className="mr-2 h-4 w-4" />
            Submit sheet
          </Button>
        </div>

        <section className="grid gap-4 md:grid-cols-4">
          <RuleCard label="Total weightage" value={`${totalWeightage}%`} ok={totalWeightage === 100} />
          <RuleCard label="Goal count" value={`${activeGoals.length}/8`} ok={activeGoals.length <= 8} />
          <RuleCard label="Minimum per goal" value="10%" ok={activeGoals.every((goal) => goal.weightage >= 10)} />
          <RuleCard label="Approval lock" value="Enabled" ok />
        </section>

        {error ? <p className="text-destructive text-sm">{error}</p> : null}

        <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
          <Card>
            <CardHeader>
              <CardTitle>My goals</CardTitle>
              <CardDescription>
                Approved goals are locked. Shared goals only allow recipient weightage edits.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <Skeleton key={index} className="h-24 w-full" />
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {goals.map((goal) => (
                    <div key={goal.id} className="rounded-md border p-4">
                      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                        <div className="min-w-0 space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <h2 className="font-semibold">{goal.title}</h2>
                            <GoalStatusBadge status={goal.status} />
                            {goal.is_locked ? <Lock className="text-muted-foreground h-4 w-4" /> : null}
                          </div>
                          <p className="text-muted-foreground text-sm">{goal.description || "No description added."}</p>
                          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                            <span className="rounded-md bg-muted px-2 py-1">{goal.thrust_area || "No thrust area"}</span>
                            <span className="rounded-md bg-muted px-2 py-1">Target: {goal.target || "Not set"}</span>
                            <span className="rounded-md bg-muted px-2 py-1">{goal.uom || goal.uom_type}</span>
                            {goal.shared_goal_group_id ? <span className="rounded-md bg-muted px-2 py-1">Shared KPI</span> : null}
                          </div>
                          {goal.manager_comment ? (
                            <p className="rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-900">
                              {goal.manager_comment}
                            </p>
                          ) : null}
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                          <div className="min-w-16 rounded-md border px-3 py-2 text-center">
                            <p className="text-lg font-semibold">{goal.weightage}%</p>
                            <p className="text-muted-foreground text-xs">weight</p>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={goal.is_locked || !["draft", "rework"].includes(goal.status)}
                            onClick={() => startEdit(goal)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            disabled={goal.is_locked || !["draft", "rework"].includes(goal.status)}
                            onClick={() =>
                              deleteGoal(goal.id)
                                .then(() => toast.success("Goal removed."))
                                .catch(() => toast.error("Unable to remove goal."))
                            }
                            aria-label="Delete goal"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {!goals.length ? (
                    <div className="rounded-md border border-dashed p-8 text-center">
                      <Plus className="text-muted-foreground mx-auto h-8 w-8" />
                      <p className="mt-2 font-medium">No goals yet</p>
                      <p className="text-muted-foreground text-sm">Add your first goal to start the sheet.</p>
                    </div>
                  ) : null}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{editingGoalId ? "Edit goal" : "Add goal"}</CardTitle>
                <CardDescription>
                  {isSharedRecipient
                    ? "This shared KPI only permits weightage changes."
                    : "Keep the goal measurable and easy for your manager to review."}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Field label="Thrust area">
                  <Input
                    value={form.thrust_area ?? ""}
                    disabled={isSharedRecipient}
                    onChange={(event) => setForm({ ...form, thrust_area: event.target.value })}
                    placeholder="Customer, People, Process"
                  />
                </Field>
                <Field label="Goal title">
                  <Input
                    value={form.title}
                    disabled={isSharedRecipient}
                    onChange={(event) => setForm({ ...form, title: event.target.value })}
                    placeholder="Improve onboarding activation"
                  />
                </Field>
                <Field label="Description">
                  <Textarea
                    value={form.description ?? ""}
                    disabled={isSharedRecipient}
                    onChange={(event) => setForm({ ...form, description: event.target.value })}
                    placeholder="Define the business outcome"
                  />
                </Field>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="UoM">
                    <select
                      value={form.uom_type}
                      disabled={isSharedRecipient}
                      onChange={(event) => setForm({ ...form, uom_type: event.target.value as UomType })}
                      className="border-input bg-background h-10 w-full rounded-md border px-3 text-sm"
                    >
                      <option value="numeric">Numeric</option>
                      <option value="percent">%</option>
                      <option value="timeline">Timeline</option>
                      <option value="zero_based">Zero-based</option>
                    </select>
                  </Field>
                  <Field label="Label">
                    <Input
                      value={form.uom ?? ""}
                      disabled={isSharedRecipient}
                      onChange={(event) => setForm({ ...form, uom: event.target.value })}
                      placeholder="Revenue, %, Date"
                    />
                  </Field>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Target">
                    <Input
                      value={form.target ?? ""}
                      disabled={isSharedRecipient}
                      onChange={(event) => setForm({ ...form, target: event.target.value })}
                      placeholder={form.uom_type === "timeline" ? "2026-06-30" : "100"}
                    />
                  </Field>
                  <Field label="Weightage">
                    <Input
                      type="number"
                      min={10}
                      max={100}
                      value={form.weightage}
                      onChange={(event) => setForm({ ...form, weightage: Number(event.target.value) })}
                    />
                  </Field>
                </div>
                <div className="flex gap-2">
                  <Button className="flex-1" disabled={actionLoading} onClick={saveGoal}>
                    {editingGoalId ? "Save goal" : "Add goal"}
                  </Button>
                  {editingGoalId ? (
                    <Button variant="outline" onClick={resetForm}>
                      Cancel
                    </Button>
                  ) : null}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarClock className="h-5 w-5" />
                  Check-in schedule
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {schedule.map(([period, opens, action]) => (
                  <div key={period} className="grid grid-cols-[92px_1fr] gap-3 rounded-md border p-3 text-sm">
                    <div>
                      <p className="font-medium">{opens}</p>
                      <p className="text-muted-foreground text-xs">opens</p>
                    </div>
                    <div>
                      <p className="font-medium">{period}</p>
                      <p className="text-muted-foreground">{action}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </DashboardShell>
  );
}

function RuleCard({ label, value, ok }: { label: string; value: string; ok: boolean }) {
  return (
    <Card className={`relative overflow-hidden transition-all duration-300 ${
      ok
        ? "border-emerald-200/60 bg-emerald-50/30 dark:border-emerald-800/40 dark:bg-emerald-950/20"
        : "border-amber-200/60 bg-amber-50/30 dark:border-amber-800/40 dark:bg-amber-950/20"
    }`}>
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${
        ok ? "bg-emerald-500" : "bg-amber-500"
      }`} />
      <CardContent className="flex items-center justify-between p-4 pl-5">
        <div>
          <p className="text-muted-foreground text-xs font-medium uppercase tracking-wider">{label}</p>
          <p className="text-2xl font-bold mt-0.5">{value}</p>
        </div>
        <div className={`rounded-full p-1.5 ${ok ? "bg-emerald-100 dark:bg-emerald-900/40" : "bg-amber-100 dark:bg-amber-900/40"}`}>
          {ok ? (
            <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          ) : (
            <CircleAlert className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="space-y-2 text-sm font-medium">
      <span>{label}</span>
      {children}
    </label>
  );
}
