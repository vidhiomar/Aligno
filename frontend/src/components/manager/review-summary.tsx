import { CheckCircle2, Clock3, RotateCcw } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ReviewSummaryProps {
  pendingCount: number;
  approvedCount: number;
  reworkCount: number;
}

const cards = [
  { key: "pending", label: "Pending Reviews", icon: Clock3, color: "text-amber-500", bg: "bg-amber-500/10" },
  { key: "approved", label: "Approved Goals", icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-500/10" },
  { key: "rework", label: "Rework Requests", icon: RotateCcw, color: "text-blue-500", bg: "bg-blue-500/10" },
] as const;

export function ReviewSummary({
  pendingCount,
  approvedCount,
  reworkCount,
}: ReviewSummaryProps) {
  const values = {
    pending: pendingCount,
    approved: approvedCount,
    rework: reworkCount,
  };

  return (
    <section className="grid gap-4 md:grid-cols-3">
      {cards.map((card) => (
        <Card key={card.key} className="group transition-all duration-300 hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-muted-foreground text-sm font-medium">
              {card.label}
            </CardTitle>
            <div className={`rounded-lg ${card.bg} p-1.5`}>
              <card.icon className={`h-4 w-4 ${card.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight">{values[card.key]}</div>
          </CardContent>
        </Card>
      ))}
    </section>
  );
}
