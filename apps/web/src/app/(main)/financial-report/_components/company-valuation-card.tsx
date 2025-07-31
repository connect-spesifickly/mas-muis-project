"use client";

import { DollarSign } from "lucide-react";
import { Card, CardContent, } from "@/components/ui/card";
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
    <Card className="border-0 shadow-none bg-transparent">
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
          <span className="text-gray-700 font-medium">Total Kas:</span>
          <span className="font-bold text-gray-900 text-lg">
            {formatCurrency(companyValuation.totalKas)}
          </span>
        </div>
        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
          <span className="text-gray-700 font-medium">Total Nilai Aset:</span>
          <span className="font-bold text-gray-900 text-lg">
            {formatCurrency(companyValuation.totalNilaiAset)}
          </span>
        </div>
        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
          <span className="text-gray-700 font-medium">Total Nilai Stok:</span>
          <span className="font-bold text-gray-900 text-lg">
            {formatCurrency(companyValuation.totalNilaiStok)}
          </span>
        </div>
        <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 p-6 rounded-xl shadow-lg mt-6">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <DollarSign className="h-6 w-6 text-yellow-800" />
              <span className="font-bold text-yellow-800 text-lg">
                TOTAL VALUASI
              </span>
            </div>
            <span className="font-bold text-yellow-900 text-3xl">
              {formatCurrency(companyValuation.totalValuasi)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
