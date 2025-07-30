import { api } from "@/utils/axios";
import type {
  Transaction,
  CreateTransactionData,
  TransactionFilters,
} from "@/types/transaction";

export const transactionApi = {
  list: async (
    params?: TransactionFilters,
    token?: string
  ): Promise<Transaction[]> => {
    console.log("Transaction API - Listing transactions with params:", params);
    console.log("Transaction API - Token:", token ? "Present" : "Missing");

    try {
      const response = await api.get<Transaction[]>("/transactions", {
        params,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("Transaction API - List response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Transaction API - List error:", error);
      throw error;
    }
  },

  create: async (
    data: CreateTransactionData,
    token?: string
  ): Promise<Transaction> => {
    console.log("Transaction API - Creating transaction with data:", data);
    console.log("Transaction API - Token:", token ? "Present" : "Missing");

    const response = await api.post<{ data: Transaction }>(
      "/transactions",
      data,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    console.log("Transaction API - Response:", response.data);
    return response.data.data;
  },
};
