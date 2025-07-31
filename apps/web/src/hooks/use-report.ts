import { reportApi } from "@/lib/api/report";
import { stockAdjustmentApi } from "@/lib/api/stock-adjustment";
import { useSession } from "next-auth/react";
import useSWR from "swr";
import type { StockAdjustment } from "@/types/stock-adjustment";

export interface DailyTransaction {
  date: string;
  revenue: number;
  profit: number;
  loss: number;
  transactionCount: number;
}

export interface MonthlySummary {
  omset: number;
  totalPengeluaran: number;
  hpp: number;
  labaBersih: number;
}

export interface CashPosition {
  saldoAwal: number;
  saldoAkhir: number;
}

export interface CompanyValuation {
  totalKas: number;
  totalNilaiAset: number;
  totalNilaiStok: number;
  totalValuasi: number;
}

export interface YearlyGraphData {
  year: number;
  totalValuasi: number;
}

export interface MonthlyOmsetData {
  month: number;
  omset: number;
}

const fetchReportApi = async (
  dateFrom: string,
  dateTo: string,
  token?: string
) => {
  const [salesReport, profitReport, lossesReport, dailyTransactionsRes] =
    await Promise.all([
      reportApi.getSalesReport(dateFrom, dateTo, token) as Promise<{
        data: { totalOmzet: number; jumlahTransaksi: number };
      }>,
      reportApi.getProfitReport(dateFrom, dateTo, token) as Promise<{
        data: { totalProfit: number };
      }>,
      reportApi.getLossesReport(dateFrom, dateTo, token) as Promise<{
        data: { totalLossValue: number };
      }>,
      reportApi.getDailyTransactions(dateFrom, dateTo, token) as Promise<{
        data: DailyTransaction[];
      }>,
    ]);
  let stockAdjustments: StockAdjustment[] = [];
  try {
    const { adjustments } = await stockAdjustmentApi.getAll(
      {
        startDate: dateFrom,
        endDate: dateTo,
        take: 100,
      },
      token
    );
    stockAdjustments = adjustments;
  } catch {
    stockAdjustments = [];
  }
  return {
    reportData: {
      totalOmzet: salesReport.data.totalOmzet || 0,
      jumlahTransaksi: salesReport.data.jumlahTransaksi || 0,
      totalProfit: profitReport.data.totalProfit || 0,
      totalLossValue: lossesReport.data.totalLossValue || 0,
    },
    stockAdjustments,
    dailyTransactions: dailyTransactionsRes.data || [],
  };
};

const fetchFinancialReportApi = async (
  month: number,
  year: number,
  token?: string
) => {
  try {
    console.log("Fetching financial report data:", { month, year, token: !!token });
    
    const [
      monthlySummaryRes,
      cashPositionRes,
      companyValuationRes,
      yearlyGraphDataRes,
      monthlyOmsetRes,
    ] = await Promise.all([
      reportApi.getMonthlySummary(month, year, token) as Promise<{
        data: MonthlySummary;
      }>,
      reportApi.getCashPosition(month, year, token) as Promise<{
        data: CashPosition;
      }>,
      reportApi.getCompanyValuation(year, token) as Promise<{
        data: CompanyValuation;
      }>,
      reportApi.getYearlyGraphData(token) as Promise<{
        data: YearlyGraphData[];
      }>,
      reportApi.getMonthlyOmset(year, token) as Promise<{
        data: MonthlyOmsetData[];
      }>,
    ]);

    console.log("Financial report data fetched successfully:", {
      monthlySummary: monthlySummaryRes.data,
      cashPosition: cashPositionRes.data,
      companyValuation: companyValuationRes.data,
      yearlyGraphData: yearlyGraphDataRes.data,
      monthlyOmset: monthlyOmsetRes.data,
    });

    return {
      monthlySummary: monthlySummaryRes.data,
      cashPosition: cashPositionRes.data,
      companyValuation: companyValuationRes.data,
      yearlyGraphData: yearlyGraphDataRes.data,
      monthlyOmset: monthlyOmsetRes.data,
    };
  } catch (error) {
    console.error("Error fetching financial report data:", error);
    throw error;
  }
};

export function useReportData(dateFrom: string, dateTo: string) {
  const { data: session, status } = useSession();
  const token = session?.accessToken;
  const swrKey =
    status === "authenticated" ? ["report", dateFrom, dateTo, token] : null;
  const { data, error, isLoading, mutate } = useSWR(
    swrKey,
    () => fetchReportApi(dateFrom, dateTo, token),
    { revalidateOnFocus: false }
  );
  return {
    reportData: data?.reportData || {
      totalOmzet: 0,
      totalProfit: 0,
      totalLossValue: 0,
      jumlahTransaksi: 0,
    },
    stockAdjustments: data?.stockAdjustments || [],
    loading: isLoading,
    refreshing: isLoading,
    fetchReports: mutate,
    dailyTransactions: data?.dailyTransactions || [],
    error,
  };
}

export function useFinancialReportData(month: number, year: number) {
  const { data: session, status } = useSession();
  const token = session?.accessToken;
  const swrKey =
    status === "authenticated"
      ? ["financial-report", month, year, token]
      : null;
  const { data, error, isLoading, mutate } = useSWR(
    swrKey,
    () => fetchFinancialReportApi(month, year, token),
    { revalidateOnFocus: false }
  );

  return {
    monthlySummary: data?.monthlySummary || {
      omset: 0,
      totalPengeluaran: 0,
      hpp: 0,
      labaBersih: 0,
    },
    cashPosition: data?.cashPosition || {
      saldoAwal: 0,
      saldoAkhir: 0,
    },
    companyValuation: data?.companyValuation || {
      totalKas: 0,
      totalNilaiAset: 0,
      totalNilaiStok: 0,
      totalValuasi: 0,
    },
    yearlyGraphData: data?.yearlyGraphData || [],
    monthlyOmset: data?.monthlyOmset || [],
    loading: isLoading,
    error,
    refetch: mutate,
  };
}
