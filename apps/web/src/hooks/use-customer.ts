"use client";

import type {
  Customer,
  CreateCustomerData,
  UpdateCustomerData,
  MergeCustomerData,
} from "@/types/customer";
import { customerApi } from "@/lib/api/customer";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import useSWR from "swr";
import * as React from "react";

interface UseCustomerParams {
  search?: string;
  page: number;
  limit: number;
}

// Type guard untuk validasi response customer
function isCustomerListApiResponse(
  obj: unknown
): obj is { data: Customer[]; totalPages: number; currentPage: number } {
  if (typeof obj !== "object" || obj === null) return false;
  const o = obj as Record<string, unknown>;
  return (
    Array.isArray(o.data) &&
    typeof o.totalPages === "number" &&
    typeof o.currentPage === "number"
  );
}

const fetchCustomersApi = async (
  params: UseCustomerParams,
  token?: string
): Promise<{
  data: Customer[];
  totalPages: number;
  currentPage: number;
}> => {
  const response = await customerApi.list(params, token);
  const d = response.data;
  if (!isCustomerListApiResponse(d)) {
    return {
      data: [],
      totalPages: 1,
      currentPage: 1,
    };
  }
  return {
    data: d.data,
    totalPages: d.totalPages,
    currentPage: d.currentPage,
  };
};

export function useCustomers(params: UseCustomerParams) {
  const { data: session, status } = useSession();
  const isAuthenticated = status === "authenticated";
  const token = session?.accessToken;

  const { data, error, isLoading, isValidating, mutate } = useSWR(
    isAuthenticated ? ["customers", params, token] : null,
    ([, keyParams, token]) => fetchCustomersApi(keyParams, token),
    {
      revalidateOnFocus: false,
      revalidateFirstPage: false,
    }
  );

  const customers = React.useMemo(() => {
    return data?.data || [];
  }, [data]);

  const pagination = React.useMemo(() => {
    return {
      totalPages: data?.totalPages || 0,
      currentPage: data?.currentPage || 1,
    };
  }, [data]);

  const createCustomer = async (dataInput: CreateCustomerData) => {
    try {
      const newCustomer = await customerApi.create(dataInput, token);
      toast.success("Customer berhasil dibuat");

      // Revalidate the customers list
      mutate();

      return newCustomer;
    } catch (error) {
      console.error("Failed to create customer:", error);
      toast.error("Gagal membuat customer");
      throw error;
    }
  };

  const updateCustomer = async (id: string, dataInput: UpdateCustomerData) => {
    try {
      const updatedCustomer = await customerApi.update(id, dataInput, token);
      toast.success("Customer berhasil diperbarui");

      // Revalidate the customers list
      mutate();

      return updatedCustomer;
    } catch (error) {
      console.error("Failed to update customer:", error);
      toast.error("Gagal memperbarui customer");
      throw error;
    }
  };

  const mergeCustomers = async (dataInput: MergeCustomerData) => {
    try {
      await customerApi.merge(dataInput, token);
      toast.success("Customer berhasil digabungkan");

      // Revalidate the customers list
      mutate();
    } catch (error) {
      console.error("Failed to merge customers:", error);
      toast.error("Gagal menggabungkan customer");
      throw error;
    }
  };

  const downloadReport = async (customerId: string) => {
    try {
      const reportData = await customerApi.downloadReport(customerId, token);
      return reportData;
    } catch (error) {
      console.error("Failed to download report:", error);
      toast.error("Gagal mengunduh laporan");
      throw error;
    }
  };

  return {
    customers,
    pagination,
    isLoading,
    error,
    isValidating,
    createCustomer,
    updateCustomer,
    mergeCustomers,
    downloadReport,
    refetch: () => mutate(),
  };
}
