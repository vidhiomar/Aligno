"use client";

import { Pencil, RefreshCw, Save, Users, X } from "lucide-react";
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
import { adminService, type AdminUser } from "@/services/admin.service";

export default function UserManagementPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Partial<AdminUser>>({});

  async function fetchUsers() {
    setLoading(true);
    try {
      const response = await adminService.getUsers();
      setUsers(response.users);
    } catch {
      toast.error("Unable to load users.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchUsers();
  }, []);

  function startEdit(user: AdminUser) {
    setEditingId(user.id);
    setEditForm({
      full_name: user.full_name,
      role: user.role,
      manager_id: user.manager_id,
    });
  }

  async function saveEdit() {
    if (editingId === null) return;
    try {
      const updated = await adminService.updateUser(editingId, editForm);
      setUsers((prev) =>
        prev.map((u) => (u.id === editingId ? { ...u, ...updated } : u)),
      );
      setEditingId(null);
      toast.success("User updated.");
    } catch {
      toast.error("Unable to update user.");
    }
  }

  const filteredUsers = users.filter((user) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      user.email.toLowerCase().includes(q) ||
      (user.full_name?.toLowerCase().includes(q) ?? false) ||
      user.role.toLowerCase().includes(q)
    );
  });

  const roleCounts = users.reduce(
    (acc, u) => {
      acc[u.role] = (acc[u.role] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  return (
    <DashboardShell>
      <div className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-normal flex items-center gap-2">
              <Users className="h-6 w-6 text-primary" />
              User Management
            </h1>
            <p className="text-muted-foreground text-sm">
              Manage employees, assign managers, and configure org hierarchy.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={fetchUsers}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>

        <section className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="p-4">
              <p className="text-2xl font-semibold">{users.length}</p>
              <p className="text-muted-foreground text-sm">Total Users</p>
            </CardContent>
          </Card>
          {Object.entries(roleCounts).map(([role, count]) => (
            <Card key={role}>
              <CardContent className="p-4">
                <p className="text-2xl font-semibold">{count}</p>
                <p className="text-muted-foreground text-sm capitalize">
                  {role}s
                </p>
              </CardContent>
            </Card>
          ))}
        </section>

        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, email, or role..."
          className="max-w-sm"
        />

        <Card className="animate-in-up">
          <CardHeader>
            <CardTitle>Organization Hierarchy</CardTitle>
            <CardDescription>
              {filteredUsers.length} users — click Edit to modify role or
              reporting line
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Manager ID</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-24">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-mono text-xs">
                          {user.id}
                        </TableCell>
                        <TableCell>
                          {editingId === user.id ? (
                            <Input
                              value={editForm.full_name ?? ""}
                              onChange={(e) =>
                                setEditForm({
                                  ...editForm,
                                  full_name: e.target.value,
                                })
                              }
                              className="h-8 text-sm"
                            />
                          ) : (
                            <span className="font-medium">
                              {user.full_name ?? "—"}
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {user.email}
                        </TableCell>
                        <TableCell>
                          {editingId === user.id ? (
                            <select
                              value={editForm.role ?? user.role}
                              onChange={(e) =>
                                setEditForm({
                                  ...editForm,
                                  role: e.target.value,
                                })
                              }
                              className="border-input bg-background h-8 rounded-md border px-2 text-sm"
                            >
                              <option value="employee">Employee</option>
                              <option value="manager">Manager</option>
                              <option value="admin">Admin</option>
                            </select>
                          ) : (
                            <Badge
                              variant={
                                user.role === "admin"
                                  ? "destructive"
                                  : user.role === "manager"
                                    ? "default"
                                    : "secondary"
                              }
                            >
                              {user.role}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {editingId === user.id ? (
                            <Input
                              type="number"
                              value={editForm.manager_id ?? ""}
                              onChange={(e) =>
                                setEditForm({
                                  ...editForm,
                                  manager_id: e.target.value
                                    ? Number(e.target.value)
                                    : null,
                                })
                              }
                              className="h-8 w-20 text-sm"
                              placeholder="—"
                            />
                          ) : (
                            <span className="text-sm text-muted-foreground">
                              {user.manager_id ?? "—"}
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          <span
                            className={`inline-flex items-center gap-1 text-xs font-medium ${
                              user.is_active
                                ? "text-emerald-600"
                                : "text-red-500"
                            }`}
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${
                                user.is_active
                                  ? "bg-emerald-500"
                                  : "bg-red-500"
                              }`}
                            />
                            {user.is_active ? "Active" : "Inactive"}
                          </span>
                        </TableCell>
                        <TableCell>
                          {editingId === user.id ? (
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={saveEdit}
                                className="h-7 w-7"
                              >
                                <Save className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setEditingId(null)}
                                className="h-7 w-7"
                              >
                                <X className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          ) : (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => startEdit(user)}
                              className="h-7 w-7"
                            >
                              <Pencil className="h-3.5 w-3.5" />
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
