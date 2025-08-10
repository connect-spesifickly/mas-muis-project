"use client";

import { useState } from "react";
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
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, BarChart3, RefreshCw, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

// Skeleton Components
const SkeletonCard = ({ children }: { children?: React.ReactNode }) => (
  <Card className="h-full">
    <CardHeader className="pb-3">
      <Skeleton className="h-5 w-32 mb-2" />
      <Skeleton className="h-3 w-48" />
    </CardHeader>
    <CardContent className="pt-0">
      {children || (
        <div className="space-y-3">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      )}
    </CardContent>
  </Card>
);

const SkeletonFilterCard = () => (
  <Card>
    <CardHeader>
      <Skeleton className="h-6 w-28" />
    </CardHeader>
    <CardContent>
      <div className="flex flex-wrap gap-4">
        <div className="flex flex-col space-y-2">
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="flex flex-col space-y-2">
          <Skeleton className="h-4 w-14" />
          <Skeleton className="h-10 w-24" />
        </div>
      </div>
    </CardContent>
  </Card>
);

const SkeletonChartCard = ({ title }: { title: string }) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        {title.includes("Omset") ? (
          <BarChart3 className="w-5 h-5 text-blue-600" />
        ) : (
          <TrendingUp className="w-5 h-5 text-green-600" />
        )}
        <Skeleton className="h-6 w-48" />
      </CardTitle>
      <Skeleton className="h-4 w-64" />
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        <Skeleton className="h-64 w-full rounded" />
        <div className="flex justify-center space-x-4">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-18" />
        </div>
      </div>
    </CardContent>
  </Card>
);

const SkeletonCashPositionCard = () => (
  <div className="space-y-4">
    <div className="grid grid-cols-1 gap-4">
      <div className="p-4 bg-gray-50 rounded-lg">
        <div className="flex justify-between items-center">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-6 w-32" />
        </div>
      </div>
      <div className="p-4 bg-green-50 rounded-lg">
        <div className="flex justify-between items-center">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-6 w-36" />
        </div>
      </div>
    </div>
  </div>
);

const SkeletonMonthlySummaryCard = () => (
  <div className="space-y-3">
    <div className="p-3 bg-blue-50 rounded-lg">
      <div className="flex justify-between items-center">
        <Skeleton className="h-4 w-12" />
        <Skeleton className="h-6 w-28" />
      </div>
    </div>
    <div className="p-3 bg-red-50 rounded-lg">
      <div className="flex justify-between items-center">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-6 w-32" />
      </div>
    </div>
    <div className="p-3 bg-orange-50 rounded-lg">
      <div className="flex justify-between items-center">
        <Skeleton className="h-4 w-8" />
        <Skeleton className="h-6 w-24" />
      </div>
    </div>
    <div className="p-3 bg-green-50 rounded-lg">
      <div className="flex justify-between items-center">
        <Skeleton className="h-4 w-18" />
        <Skeleton className="h-6 w-36" />
      </div>
    </div>
  </div>
);

const SkeletonCompanyValuationCard = () => (
  <div className="space-y-4">
    <div className="grid grid-cols-2 gap-4">
      <div className="p-3 bg-blue-50 rounded-lg">
        <div className="space-y-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-6 w-24" />
        </div>
      </div>
      <div className="p-3 bg-green-50 rounded-lg">
        <div className="space-y-2">
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-6 w-28" />
        </div>
      </div>
      <div className="p-3 bg-yellow-50 rounded-lg">
        <div className="space-y-2">
          <Skeleton className="h-4 w-14" />
          <Skeleton className="h-6 w-20" />
        </div>
      </div>
      <div className="p-3 bg-purple-50 rounded-lg">
        <div className="space-y-2">
          <Skeleton className="h-4 w-18" />
          <Skeleton className="h-6 w-32" />
        </div>
      </div>
    </div>
    <div className="pt-4 border-t">
      <div className="p-4 bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg">
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-40" />
        </div>
      </div>
    </div>
  </div>
);

const LoadingSkeleton = () => (
  <div className="w-full h-full relative">
    {/* Header Skeleton */}
    <div className="sticky top-16 z-40 bg-background border-b">
      <div className="flex h-16 shrink-0 items-center gap-2 md:px-1 px-2">
        <div className="flex items-center justify-between flex-1">
          <Skeleton className="h-8 w-48 md:ml-5" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
        </div>
      </div>
    </div>

    <div className="flex flex-col w-full">
      <div className="flex flex-1 flex-col gap-4 p-2 md:p-6">
        {/* Main Content Skeleton - Two Column Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* LEFT COLUMN */}
          <div className="space-y-6">
            {/* Filter Skeleton */}
            <SkeletonFilterCard />

            {/* Posisi Kas & Detail Rincian Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SkeletonCard>
                <SkeletonCashPositionCard />
              </SkeletonCard>
              <SkeletonCard>
                <SkeletonMonthlySummaryCard />
              </SkeletonCard>
            </div>

            {/* Monthly Chart Skeleton */}
            <SkeletonChartCard title="Grafik Omset Bulanan" />
          </div>

          {/* RIGHT COLUMN */}
          <div className="space-y-6">
            {/* Year Filter Skeleton */}
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-40" />
              </CardHeader>
              <CardContent>
                <div className="flex flex-col space-y-2">
                  <Skeleton className="h-4 w-14" />
                  <Skeleton className="h-10 w-24" />
                </div>
              </CardContent>
            </Card>

            {/* Company Valuation Skeleton */}
            <SkeletonCard>
              <SkeletonCompanyValuationCard />
            </SkeletonCard>

            {/* Yearly Chart Skeleton */}
            <SkeletonChartCard title="Grafik Valuasi Tahunan" />
          </div>
        </div>

        {/* Footer Skeleton */}
        <div className="mt-8 p-6 border-t">
          <div className="text-center space-y-2">
            <Skeleton className="h-4 w-64 mx-auto" />
            <Skeleton className="h-3 w-48 mx-auto" />
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default function FinancialReportPage() {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [valuationYear, setValuationYear] = useState(new Date().getFullYear());

  const {
    monthlySummary,
    cashPosition,
    companyValuation,
    yearlyGraphData,
    monthlyOmset,
    isLoading,
    loadingStates,
    error,
    session,
    sessionStatus,
  } = useFinancialReportData(selectedMonth, selectedYear, valuationYear);

  // Show loading skeleton during session loading or data loading
  if (isLoading) {
    return <LoadingSkeleton />;
  }

  // Check if user is authenticated
  if (sessionStatus === "unauthenticated") {
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
                    {loadingStates.cashPosition ? (
                      <SkeletonCashPositionCard />
                    ) : (
                      <CashPositionCard cashPosition={cashPosition} />
                    )}
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
                    {loadingStates.monthlySummary ? (
                      <SkeletonMonthlySummaryCard />
                    ) : (
                      <MonthlySummaryCard monthlySummary={monthlySummary} />
                    )}
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
                  {loadingStates.monthlyOmset ? (
                    <div className="space-y-4">
                      <Skeleton className="h-64 w-full rounded" />
                      <div className="flex justify-center space-x-4">
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-4 w-18" />
                      </div>
                    </div>
                  ) : (
                    <MonthlyCashChart
                      monthlyOmset={monthlyOmset}
                      selectedYear={selectedYear}
                    />
                  )}
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
                  {loadingStates.companyValuation ? (
                    <SkeletonCompanyValuationCard />
                  ) : (
                    <CompanyValuationCard companyValuation={companyValuation} />
                  )}
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
