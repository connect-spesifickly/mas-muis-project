"use client";

import { Wallet } from "lucide-react";
import { CashPosition } from "@/hooks/use-report";

interface CashPositionCardProps {
  cashPosition: CashPosition;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
};

export function CashPositionCard({ cashPosition }: CashPositionCardProps) {
  return (
    <div className="space-y-3">
      <div className="bg-blue-50 rounded-lg border border-blue-100 p-3">
        <div className="flex items-center gap-2 mb-2">
          <Wallet className="h-4 w-4 text-blue-600 flex-shrink-0" />
          <span className="text-xs font-medium text-blue-700">Saldo Awal</span>
        </div>
        <div className="text-sm font-semibold text-blue-900 break-words">
          {formatCurrency(cashPosition.saldoAwal)}
        </div>
      </div>

      <div className="bg-green-50 rounded-lg border border-green-100 p-3">
        <div className="flex items-center gap-2 mb-2">
          <Wallet className="h-4 w-4 text-green-600 flex-shrink-0" />
          <span className="text-xs font-medium text-green-700">
            Saldo Akhir
          </span>
        </div>
        <div className="text-sm font-semibold text-green-900 break-words">
          {formatCurrency(cashPosition.saldoAkhir)}
        </div>
      </div>
    </div>
  );
}
