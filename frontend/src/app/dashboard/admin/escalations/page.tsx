"use client";

import {
  AlertTriangle,
  Bell,
  CheckCircle2,
  Clock,
  RefreshCw,
  Shield,
} from "lucide-react";
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
import {
  adminService,
  type EscalationLog,
  type EscalationRule,
} from "@/services/admin.service";

export default function EscalationsPage() {
  const [rules, setRules] = useState<EscalationRule[]>([]);
  const [logs, setLogs] = useState<EscalationLog[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchData() {
    setLoading(true);
    try {
      const [rulesRes, logsRes] = await Promise.all([
        adminService.getEscalationRules(),
        adminService.getEscalationLogs(),
      ]);
      setRules(rulesRes.rules);
      setLogs(logsRes.logs);
    } catch {
      toast.error("Unable to load escalation data.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  async function toggleRule(ruleId: string, currentActive: boolean) {
    try {
      await adminService.updateEscalationRule(ruleId, {
        is_active: !currentActive,
      });
      setRules((prev) =>
        prev.map((r) =>
          r.id === ruleId ? { ...r, is_active: !currentActive } : r,
        ),
      );
      toast.success(
        `Rule ${!currentActive ? "activated" : "deactivated"}.`,
      );
    } catch {
      toast.error("Unable to update rule.");
    }
  }

  async function updateThreshold(ruleId: string, value: number) {
    try {
      await adminService.updateEscalationRule(ruleId, {
        days_threshold: value,
      });
      setRules((prev) =>
        prev.map((r) =>
          r.id === ruleId ? { ...r, days_threshold: value } : r,
        ),
      );
    } catch {
      toast.error("Unable to update threshold.");
    }
  }

  const pendingCount = logs.filter((l) => l.status === "pending").length;
  const resolvedCount = logs.filter((l) => l.status === "resolved").length;

  return (
    <DashboardShell>
      <div className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-normal flex items-center gap-2">
              <Shield className="h-6 w-6 text-primary" />
              Escalation Module
            </h1>
            <p className="text-muted-foreground text-sm">
              Configure rule-based escalations and track resolution status.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={fetchData}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>

        <section className="grid gap-4 md:grid-cols-3">
          <Card className="animate-in-up">
            <CardContent className="flex items-center gap-3 p-4">
              <div className="rounded-lg bg-primary/10 p-2">
                <Bell className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-semibold">{rules.length}</p>
                <p className="text-muted-foreground text-sm">
                  Escalation Rules
                </p>
              </div>
            </CardContent>
          </Card>
          <Card className="animate-in-up delay-1">
            <CardContent className="flex items-center gap-3 p-4">
              <div className="rounded-lg bg-amber-100 p-2">
                <Clock className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-semibold">{pendingCount}</p>
                <p className="text-muted-foreground text-sm">
                  Pending Escalations
                </p>
              </div>
            </CardContent>
          </Card>
          <Card className="animate-in-up delay-2">
            <CardContent className="flex items-center gap-3 p-4">
              <div className="rounded-lg bg-emerald-100 p-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-semibold">{resolvedCount}</p>
                <p className="text-muted-foreground text-sm">
                  Resolved
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        ) : (
          <>
            <Card className="animate-in-up delay-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Escalation Rules
                </CardTitle>
                <CardDescription>
                  Configure conditions, thresholds, and escalation chains
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {rules.map((rule) => (
                    <div
                      key={rule.id}
                      className={`rounded-lg border p-4 transition-all duration-300 ${
                        rule.is_active
                          ? "border-primary/30 bg-primary/5"
                          : "opacity-60"
                      }`}
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold">{rule.condition}</p>
                            <Badge
                              variant={
                                rule.is_active ? "default" : "secondary"
                              }
                            >
                              {rule.is_active ? "Active" : "Inactive"}
                            </Badge>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {rule.escalation_chain.map((step, i) => (
                              <span key={i} className="flex items-center gap-1">
                                <span className="rounded bg-muted px-2 py-0.5 text-xs font-medium">
                                  {step}
                                </span>
                                {i < rule.escalation_chain.length - 1 && (
                                  <span className="text-xs text-muted-foreground">
                                    →
                                  </span>
                                )}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            <label className="text-xs text-muted-foreground whitespace-nowrap">
                              Threshold (days):
                            </label>
                            <Input
                              type="number"
                              min={1}
                              value={rule.days_threshold}
                              onChange={(e) =>
                                updateThreshold(
                                  rule.id,
                                  Number(e.target.value),
                                )
                              }
                              className="h-8 w-20 text-sm"
                            />
                          </div>
                          <Button
                            size="sm"
                            variant={rule.is_active ? "destructive" : "default"}
                            onClick={() =>
                              toggleRule(rule.id, rule.is_active)
                            }
                          >
                            {rule.is_active ? "Disable" : "Enable"}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="animate-in-up delay-3">
              <CardHeader>
                <CardTitle>Escalation Log</CardTitle>
                <CardDescription>
                  Recent escalation triggers and their resolution status
                </CardDescription>
              </CardHeader>
              <CardContent>
                {logs.length === 0 ? (
                  <div className="rounded-md border border-dashed p-8 text-center">
                    <CheckCircle2 className="mx-auto h-8 w-8 text-muted-foreground" />
                    <p className="mt-2 font-medium">
                      No escalations triggered
                    </p>
                    <p className="text-muted-foreground text-sm">
                      Escalations will appear here when rules are triggered.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ID</TableHead>
                          <TableHead>Rule</TableHead>
                          <TableHead>Employee</TableHead>
                          <TableHead>Triggered</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Resolved</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {logs.map((log) => (
                          <TableRow key={log.id}>
                            <TableCell className="font-mono text-xs">
                              {log.id}
                            </TableCell>
                            <TableCell>
                              <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
                                {log.rule_id}
                              </code>
                            </TableCell>
                            <TableCell className="font-medium">
                              {log.employee_name}
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                              {new Date(log.triggered_at).toLocaleString()}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  log.status === "resolved"
                                    ? "default"
                                    : "destructive"
                                }
                              >
                                {log.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                              {log.resolved_at
                                ? new Date(log.resolved_at).toLocaleString()
                                : "—"}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </DashboardShell>
  );
}
