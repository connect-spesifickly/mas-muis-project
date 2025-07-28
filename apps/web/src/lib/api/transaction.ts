import { api } from "@/utils/axios";
import type {
  TransactionListResponse,
  TransactionResponse,
  CreateTransactionData,
  UpdateTransactionData,
  TransactionFilters,
} from "@/types/transaction";

export const transactionApi = {
  list: async (params?: TransactionFilters, token?: string) => {
    const response = await api.get<TransactionListResponse>("/transactions", {
      params,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  create: async (data: CreateTransactionData, token?: string) => {
    const response = await api.post<TransactionResponse>(
      "/transactions",
      data,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data.data;
  },

  update: async (id: string, data: UpdateTransactionData, token?: string) => {
    const response = await api.patch<TransactionResponse>(
      `/transactions/${id}`,
      data,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data.data;
  },

  delete: async (id: string, token?: string) => {
    const response = await api.delete(`/transactions/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },
};
