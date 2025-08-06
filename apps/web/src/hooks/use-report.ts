import useSWR from "swr";
import { useSession } from "next-auth/react";
import { reportApi } from "@/lib/api/report";
import React from "react"; // Added missing import

// Types untuk Financial Report
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

// Helper function to extract data from API response
const extractData = <T>(response: unknown): T => {
  if (
    response &&
    typeof response === "object" &&
    response !== null &&
    "data" in response
  ) {
    return (response as { data: T }).data;
  }
  return response as T;
};

// Helper function to extract error message
const extractErrorMessage = (error: unknown): string | null => {
  if (!error) return null;

  if (typeof error === "string") {
    return error;
  }

  if (error && typeof error === "object") {
    // Handle SWR error object
    if ("message" in error && typeof error.message === "string") {
      return error.message;
    }

    // Handle axios error
    if (
      "response" in error &&
      error.response &&
      typeof error.response === "object"
    ) {
      const response = error.response as { data?: { message?: string } };
      if (
        response.data &&
        typeof response.data === "object" &&
        "message" in response.data &&
        response.data.message
      ) {
        return response.data.message;
      }
    }

    // Fallback
    return "An error occurred while fetching data";
  }

  return "An unknown error occurred";
};

// SWR configuration with retry
const swrConfig = {
  errorRetryCount: 3,
  errorRetryInterval: 1000,
  revalidateOnFocus: false,
  revalidateOnReconnect: true,
  dedupingInterval: 5000, // Prevent duplicate requests within 5 seconds
};

// Hook untuk Financial Report
export function useFinancialReportData(
  month: number,
  year: number,
  valuationYear?: number
) {
  const { data: session, status } = useSession();
  const token = session?.accessToken;
  const valYear = valuationYear || year; // Use valuationYear if provided, otherwise use year

  // Debug token availability
  React.useEffect(() => {
    if (status === "authenticated") {
      console.log("Report hook - Token available:", !!token);
      console.log("Report hook - Session role:", session?.role);
    }
  }, [session, status, token]);

  const { data: monthlySummaryResponse, error: monthlySummaryError } = useSWR(
    status === "authenticated" ? `monthly-summary-${month}-${year}` : null,
    status === "authenticated"
      ? () => reportApi.getMonthlySummary(month, year, token)
      : null,
    swrConfig
  );

  const { data: cashPositionResponse, error: cashPositionError } = useSWR(
    status === "authenticated" ? `cash-position-${month}-${year}` : null,
    status === "authenticated"
      ? () => reportApi.getCashPosition(month, year, token)
      : null,
    swrConfig
  );

  const { data: companyValuationResponse, error: companyValuationError } =
    useSWR(
      status === "authenticated" ? `company-valuation-${valYear}` : null,
      status === "authenticated"
        ? () => reportApi.getCompanyValuation(valYear, token)
        : null,
      swrConfig
    );

  const { data: yearlyGraphDataResponse, error: yearlyGraphDataError } = useSWR(
    status === "authenticated" ? `yearly-graph-data-${valYear}` : null,
    status === "authenticated"
      ? () => reportApi.getYearlyGraphData(token)
      : null,
    swrConfig
  );

  const { data: monthlyOmsetResponse, error: monthlyOmsetError } = useSWR(
    status === "authenticated" ? `monthly-omset-${year}` : null,
    status === "authenticated"
      ? () => reportApi.getMonthlyOmset(year, token)
      : null,
    swrConfig
  );

  // Combine all errors and provide better error messages
  const error =
    monthlySummaryError ||
    cashPositionError ||
    companyValuationError ||
    yearlyGraphDataError ||
    monthlyOmsetError;

  // Enhanced error object with better context
  const enhancedError = error
    ? {
        ...error,
        message: extractErrorMessage(error),
        details: {
          monthlySummary: monthlySummaryError
            ? extractErrorMessage(monthlySummaryError)
            : null,
          cashPosition: cashPositionError
            ? extractErrorMessage(cashPositionError)
            : null,
          companyValuation: companyValuationError
            ? extractErrorMessage(companyValuationError)
            : null,
          yearlyGraphData: yearlyGraphDataError
            ? extractErrorMessage(yearlyGraphDataError)
            : null,
          monthlyOmset: monthlyOmsetError
            ? extractErrorMessage(monthlyOmsetError)
            : null,
        },
      }
    : null;

  // Default values
  const defaultMonthlySummary: MonthlySummary = {
    omset: 0,
    totalPengeluaran: 0,
    hpp: 0,
    labaBersih: 0,
  };

  const defaultCashPosition: CashPosition = {
    saldoAwal: 0,
    saldoAkhir: 0,
  };

  const defaultCompanyValuation: CompanyValuation = {
    totalKas: 0,
    totalNilaiAset: 0,
    totalNilaiStok: 0,
    totalValuasi: 0,
  };

  // Extract data from responses with error handling
  const monthlySummary =
    extractData<MonthlySummary>(monthlySummaryResponse) ||
    defaultMonthlySummary;
  const cashPosition =
    extractData<CashPosition>(cashPositionResponse) || defaultCashPosition;
  const companyValuation =
    extractData<CompanyValuation>(companyValuationResponse) ||
    defaultCompanyValuation;
  const yearlyGraphData =
    extractData<YearlyGraphData[]>(yearlyGraphDataResponse) || [];
  const monthlyOmset =
    extractData<MonthlyOmsetData[]>(monthlyOmsetResponse) || [];

  return {
    monthlySummary,
    cashPosition,
    companyValuation,
    yearlyGraphData,
    monthlyOmset,
    error: enhancedError,
  };
}
