"use client";

import { Eye } from "lucide-react";

import { GoalStatusBadge } from "@/components/manager/goal-status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { ManagerGoal } from "@/types/manager";

interface ManagerGoalTableProps {
  goals: ManagerGoal[];
  isLoading: boolean;
  onReview: (goal: ManagerGoal) => void;
}

function formatDate(value: string | null) {
  if (!value) return "Not submitted";
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

export function ManagerGoalTable({
  goals,
  isLoading,
  onReview,
}: ManagerGoalTableProps) {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="space-y-3 p-5">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} className="h-12 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee</TableHead>
              <TableHead>Goal Title</TableHead>
              <TableHead>Weightage</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Submitted Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {goals.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-muted-foreground h-28 text-center"
                >
                  No submitted goals need review right now.
                </TableCell>
              </TableRow>
            ) : (
              goals.map((goal) => (
                <TableRow key={goal.id}>
                  <TableCell>
                    <div className="font-medium">
                      {goal.employee?.full_name ?? "Unnamed employee"}
                    </div>
                    <div className="text-muted-foreground text-xs">
                      {goal.employee?.email}
                    </div>
                  </TableCell>
                  <TableCell className="max-w-72 truncate font-medium">
                    {goal.title}
                  </TableCell>
                  <TableCell>{goal.weightage}%</TableCell>
                  <TableCell>
                    <GoalStatusBadge status={goal.status} />
                  </TableCell>
                  <TableCell>{formatDate(goal.submitted_at)}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onReview(goal)}
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      Review
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
