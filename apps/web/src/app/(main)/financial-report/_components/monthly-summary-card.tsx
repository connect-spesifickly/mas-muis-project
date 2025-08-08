"use client";

import { DollarSign, Minus, Calculator, Plus } from "lucide-react";
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
      <div className="bg-blue-50 rounded-lg border border-blue-100 p-3">
        <div className="flex items-center gap-2 mb-2">
          <DollarSign className="h-4 w-4 text-blue-600 flex-shrink-0" />
          <span className="text-xs font-medium text-blue-700">Omset</span>
        </div>
        <div className="text-sm font-semibold text-blue-900 break-words">
          {formatCurrency(monthlySummary.omset)}
        </div>
      </div>

      <div className="bg-red-50 rounded-lg border border-red-100 p-3">
        <div className="flex items-center gap-2 mb-2">
          <Minus className="h-4 w-4 text-red-600 flex-shrink-0" />
          <span className="text-xs font-medium text-red-700">
            Total Pengeluaran
          </span>
        </div>
        <div className="text-sm font-semibold text-red-900 break-words">
          {formatCurrency(monthlySummary.totalPengeluaran)}
        </div>
      </div>

      {/* <div className="bg-orange-50 rounded-lg border border-orange-100 p-3">
        <div className="flex items-center gap-2 mb-2">
          <Calculator className="h-4 w-4 text-orange-600 flex-shrink-0" />
          <span className="text-xs font-medium text-orange-700">HPP</span>
        </div>
        <div className="text-sm font-semibold text-orange-900 break-words">
          {formatCurrency(monthlySummary.hpp)}
        </div>
      </div> */}

      <Separator className="my-3" />

      <div className="bg-green-50 rounded-lg border border-green-100 p-3">
        <div className="flex items-center gap-2 mb-2">
          <Plus className="h-4 w-4 text-green-600 flex-shrink-0" />
          <span className="text-xs font-medium text-green-700">
            Laba Bersih
          </span>
        </div>
        <div className="text-sm font-semibold text-green-900 break-words">
          {formatCurrency(monthlySummary.labaBersih)}
        </div>
      </div>
    </div>
  );
}
