"use client";

import { TrendingUp } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { MonthlySummary } from "@/hooks/use-report";

interface MonthlySummaryCardProps {
  monthlySummary: MonthlySummary;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
};

export function MonthlySummaryCard({
  monthlySummary,
}: MonthlySummaryCardProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <TrendingUp className="h-4 w-4 text-green-600" />
        <h3 className="text-sm font-medium">Rincian Bulanan</h3>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center py-2">
          <span className="text-sm text-muted-foreground">Omset:</span>
          <span className="font-medium">
            {formatCurrency(monthlySummary.omset)}
          </span>
        </div>
        <div className="flex justify-between items-center py-2">
          <span className="text-sm text-muted-foreground">
            Total Pengeluaran:
          </span>
          <span className="font-medium text-red-600">
            {formatCurrency(monthlySummary.totalPengeluaran)}
          </span>
        </div>
        <div className="flex justify-between items-center py-2">
          <span className="text-sm text-muted-foreground">HPP:</span>
          <span className="font-medium">
            {formatCurrency(monthlySummary.hpp)}
          </span>
        </div>

        <Separator className="my-3" />

        <div className="flex justify-between items-center py-2">
          <span className="text-sm font-medium">Laba Bersih:</span>
          <span className="font-semibold text-green-600">
            {formatCurrency(monthlySummary.labaBersih)}
          </span>
        </div>
      </div>
    </div>
  );
}
