"use client";

import { Scale } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface FinancialReportHeaderProps {
  selectedMonth: number;
  selectedYear: number;
}

const months = [
  { value: 1, label: "Januari" },
  { value: 2, label: "Februari" },
  { value: 3, label: "Maret" },
  { value: 4, label: "April" },
  { value: 5, label: "Mei" },
  { value: 6, label: "Juni" },
  { value: 7, label: "Juli" },
  { value: 8, label: "Agustus" },
  { value: 9, label: "September" },
  { value: 10, label: "Oktober" },
  { value: 11, label: "November" },
  { value: 12, label: "Desember" },
];

export function FinancialReportHeader({
  selectedMonth,
  selectedYear,
}: FinancialReportHeaderProps) {
  return (
    <div className="mb-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900 mb-2">
            LAPORAN KAS & VALUASI
          </h1>
          <p className="text-lg text-gray-600 mb-4">
            Analisis Keuangan Perusahaan Anda
          </p>
        </div>
        <div className="text-right mt-6 md:mt-0">
          <h2 className="text-3xl font-bold text-gray-900 flex items-center justify-end gap-2">
            <Scale className="h-7 w-7 text-gray-700" /> VALUASI PERUSAHAAN
          </h2>
          <p className="text-lg text-gray-700 mt-2">
            Data per Tahun yang Dipilih
          </p>
        </div>
      </div>
      <Separator className="my-6" />
    </div>
  );
}
