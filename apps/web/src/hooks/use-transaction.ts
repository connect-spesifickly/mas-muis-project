"use client";

import type { Transaction, CreateTransactionData } from "@/types/transaction";
import { transactionApi } from "@/lib/api/transaction";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import useSWR from "swr";
import * as React from "react";

interface UseTransactionParams {
  month?: number;
  year?: number;
  sortBy?: string;
  userRole?: string;
}

const fetchTransactionsApi = async (
  params: UseTransactionParams | undefined,
  token?: string
): Promise<Transaction[]> => {
  console.log("fetchTransactionsApi - Params:", params);
  console.log("fetchTransactionsApi - Token:", token ? "Present" : "Missing");

  try {
    const response = await transactionApi.list(params, token);
    console.log("fetchTransactionsApi - Response:", response);

    // Backend returns object with data property, extract the data array
    if (response && typeof response === "object" && "data" in response) {
      const result = Array.isArray(response.data) ? response.data : [];
      console.log("fetchTransactionsApi - Processed result:", result);

      // Debug: check format of each transaction
      if (result.length > 0) {
        console.log("fetchTransactionsApi - First transaction:", result[0]);
        console.log(
          "fetchTransactionsApi - Amount type:",
          typeof result[0].amount
        );
        console.log("fetchTransactionsApi - Amount value:", result[0].amount);
      }

      return result;
    } else if (Array.isArray(response)) {
      // Fallback: if response is already an array
      console.log("fetchTransactionsApi - Processed result (array):", response);
      return response;
    } else {
      console.log("fetchTransactionsApi - Processed result (empty):", []);
      return [];
    }
  } catch (error) {
    console.error("fetchTransactionsApi - Error:", error);
    throw error;
  }
};

export function useTransactions(params?: UseTransactionParams) {
  const { data: session, status } = useSession();
  const isAuthenticated = status === "authenticated";
  const token = session?.accessToken;

  console.log("useTransactions - Session status:", status);
  console.log("useTransactions - Is authenticated:", isAuthenticated);
  console.log("useTransactions - Token available:", !!token);
  console.log(
    "useTransactions - SWR key:",
    isAuthenticated ? ["transactions", params, token] : null
  );

  const { data, error, isLoading, isValidating, mutate } = useSWR(
    isAuthenticated ? ["transactions", params, token] : null,
    ([, params, token]) => {
      console.log(
        "useTransactions - SWR fetcher called with params:",
        params,
        "token:",
        !!token
      );
      return fetchTransactionsApi(params, token);
    },
    {
      revalidateOnFocus: false,
      revalidateFirstPage: false,
    }
  );

  // Force refresh when authentication is ready
  React.useEffect(() => {
    if (isAuthenticated && token) {
      console.log("useTransactions - Force refreshing data");
      mutate();
    }
  }, [isAuthenticated, token, mutate]);

  // Manual fetch to ensure data is loaded
  React.useEffect(() => {
    if (isAuthenticated && token && params) {
      console.log("useTransactions - Manual fetch with params:", params);
      fetchTransactionsApi(params, token)
        .then((result) => {
          console.log("useTransactions - Manual fetch result:", result);
          // Update SWR cache manually
          mutate(result, false);
        })
        .catch((error) => {
          console.error("useTransactions - Manual fetch error:", error);
        });

      // Test fetch without filters to see if there's any data
      console.log("useTransactions - Test fetch without filters");
      fetchTransactionsApi(undefined, token)
        .then((result) => {
          console.log(
            "useTransactions - Test fetch result (no filters):",
            result
          );
        })
        .catch((error) => {
          console.error(
            "useTransactions - Test fetch error (no filters):",
            error
          );
        });
    }
  }, [isAuthenticated, token, params, mutate]);

  const transactions = React.useMemo(() => {
    return data || [];
  }, [data]);

  const createTransaction = async (dataInput: CreateTransactionData) => {
    try {
      console.log("Creating transaction with data:", dataInput);
      const newTransaction = await transactionApi.create(dataInput, token);
      toast.success("Transaksi berhasil dibuat");

      // Revalidate the transactions list
      mutate();

      return newTransaction;
    } catch (error: unknown) {
      console.error("Failed to create transaction:", error);

      // Provide more specific error messages
      let errorMessage = "Gagal membuat transaksi";
      if (error && typeof error === "object" && "response" in error) {
        const axiosError = error as {
          response?: { data?: { error?: { message?: string } } };
        };
        if (axiosError.response?.data?.error?.message) {
          errorMessage = axiosError.response.data.error.message;
        }
      } else if (error && typeof error === "object" && "message" in error) {
        const errorObj = error as { message: string };
        errorMessage = errorObj.message;
      }

      toast.error(errorMessage);
      throw error;
    }
  };

  return {
    transactions,
    isLoading,
    error,
    isValidating,
    createTransaction,
    refetch: () => mutate(),
  };
}
