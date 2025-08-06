"use client";

import { TrendingUp } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-green-600" />
          <CardTitle className="text-base">Rincian Bulanan</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded-lg">
          <span className="text-sm text-muted-foreground">Omset:</span>
          <span className="font-medium">
            {formatCurrency(monthlySummary.omset)}
          </span>
        </div>
        <div className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded-lg">
          <span className="text-sm text-muted-foreground">
            Total Pengeluaran:
          </span>
          <span className="font-medium text-red-600">
            {formatCurrency(monthlySummary.totalPengeluaran)}
          </span>
        </div>
        <div className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded-lg">
          <span className="text-sm text-muted-foreground">HPP:</span>
          <span className="font-medium">
            {formatCurrency(monthlySummary.hpp)}
          </span>
        </div>

        <Separator className="my-3" />

        <div className="flex justify-between items-center py-2 px-3 bg-green-50 rounded-lg border border-green-200">
          <span className="text-sm font-medium text-green-800">
            Laba Bersih:
          </span>
          <span className="font-semibold text-green-600">
            {formatCurrency(monthlySummary.labaBersih)}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
