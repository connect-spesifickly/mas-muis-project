"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useFinancialReportData } from "@/hooks/use-report";
import {
  CashPositionCard,
  MonthYearFilter,
  MonthlySummaryCard,
  CompanyValuationCard,
  MonthlyCashChart,
  YearlyValuationChart,
  FinancialReportLoading,
  FinancialReportFooter,
} from "./_components";

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header Section */}
        <div className="mb-8">
          <div className="text-center mb-6">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              LAPORAN KAS & VALUASI
            </h1>
            <p className="text-lg text-gray-600">
              Analisis Keuangan Perusahaan
            </p>
          </div>

          {/* Filter Section */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
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
        </div>

        {/* Main Content - Two Column Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* LEFT COLUMN - LAPORAN KAS & RINGKASAN BULANAN */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                    />
                  </svg>
                  LAPORAN KAS & RINGKASAN BULANAN
                </h2>
              </div>
              <div className="p-6 space-y-6">
                {/* Cash Position */}
                <CashPositionCard cashPosition={cashPosition} />

                {/* Monthly Summary */}
                <MonthlySummaryCard monthlySummary={monthlySummary} />
              </div>
            </div>

            {/* Monthly Cash Chart */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <MonthlyCashChart
                monthlyOmset={monthlyOmset}
                selectedYear={selectedYear}
              />
            </div>
          </div>

          {/* RIGHT COLUMN - VALUASI PERUSAHAAN */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-4">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                    />
                  </svg>
                  VALUASI PERUSAHAAN
                </h2>
                <p className="text-green-100 text-sm mt-1">
                  Data per Tahun {selectedYear}
                </p>
              </div>
              <div className="p-6">
                <CompanyValuationCard companyValuation={companyValuation} />
              </div>
            </div>

            {/* Yearly Valuation Chart */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <YearlyValuationChart yearlyGraphData={yearlyGraphData} />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12">
          <FinancialReportFooter />
        </div>
      </div>
    </div>
  );
}
