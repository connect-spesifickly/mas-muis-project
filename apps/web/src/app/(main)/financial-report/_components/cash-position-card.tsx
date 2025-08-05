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
      <div className="flex items-center gap-2">
        <Wallet className="h-4 w-4 text-blue-600" />
        <h3 className="text-sm font-medium">Posisi Kas</h3>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center py-2">
          <span className="text-sm text-muted-foreground">Saldo Awal:</span>
          <span className="font-medium">
            {formatCurrency(cashPosition.saldoAwal)}
          </span>
        </div>
        <div className="flex justify-between items-center py-2">
          <span className="text-sm text-muted-foreground">Saldo Akhir:</span>
          <span className="font-medium text-green-600">
            {formatCurrency(cashPosition.saldoAkhir)}
          </span>
        </div>
      </div>
    </div>
  );
}
