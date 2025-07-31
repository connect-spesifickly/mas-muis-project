"use client";

import { Wallet } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    <Card className="border-0 shadow-none bg-transparent">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <Wallet className="h-5 w-5 text-blue-600" />
          POSISI KAS
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
          <span className="text-gray-700 font-medium">Saldo Awal:</span>
          <span className="font-bold text-gray-900 text-lg">
            {formatCurrency(cashPosition.saldoAwal)}
          </span>
        </div>
        <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
          <span className="text-gray-700 font-medium">Saldo Akhir:</span>
          <span className="font-bold text-green-700 text-lg">
            {formatCurrency(cashPosition.saldoAkhir)}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
