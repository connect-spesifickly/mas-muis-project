import { api } from "@/utils/axios";
import type {
  CustomerListResponse,
  CustomerResponse,
  CreateCustomerData,
  UpdateCustomerData,
  CustomerFilters,
  MergeCustomerData,
} from "@/types/customer";

export const customerApi = {
  list: async (params: CustomerFilters, token?: string) => {
    const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
    const response = await api.get<CustomerListResponse>("/customers", {
      params,
      headers,
    });

    return response.data;
  },

  create: async (data: CreateCustomerData, token?: string) => {
    const payload = { ...data };
    // normalize createdAt if provided as string (YYYY-MM-DD)
    if (payload.createdAt && typeof payload.createdAt === "string") {
      // Convert YYYY-MM-DD to ISO to avoid timezone shift
      payload.createdAt = new Date(`${payload.createdAt}T00:00:00`);
    }
    const response = await api.post<CustomerResponse>("/customers", payload, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data.data;
  },

  update: async (id: string, data: UpdateCustomerData, token?: string) => {
    const payload = { ...data };
    if (payload.createdAt && typeof payload.createdAt === "string") {
      payload.createdAt = new Date(`${payload.createdAt}T00:00:00`);
    }
    const response = await api.patch<CustomerResponse>(
      `/customers/${id}`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data.data;
  },

  merge: async (data: MergeCustomerData, token?: string) => {
    const response = await api.post("/customers/merge", data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  delete: async (id: string, token?: string) => {
    const response = await api.delete(`/customers/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data; // Typically { message: "Customer deleted" | ApiResponse wrapper }
  },

  downloadReport: async (customerId: string, token?: string) => {
    const response = await api.get(`/customers/${customerId}/download-report`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },
};
