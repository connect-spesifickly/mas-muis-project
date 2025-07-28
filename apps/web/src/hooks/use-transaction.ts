"use client";

import type {
  Transaction,
  CreateTransactionData,
  UpdateTransactionData,
} from "@/types/transaction";
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
  const response = await transactionApi.list(params, token);
  return Array.isArray(response.data) ? response.data : [];
};

export function useTransactions(params?: UseTransactionParams) {
  const { data: session, status } = useSession();
  const isAuthenticated = status === "authenticated";
  const token = session?.accessToken;

  const { data, error, isLoading, isValidating, mutate } = useSWR(
    isAuthenticated ? ["transactions", params, token] : null,
    ([, keyParams, token]) => fetchTransactionsApi(keyParams, token),
    {
      revalidateOnFocus: false,
      revalidateFirstPage: false,
    }
  );

  const transactions = React.useMemo(() => {
    return data || [];
  }, [data]);

  const createTransaction = async (dataInput: CreateTransactionData) => {
    try {
      const newTransaction = await transactionApi.create(dataInput, token);
      toast.success("Transaksi berhasil dibuat");

      // Revalidate the transactions list
      mutate();

      return newTransaction;
    } catch (error) {
      console.error("Failed to create transaction:", error);
      toast.error("Gagal membuat transaksi");
      throw error;
    }
  };

  const updateTransaction = async (
    id: string,
    dataInput: UpdateTransactionData
  ) => {
    try {
      const updatedTransaction = await transactionApi.update(
        id,
        dataInput,
        token
      );
      toast.success("Transaksi berhasil diperbarui");

      // Revalidate the transactions list
      mutate();

      return updatedTransaction;
    } catch (error) {
      console.error("Failed to update transaction:", error);
      toast.error("Gagal memperbarui transaksi");
      throw error;
    }
  };

  const deleteTransaction = async (id: string) => {
    try {
      await transactionApi.delete(id, token);
      toast.success("Transaksi berhasil dihapus");

      // Revalidate the transactions list
      mutate();
    } catch (error) {
      console.error("Failed to delete transaction:", error);
      toast.error("Gagal menghapus transaksi");
      throw error;
    }
  };

  return {
    transactions,
    isLoading,
    error,
    isValidating,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    refetch: () => mutate(),
  };
}
