"use client";

import { ClipboardEdit, MessageSquare } from "lucide-react";

import { ProgressBar } from "@/components/checkins/progress-bar";
import { ProgressStatusBadge } from "@/components/checkins/progress-status-badge";
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
import type { AchievementUpdate, CheckinGoal, Quarter } from "@/types/checkin";

export interface AchievementTableItem {
  goal: CheckinGoal;
  achievement: AchievementUpdate | null;
  quarter: Quarter;
}

interface AchievementTableProps {
  items: AchievementTableItem[];
  isLoading: boolean;
  mode: "employee" | "manager";
  onUpdate?: (item: AchievementTableItem) => void;
  onReview?: (achievement: AchievementUpdate) => void;
}

export function AchievementTable({
  items,
  isLoading,
  mode,
  onUpdate,
  onReview,
}: AchievementTableProps) {
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
              {mode === "manager" ? <TableHead>Employee</TableHead> : null}
              <TableHead>Goal</TableHead>
              <TableHead>Target</TableHead>
              <TableHead>Actual</TableHead>
              <TableHead>Progress</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Quarter</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={mode === "manager" ? 8 : 7}
                  className="text-muted-foreground h-28 text-center"
                >
                  No quarterly progress records found.
                </TableCell>
              </TableRow>
            ) : (
              items.map((item) => (
                <TableRow
                  key={`${item.goal.id}-${item.achievement?.id ?? item.quarter}`}
                >
                  {mode === "manager" ? (
                    <TableCell>
                      <div className="font-medium">
                        {item.goal.employee?.full_name ?? "Unnamed employee"}
                      </div>
                      <div className="text-muted-foreground text-xs">
                        {item.goal.employee?.email}
                      </div>
                    </TableCell>
                  ) : null}
                  <TableCell className="max-w-64 truncate font-medium">
                    {item.goal.title}
                  </TableCell>
                  <TableCell>
                    {item.achievement?.planned_value ??
                      item.goal.target ??
                      "Not set"}
                  </TableCell>
                  <TableCell>
                    {item.achievement?.actual_value ?? "Pending"}
                  </TableCell>
                  <TableCell className="min-w-32">
                    <ProgressBar
                      value={item.achievement?.progress_score ?? 0}
                    />
                  </TableCell>
                  <TableCell>
                    <ProgressStatusBadge
                      status={item.achievement?.status ?? "not_started"}
                    />
                  </TableCell>
                  <TableCell>
                    {item.achievement?.quarter ?? item.quarter}
                  </TableCell>
                  <TableCell className="text-right">
                    {mode === "manager" && item.achievement ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onReview?.(item.achievement!)}
                      >
                        <MessageSquare className="mr-2 h-4 w-4" />
                        Review
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onUpdate?.(item)}
                      >
                        <ClipboardEdit className="mr-2 h-4 w-4" />
                        {item.achievement ? "Update" : "Add update"}
                      </Button>
                    )}
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
