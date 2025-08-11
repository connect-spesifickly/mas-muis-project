import useSWR from "swr";
import { useSession } from "next-auth/react";
import { reportApi } from "@/lib/api/report";
import React from "react";

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

// Improved SWR configuration
const swrConfig = {
  errorRetryCount: 2, // Reduce retry count
  errorRetryInterval: 2000, // Increase retry interval
  revalidateOnFocus: false,
  revalidateOnReconnect: true,
  dedupingInterval: 10000, // Increase deduping interval
  shouldRetryOnError: (error: unknown) => {
    // Don't retry on authentication errors
    if (
      error instanceof Error &&
      (error.message.includes("401") || error.message.includes("403"))
    ) {
      return false;
    }
    return true;
  },
  onError: (error: unknown, key: string) => {
    console.error(`SWR Error for ${key}:`, error);
  },
};

// Hook untuk Financial Report dengan loading states - IMPROVED VERSION
export function useFinancialReportData(
  month: number,
  year: number,
  valuationYear?: number
) {
  const { data: session, status } = useSession();
  const token = session?.accessToken;
  const valYear = valuationYear || year;

  // Add a state to track if session is ready
  const [isSessionReady, setIsSessionReady] = React.useState(false);

  // Wait for session to be ready before making API calls
  React.useEffect(() => {
    if (status !== "loading") {
      // Add a small delay to ensure session is fully established
      const timer = setTimeout(() => {
        setIsSessionReady(true);
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [status]);

  // Debug token availability
  React.useEffect(() => {
    if (status === "authenticated") {
      console.log("Report hook - Session ready:", isSessionReady);
      console.log("Report hook - Token available:", !!token);
      console.log("Report hook - Session role:", session?.role);
    }
  }, [session, status, token, isSessionReady]);

  // Create a stable condition for API calls
  const shouldFetchData = React.useMemo(() => {
    return (
      status === "authenticated" &&
      isSessionReady &&
      !!token &&
      session?.role === "OWNER"
    );
  }, [status, isSessionReady, token, session?.role]);

  // Improved SWR calls with better conditions
  const {
    data: monthlySummaryResponse,
    error: monthlySummaryError,
    isLoading: isMonthlySummaryLoading,
  } = useSWR(
    shouldFetchData
      ? `monthly-summary-${month}-${year}-${token?.slice(-8)}`
      : null,
    shouldFetchData
      ? () => reportApi.getMonthlySummary(month, year, token)
      : null,
    {
      ...swrConfig,
      onSuccess: () => {
        console.log("✅ Monthly summary loaded successfully");
      },
    }
  );

  const {
    data: cashPositionResponse,
    error: cashPositionError,
    isLoading: isCashPositionLoading,
  } = useSWR(
    shouldFetchData
      ? `cash-position-${month}-${year}-${token?.slice(-8)}`
      : null,
    shouldFetchData
      ? () => reportApi.getCashPosition(month, year, token)
      : null,
    {
      ...swrConfig,
      onSuccess: () => {
        console.log("✅ Cash position loaded successfully");
      },
    }
  );

  const {
    data: companyValuationResponse,
    error: companyValuationError,
    isLoading: isCompanyValuationLoading,
  } = useSWR(
    shouldFetchData ? `company-valuation-${valYear}-${token?.slice(-8)}` : null,
    shouldFetchData
      ? () => reportApi.getCompanyValuation(valYear, token)
      : null,
    {
      ...swrConfig,
      onSuccess: () => {
        console.log("✅ Company valuation loaded successfully");
      },
    }
  );

  const {
    data: yearlyGraphDataResponse,
    error: yearlyGraphDataError,
    isLoading: isYearlyGraphDataLoading,
  } = useSWR(
    shouldFetchData ? `yearly-graph-data-${token?.slice(-8)}` : null,
    shouldFetchData ? () => reportApi.getYearlyGraphData(token) : null,
    {
      ...swrConfig,
      onSuccess: () => {
        console.log("✅ Yearly graph data loaded successfully");
      },
    }
  );

  const {
    data: monthlyOmsetResponse,
    error: monthlyOmsetError,
    isLoading: isMonthlyOmsetLoading,
  } = useSWR(
    shouldFetchData ? `monthly-omset-${year}-${token?.slice(-8)}` : null,
    shouldFetchData ? () => reportApi.getMonthlyOmset(year, token) : null,
    {
      ...swrConfig,
      onSuccess: () => {
        console.log("✅ Monthly omset loaded successfully");
      },
    }
  );

  // Combine all errors
  const error =
    monthlySummaryError ||
    cashPositionError ||
    companyValuationError ||
    yearlyGraphDataError ||
    monthlyOmsetError;

  // Check if any data is still loading - improved logic
  const isLoading = React.useMemo(() => {
    // If session is still loading, show loading
    if (status === "loading" || !isSessionReady) {
      return true;
    }

    // If not authenticated or not OWNER, don't show loading
    if (status !== "authenticated" || session?.role !== "OWNER") {
      return false;
    }

    // If any individual request is loading, show loading
    return (
      isMonthlySummaryLoading ||
      isCashPositionLoading ||
      isCompanyValuationLoading ||
      isYearlyGraphDataLoading ||
      isMonthlyOmsetLoading
    );
  }, [
    status,
    isSessionReady,
    session?.role,
    isMonthlySummaryLoading,
    isCashPositionLoading,
    isCompanyValuationLoading,
    isYearlyGraphDataLoading,
    isMonthlyOmsetLoading,
  ]);

  // Individual loading states for granular control
  const loadingStates = {
    session: status === "loading" || !isSessionReady,
    monthlySummary: isMonthlySummaryLoading,
    cashPosition: isCashPositionLoading,
    companyValuation: isCompanyValuationLoading,
    yearlyGraphData: isYearlyGraphDataLoading,
    monthlyOmset: isMonthlyOmsetLoading,
  };

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
  const defaultMonthlySummary = React.useMemo<MonthlySummary>(
    () => ({
      omset: 0,
      totalPengeluaran: 0,
      hpp: 0,
      labaBersih: 0,
    }),
    []
  );

  const defaultCashPosition = React.useMemo<CashPosition>(
    () => ({
      saldoAwal: 0,
      saldoAkhir: 0,
    }),
    []
  );

  const defaultCompanyValuation = React.useMemo<CompanyValuation>(
    () => ({
      totalKas: 0,
      totalNilaiAset: 0,
      totalNilaiStok: 0,
      totalValuasi: 0,
    }),
    []
  );

  // Extract data from responses with error handling
  const monthlySummary = React.useMemo(() => {
    return (
      extractData<MonthlySummary>(monthlySummaryResponse) ||
      defaultMonthlySummary
    );
  }, [defaultMonthlySummary, monthlySummaryResponse]);

  const cashPosition = React.useMemo(() => {
    return (
      extractData<CashPosition>(cashPositionResponse) || defaultCashPosition
    );
  }, [cashPositionResponse, defaultCashPosition]);

  const companyValuation = React.useMemo(() => {
    return (
      extractData<CompanyValuation>(companyValuationResponse) ||
      defaultCompanyValuation
    );
  }, [companyValuationResponse, defaultCompanyValuation]);

  const yearlyGraphData = React.useMemo(() => {
    return extractData<YearlyGraphData[]>(yearlyGraphDataResponse) || [];
  }, [yearlyGraphDataResponse]);

  const monthlyOmset = React.useMemo(() => {
    return extractData<MonthlyOmsetData[]>(monthlyOmsetResponse) || [];
  }, [monthlyOmsetResponse]);

  return {
    // Data
    monthlySummary,
    cashPosition,
    companyValuation,
    yearlyGraphData,
    monthlyOmset,

    // Loading states
    isLoading,
    loadingStates,

    // Error handling
    error: enhancedError,

    // Session info
    session,
    sessionStatus: status,

    // Additional debug info
    shouldFetchData,
    isSessionReady,
  };
}
