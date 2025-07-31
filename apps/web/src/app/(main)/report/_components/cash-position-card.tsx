"use client";

import { Wallet } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
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
    <Card className="shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Wallet className="h-6 w-6 text-blue-600" /> POSISI KAS
        </CardTitle>
        <CardDescription className="text-sm text-gray-500">
          Saldo Kas
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center text-lg">
          <span className="text-gray-700 font-medium">Saldo Awal:</span>
          <span className="font-semibold text-gray-900">
            {formatCurrency(cashPosition.saldoAwal)}
          </span>
        </div>
        <div className="flex justify-between items-center text-lg">
          <span className="text-gray-700 font-medium">Saldo Akhir:</span>
          <span className="font-semibold text-blue-600">
            {formatCurrency(cashPosition.saldoAkhir)}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
