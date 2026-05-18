import { Download, FileSpreadsheet } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { ExportFormat } from "@/types/analytics";

interface DashboardHeaderProps {
  title: string;
  description: string;
  exportLoading?: boolean;
  onExport?: (format: ExportFormat) => void;
}

export function DashboardHeader({
  title,
  description,
  exportLoading,
  onExport,
}: DashboardHeaderProps) {
  return (
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        <p className="text-muted-foreground text-sm max-w-lg">{description}</p>
      </div>
      {onExport ? (
        <div className="flex gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            disabled={exportLoading}
            onClick={() => onExport("csv")}
            className="transition-all duration-200"
          >
            <Download className="mr-2 h-4 w-4" />
            CSV
          </Button>
          <Button
            size="sm"
            disabled={exportLoading}
            onClick={() => onExport("xlsx")}
            className="transition-all duration-200"
          >
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            Excel
          </Button>
        </div>
      ) : null}
    </div>
  );
}
