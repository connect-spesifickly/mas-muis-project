"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useFinancialReportData } from "@/hooks/use-report";
import {
  FinancialReportHeader,
  MonthYearFilter,
  CashPositionCard,
  MonthlySummaryCard,
  CompanyValuationCard,
  MonthlyCashChart,
  YearlyValuationChart,
  FinancialReportLoading,
  FinancialReportFooter,
} from "../report/_components";

// Fallback data jika API gagal
const fallbackData = {
  monthlySummary: {
    omset: 0,
    totalPengeluaran: 0,
    hpp: 0,
    labaBersih: 0,
  },
  cashPosition: {
    saldoAwal: 0,
    saldoAkhir: 0,
  },
  companyValuation: {
    totalKas: 0,
    totalNilaiAset: 0,
    totalNilaiStok: 0,
    totalValuasi: 0,
  },
  yearlyGraphData: [],
  monthlyOmset: [],
};

export default function FinancialReportPage() {
  const { data: session, status } = useSession();
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const {
    monthlySummary,
    cashPosition,
    companyValuation,
    yearlyGraphData,
    monthlyOmset,
    error,
  } = useFinancialReportData(selectedMonth, selectedYear);

  // Check if user is authenticated
  if (status === "loading") {
    return <FinancialReportLoading />;
  }

  if (status === "unauthenticated") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">
            Anda harus login untuk mengakses halaman ini
          </p>
        </div>
      </div>
    );
  }

  // Check if user has OWNER role
  if (session?.role !== "OWNER") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Akses Ditolak</p>
          <p className="text-sm text-gray-500 mt-2">
            Anda harus memiliki role OWNER untuk mengakses laporan keuangan
          </p>
          <p className="text-sm text-gray-500">
            Role Anda saat ini: {session?.role || "Tidak diketahui"}
          </p>
        </div>
      </div>
    );
  }

  // Use fallback data if there's an error
  const displayData = error
    ? fallbackData
    : {
        monthlySummary,
        cashPosition,
        companyValuation,
        yearlyGraphData,
        monthlyOmset,
      };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <FinancialReportHeader
          selectedMonth={selectedMonth}
          selectedYear={selectedYear}
        />

        {/* Filter */}
        <div className="mb-8">
          <MonthYearFilter
            selectedMonth={selectedMonth}
            selectedYear={selectedYear}
            onMonthChange={setSelectedMonth}
            onYearChange={setSelectedYear}
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800">
              ⚠️ Data tidak dapat dimuat. Menampilkan data kosong.
            </p>
            <p className="text-sm text-yellow-600 mt-1">
              Error: {error.message}
            </p>
          </div>
        )}

        {/* Layout 2 Kolom Utama */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* KOLOM KIRI - LAPORAN KAS & RINGKASAN BULANAN */}
          <div className="space-y-8">
            {/* Posisi Kas */}
            <CashPositionCard cashPosition={displayData.cashPosition} />

            {/* Detail Rincian Bulan ini */}
            <MonthlySummaryCard monthlySummary={displayData.monthlySummary} />

            {/* Grafik Saldo Kas Bulanan */}
            <MonthlyCashChart
              monthlyOmset={displayData.monthlyOmset}
              selectedYear={selectedYear}
            />
          </div>

          {/* KOLOM KANAN - VALUASI PERUSAHAAN */}
          <div className="space-y-8">
            {/* Valuasi Perusahaan */}
            <CompanyValuationCard
              companyValuation={displayData.companyValuation}
            />

            {/* Grafik Valuasi Tahunan */}
            <YearlyValuationChart
              yearlyGraphData={displayData.yearlyGraphData}
            />
          </div>
        </div>

        {/* Footer */}
        <FinancialReportFooter />
      </div>
    </div>
  );
}
