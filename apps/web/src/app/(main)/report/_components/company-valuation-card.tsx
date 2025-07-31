"use client";

import { DollarSign } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { CompanyValuation } from "@/hooks/use-report";

interface CompanyValuationCardProps {
  companyValuation: CompanyValuation;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
};

export function CompanyValuationCard({
  companyValuation,
}: CompanyValuationCardProps) {
  return (
    <Card className="shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <DollarSign className="h-6 w-6 text-yellow-600" /> VALUASI PERUSAHAAN
        </CardTitle>
        <CardDescription className="text-sm text-gray-500">
          Ringkasan Valuasi
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center text-lg">
          <span className="text-gray-700 font-medium">Total Kas:</span>
          <span className="font-semibold text-gray-900">
            {formatCurrency(companyValuation.totalKas)}
          </span>
        </div>
        <div className="flex justify-between items-center text-lg">
          <span className="text-gray-700 font-medium">Total Nilai Aset:</span>
          <span className="font-semibold text-gray-900">
            {formatCurrency(companyValuation.totalNilaiAset)}
          </span>
        </div>
        <div className="flex justify-between items-center text-lg">
          <span className="text-gray-700 font-medium">Total Nilai Stok:</span>
          <span className="font-semibold text-gray-900">
            {formatCurrency(companyValuation.totalNilaiStok)}
          </span>
        </div>
        <div className="bg-yellow-100 border border-yellow-300 p-5 rounded-xl mt-4 shadow-md">
          <div className="text-center">
            <span className="font-bold text-yellow-800 text-2xl">
              Total Valuasi: {formatCurrency(companyValuation.totalValuasi)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
