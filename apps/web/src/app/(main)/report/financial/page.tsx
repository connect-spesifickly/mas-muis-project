"use client";

import { useState } from "react";
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
} from "../_components";

export default function FinancialReportPage() {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const {
    monthlySummary,
    cashPosition,
    companyValuation,
    yearlyGraphData,
    monthlyOmset,
    loading,
    error,
  } = useFinancialReportData(selectedMonth, selectedYear);

  if (loading) {
    return <FinancialReportLoading />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Error: {error.message}</p>
        </div>
      </div>
    );
  }

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

        {/* Layout 2 Kolom Utama */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* KOLOM KIRI - LAPORAN KAS & RINGKASAN BULANAN */}
          <div className="space-y-8">
            {/* Posisi Kas */}
            <CashPositionCard cashPosition={cashPosition} />

            {/* Detail Rincian Bulan ini */}
            <MonthlySummaryCard monthlySummary={monthlySummary} />

            {/* Grafik Saldo Kas Bulanan */}
            <MonthlyCashChart
              monthlyOmset={monthlyOmset}
              selectedYear={selectedYear}
            />
          </div>

          {/* KOLOM KANAN - VALUASI PERUSAHAAN */}
          <div className="space-y-8">
            {/* Valuasi Perusahaan */}
            <CompanyValuationCard companyValuation={companyValuation} />

            {/* Grafik Valuasi Tahunan */}
            <YearlyValuationChart yearlyGraphData={yearlyGraphData} />
          </div>
        </div>

        {/* Footer */}
        <FinancialReportFooter />
      </div>
    </div>
  );
}
