import { api } from "@/utils/axios";

export interface CompletedServiceOption {
  id: number;
  customerName: string;
  customerPhone: string;
  createdAt: string;
  deviceSummary: string;
}

export const serviceApi = {
  // Ambil daftar service COMPLETED yang belum punya transaksi pembayaran
  listCompletedWithoutTransaction: async (
    q?: string,
    token?: string,
    limit: number = 50
  ): Promise<CompletedServiceOption[]> => {
    const response = await api.get<{ data: CompletedServiceOption[] }>(
      "/services/completed-without-transaction",
      {
        params: { q, limit },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data.data;
  },
};
