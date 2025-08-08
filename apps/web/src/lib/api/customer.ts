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
    const response = await api.get<CustomerListResponse>("/customers", {
      params,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  },

  create: async (data: CreateCustomerData, token?: string) => {
    const response = await api.post<CustomerResponse>("/customers", data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data.data;
  },

  update: async (id: string, data: UpdateCustomerData, token?: string) => {
    const response = await api.patch<CustomerResponse>(
      `/customers/${id}`,
      data,
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

  downloadReport: async (customerId: string, token?: string) => {
    const response = await api.get(`/customers/${customerId}/download-report`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },
};
