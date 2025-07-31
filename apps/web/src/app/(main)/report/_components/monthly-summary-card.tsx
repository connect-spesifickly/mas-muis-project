"use client";

import { TrendingUp } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
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
    <Card className="shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <TrendingUp className="h-6 w-6 text-green-600" /> DETAIL RINCIAN BULAN
          INI
        </CardTitle>
        <CardDescription className="text-sm text-gray-500">
          Ringkasan Keuangan
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between text-lg">
          <span className="text-gray-700 font-medium">Omset:</span>
          <span className="font-semibold text-gray-900">
            {formatCurrency(monthlySummary.omset)}
          </span>
        </div>
        <div className="flex justify-between text-lg">
          <span className="text-gray-700 font-medium">Total Pengeluaran:</span>
          <span className="font-semibold text-red-600">
            {formatCurrency(monthlySummary.totalPengeluaran)}
          </span>
        </div>
        <div className="flex justify-between text-lg">
          <span className="text-gray-700 font-medium">HPP:</span>
          <span className="font-semibold text-gray-900">
            {formatCurrency(monthlySummary.hpp)}
          </span>
        </div>
        <Separator className="my-4" />
        <div className="flex justify-between text-xl font-bold">
          <span className="text-gray-800">Laba Bersih:</span>
          <span className="text-green-600">
            {formatCurrency(monthlySummary.labaBersih)}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
