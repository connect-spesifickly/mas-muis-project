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
  FinancialReportFooter,
  YearFilter,
} from "./_components";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, BarChart3, RefreshCw, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function FinancialReportPage() {
  const { data: session, status } = useSession();
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [valuationYear, setValuationYear] = useState(new Date().getFullYear());

  const {
    monthlySummary,
    cashPosition,
    companyValuation,
    yearlyGraphData,
    monthlyOmset,
    error,
  } = useFinancialReportData(selectedMonth, selectedYear, valuationYear);

  // Check if user is authenticated
  if (status === "loading") {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="mb-4">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Akses Terbatas
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            Anda harus login untuk mengakses halaman laporan keuangan.
          </p>
        </div>
      </div>
    );
  }

  // Check if user has OWNER role
  if (session?.role !== "OWNER") {
    return (
      <div className="w-full h-full flex items-center justify-center">
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

  // Show error if API is not available
  if (error) {
    return (
      <div className="w-full h-full relative">
        <div className="sticky top-16 z-40 bg-background border-b">
          <div className="flex h-16 shrink-0 items-center gap-2 md:px-1 px-2">
            <div className="flex items-center justify-between flex-1">
              <h1 className="text-2xl md:text-3xl font-bold md:px-5 font-[stencil]">
                Laporan Keuangan
              </h1>
            </div>
          </div>
        </div>

        <div className="flex flex-col w-full">
          <div className="flex flex-1 flex-col gap-4 p-2 md:p-6">
            <div className="border rounded-lg p-6 bg-red-50 border-red-200">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <AlertTriangle className="h-5 w-5 text-red-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    Terjadi Kesalahan
                  </h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>
                      Gagal memuat data laporan keuangan. Silakan coba lagi atau
                      hubungi administrator.
                    </p>
                    <div className="mt-3 flex gap-2">
                      <Button
                        onClick={() => window.location.reload()}
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2"
                      >
                        <RefreshCw className="w-4 h-4" />
                        Coba Lagi
                      </Button>
                      <Button
                        onClick={() => (window.location.href = "/login")}
                        variant="outline"
                        size="sm"
                      >
                        Login Ulang
                      </Button>
                    </div>
                    {process.env.NODE_ENV === "development" && (
                      <details className="mt-4">
                        <summary className="cursor-pointer text-xs font-medium">
                          Debug Info
                        </summary>
                        <div className="mt-2 text-xs bg-gray-100 p-3 rounded space-y-2">
                          <div>
                            <strong>Error Message:</strong> {error.message}
                          </div>
                          {error.details && (
                            <div>
                              <strong>Error Details:</strong>
                              <pre className="mt-1 bg-white p-2 rounded text-xs overflow-auto">
                                {JSON.stringify(error.details, null, 2)}
                              </pre>
                            </div>
                          )}
                          <div>
                            <strong>Session Info:</strong>
                            <div>Role: {session?.role}</div>
                            <div>
                              Token Available:{" "}
                              {session?.accessToken ? "Yes" : "No"}
                            </div>
                          </div>
                        </div>
                      </details>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative">
      <div className="sticky top-16 z-40 bg-background border-b">
        <div className="flex h-16 shrink-0 items-center gap-2 md:px-1 px-2">
          <div className="flex items-center justify-between flex-1">
            <h1 className="text-2xl md:text-3xl font-bold md:px-5 font-[stencil]">
              Laporan Keuangan
            </h1>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-sm">
                {selectedMonth}/{selectedYear}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col w-full">
        <div className="flex flex-1 flex-col gap-4 p-2 md:p-6">
          {/* Debug Info in Development */}
          {process.env.NODE_ENV === "development" && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="text-sm font-medium text-yellow-800 mb-2">
                Debug Info
              </h3>
              <div className="text-xs text-yellow-700 space-y-1">
                <p>Status: {status}</p>
                <p>Role: {session?.role || "Not set"}</p>
                <p>
                  Token: {session?.accessToken ? "Available" : "Not available"}
                </p>
                <p>Selected Month: {selectedMonth}</p>
                <p>Selected Year: {selectedYear}</p>
                <p>Valuation Year: {valuationYear}</p>
              </div>
            </div>
          )}

          {/* Main Content - Two Column Layout */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* LEFT COLUMN - POSISI KAS & RINCIAN BULANAN */}
            <div className="space-y-6">
              {/* Month Year Filter untuk Posisi Kas & Rincian Bulanan */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Filter Periode</CardTitle>
                </CardHeader>
                <CardContent>
                  <MonthYearFilter
                    selectedMonth={selectedMonth}
                    selectedYear={selectedYear}
                    onMonthChange={setSelectedMonth}
                    onYearChange={setSelectedYear}
                  />
                </CardContent>
              </Card>

              {/* Posisi Kas & Detail Rincian - Side by Side with Equal Height */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Posisi Kas */}
                <Card className="h-full">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Posisi Kas</CardTitle>
                    <p className="text-xs text-muted-foreground">Saldo Kas</p>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <CashPositionCard cashPosition={cashPosition} />
                  </CardContent>
                </Card>

                {/* Detail Rincian Bulanan */}
                <Card className="h-full">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">
                      Detail Rincian Bulanan
                    </CardTitle>
                    <p className="text-xs text-muted-foreground">
                      Omset, Pengeluaran, HPP, dan Laba Bersih
                    </p>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <MonthlySummaryCard monthlySummary={monthlySummary} />
                  </CardContent>
                </Card>
              </div>

              {/* Monthly Cash Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-blue-600" />
                    Grafik Omset Bulanan
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Tren omset per bulan tahun {selectedYear}
                  </p>
                </CardHeader>
                <CardContent>
                  <MonthlyCashChart
                    monthlyOmset={monthlyOmset}
                    selectedYear={selectedYear}
                  />
                </CardContent>
              </Card>
            </div>

            {/* RIGHT COLUMN - VALUASI PERUSAHAAN */}
            <div className="space-y-6">
              {/* Year Filter untuk Valuasi Perusahaan */}
              <YearFilter
                selectedYear={valuationYear}
                onYearChange={setValuationYear}
                title="Filter Tahun Valuasi"
              />

              {/* Company Valuation */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Valuasi Perusahaan</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Total Kas, Aset, Stok, dan Valuasi per Tahun {valuationYear}
                  </p>
                </CardHeader>
                <CardContent>
                  <CompanyValuationCard companyValuation={companyValuation} />
                </CardContent>
              </Card>

              {/* Yearly Valuation Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                    Grafik Valuasi Tahunan
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Tren valuasi perusahaan dari tahun ke tahun
                  </p>
                </CardHeader>
                <CardContent>
                  <YearlyValuationChart yearlyGraphData={yearlyGraphData} />
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Footer */}
          <FinancialReportFooter />
        </div>
      </div>
    </div>
  );
}
