"use client";

import { FileText, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { DashboardShell } from "@/components/layout/dashboard-shell";
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
import { adminService, type AuditLogEntry } from "@/services/admin.service";

export default function AuditLogPage() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  async function fetchLogs() {
    setLoading(true);
    try {
      const response = await adminService.getAuditLogs();
      setLogs(response.logs);
    } catch {
      toast.error("Unable to load audit logs.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter((log) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      log.field_name.toLowerCase().includes(q) ||
      String(log.goal_id).includes(q) ||
      (log.old_value?.toLowerCase().includes(q) ?? false) ||
      (log.new_value?.toLowerCase().includes(q) ?? false)
    );
  });

  return (
    <DashboardShell>
      <div className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-normal flex items-center gap-2">
              <FileText className="h-6 w-6 text-primary" />
              Audit Log
            </h1>
            <p className="text-muted-foreground text-sm">
              All changes made to goals after the lock date — who changed what
              and when.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={fetchLogs}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>

        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by field name, goal ID, or value..."
          className="max-w-sm"
        />

        <Card className="animate-in-up">
          <CardHeader>
            <CardTitle>Change History</CardTitle>
            <CardDescription>
              {filteredLogs.length} audit entries found
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : filteredLogs.length === 0 ? (
              <div className="rounded-md border border-dashed p-8 text-center">
                <FileText className="mx-auto h-8 w-8 text-muted-foreground" />
                <p className="mt-2 font-medium">No audit entries found</p>
                <p className="text-muted-foreground text-sm">
                  Changes to locked goals will appear here.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-16">ID</TableHead>
                      <TableHead>Goal ID</TableHead>
                      <TableHead>Changed By</TableHead>
                      <TableHead>Field</TableHead>
                      <TableHead>Old Value</TableHead>
                      <TableHead>New Value</TableHead>
                      <TableHead>Changed At</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="font-mono text-xs">
                          {log.id}
                        </TableCell>
                        <TableCell>
                          <span className="rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                            Goal #{log.goal_id}
                          </span>
                        </TableCell>
                        <TableCell className="text-sm">
                          User #{log.changed_by}
                        </TableCell>
                        <TableCell>
                          <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
                            {log.field_name}
                          </code>
                        </TableCell>
                        <TableCell className="max-w-32 truncate text-sm text-muted-foreground">
                          {log.old_value ?? "—"}
                        </TableCell>
                        <TableCell className="max-w-32 truncate text-sm font-medium">
                          {log.new_value ?? "—"}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                          {new Date(log.changed_at).toLocaleString()}
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
