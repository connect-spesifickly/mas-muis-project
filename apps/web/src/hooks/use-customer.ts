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

// Enhanced error interface
interface CustomerError {
  message: string;
  status?: number;
  details?: Record<string, string>;
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

// Helper function untuk extract error message
const extractErrorMessage = (error: unknown): CustomerError => {
  if (!error) return { message: "Unknown error occurred" };

  if (typeof error === "string") {
    return { message: error };
  }

  if (error && typeof error === "object") {
    // Handle axios error
    if (
      "response" in error &&
      error.response &&
      typeof error.response === "object"
    ) {
      const response = error.response as {
        status?: number;
        data?: { message?: string; errors?: Record<string, string> };
      };

      return {
        message: response.data?.message || "API request failed",
        status: response.status,
        details: response.data?.errors,
      };
    }

    // Handle generic error object
    if ("message" in error && typeof error.message === "string") {
      return { message: error.message };
    }
  }

  return { message: "An unexpected error occurred" };
};

const fetchCustomersApi = async (
  params: UseCustomerParams,
  token?: string
): Promise<{
  data: Customer[];
  totalPages: number;
  currentPage: number;
}> => {
  try {
    const response = await customerApi.list(params, token);
    const d = response.data;

    if (!isCustomerListApiResponse(d)) {
      console.warn("Invalid customer list API response format", d);
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
  } catch (error) {
    console.error("Failed to fetch customers:", error);
    throw error;
  }
};

export function useCustomers(params: UseCustomerParams) {
  const { data: session, status } = useSession();
  const [actionLoading, setActionLoading] = React.useState({
    creating: false,
    updating: false,
    merging: false,
    deleting: false,
    downloading: false,
  });

  const isAuthenticated = status === "authenticated";
  const token = session?.accessToken;

  // Debug session status
  React.useEffect(() => {
    console.log("useCustomers - Session status:", status);
    console.log("useCustomers - Token available:", !!token);
    console.log("useCustomers - Params:", params);
  }, [status, token, params]);

  const { data, error, isLoading, isValidating, mutate } = useSWR(
    isAuthenticated && token ? ["customers", params, token] : null,
    ([, keyParams, tkn]) => fetchCustomersApi(keyParams, tkn),
    {
      revalidateOnFocus: false,
      revalidateFirstPage: false,
      errorRetryCount: 3,
      errorRetryInterval: 1000,
      dedupingInterval: 5000, // Prevent duplicate requests within 5 seconds
      onError: (error) => {
        const errorInfo = extractErrorMessage(error);
        console.error("SWR Error in useCustomers:", errorInfo);

        // Don't show toast for authentication errors
        if (errorInfo.status !== 401 && errorInfo.status !== 403) {
          toast.error(`Gagal memuat customer: ${errorInfo.message}`);
        }
      },
    }
  );

  // Memoized data with default values
  const customers = React.useMemo(() => {
    return data?.data || [];
  }, [data]);

  const pagination = React.useMemo(() => {
    return {
      totalPages: data?.totalPages || 0,
      currentPage: data?.currentPage || 1,
      hasNextPage: data ? data.currentPage < data.totalPages : false,
      hasPrevPage: data ? data.currentPage > 1 : false,
    };
  }, [data]);

  // Enhanced error information
  const enhancedError = React.useMemo(() => {
    if (!error) return null;
    return extractErrorMessage(error);
  }, [error]);

  // Loading states
  const loadingStates = React.useMemo(
    () => ({
      initial: status === "loading" || (isLoading && !data),
      fetching: isLoading,
      validating: isValidating,
      creating: actionLoading.creating,
      updating: actionLoading.updating,
      merging: actionLoading.merging,
      deleting: actionLoading.deleting,
      downloading: actionLoading.downloading,
      anyAction: Object.values(actionLoading).some(Boolean),
    }),
    [status, isLoading, data, isValidating, actionLoading]
  );

  const createCustomer = async (dataInput: CreateCustomerData) => {
    if (!token) {
      toast.error("Token tidak tersedia");
      throw new Error("Authentication token not available");
    }

    setActionLoading((prev) => ({ ...prev, creating: true }));

    try {
      console.log("Creating customer:", dataInput);
      const newCustomer = await customerApi.create(dataInput, token);
      toast.success("Customer berhasil dibuat");

      // Revalidate the customers list
      await mutate();

      return newCustomer;
    } catch (error) {
      const errorInfo = extractErrorMessage(error);
      console.error("Failed to create customer:", errorInfo);
      toast.error(`Gagal membuat customer: ${errorInfo.message}`);
      throw error;
    } finally {
      setActionLoading((prev) => ({ ...prev, creating: false }));
    }
  };

  const updateCustomer = async (id: string, dataInput: UpdateCustomerData) => {
    if (!token) {
      toast.error("Token tidak tersedia");
      throw new Error("Authentication token not available");
    }

    setActionLoading((prev) => ({ ...prev, updating: true }));

    try {
      console.log("Updating customer:", id, dataInput);
      const updatedCustomer = await customerApi.update(id, dataInput, token);
      toast.success("Customer berhasil diperbarui");

      // Revalidate the customers list
      await mutate();

      return updatedCustomer;
    } catch (error) {
      const errorInfo = extractErrorMessage(error);
      console.error("Failed to update customer:", errorInfo);
      toast.error(`Gagal memperbarui customer: ${errorInfo.message}`);
      throw error;
    } finally {
      setActionLoading((prev) => ({ ...prev, updating: false }));
    }
  };

  const mergeCustomers = async (dataInput: MergeCustomerData) => {
    if (!token) {
      toast.error("Token tidak tersedia");
      throw new Error("Authentication token not available");
    }

    setActionLoading((prev) => ({ ...prev, merging: true }));

    try {
      console.log("Merging customers:", dataInput);
      await customerApi.merge(dataInput, token);
      toast.success("Customer berhasil digabungkan");

      // Revalidate the customers list
      await mutate();
    } catch (error) {
      const errorInfo = extractErrorMessage(error);
      console.error("Failed to merge customers:", errorInfo);
      toast.error(`Gagal menggabungkan customer: ${errorInfo.message}`);
      throw error;
    } finally {
      setActionLoading((prev) => ({ ...prev, merging: false }));
    }
  };

  const downloadReport = async (customerId: string) => {
    if (!token) {
      toast.error("Token tidak tersedia");
      throw new Error("Authentication token not available");
    }

    setActionLoading((prev) => ({ ...prev, downloading: true }));

    try {
      console.log("Downloading report for customer:", customerId);
      const reportData = await customerApi.downloadReport(customerId, token);
      toast.success("Laporan berhasil diunduh");
      return reportData;
    } catch (error) {
      const errorInfo = extractErrorMessage(error);
      console.error("Failed to download report:", errorInfo);
      toast.error(`Gagal mengunduh laporan: ${errorInfo.message}`);
      throw error;
    } finally {
      setActionLoading((prev) => ({ ...prev, downloading: false }));
    }
  };

  const deleteCustomer = async (id: string) => {
    if (!token) {
      toast.error("Token tidak tersedia");
      throw new Error("Authentication token not available");
    }

    setActionLoading((prev) => ({ ...prev, deleting: true }));

    try {
      await customerApi.delete(id, token);
      toast.success("Customer berhasil dihapus");
      await mutate();
    } catch (error) {
      const errorInfo = extractErrorMessage(error);
      console.error("Failed to delete customer:", errorInfo);
      toast.error(
        `Gagal menghapus customer: ${errorInfo.message}, mungkin data cutomer tertaut ke data lainnya`
      );
      throw error;
    } finally {
      setActionLoading((prev) => ({ ...prev, deleting: false }));
    }
  };

  const refetch = React.useCallback(async () => {
    try {
      await mutate();
    } catch (error) {
      const errorInfo = extractErrorMessage(error);
      console.error("Failed to refetch customers:", errorInfo);
      toast.error(`Gagal memuat ulang data: ${errorInfo.message}`);
    }
  }, [mutate]);

  // Helper functions
  const getCustomerById = React.useCallback(
    (id: string) => {
      return customers.find((customer) => customer.id === id);
    },
    [customers]
  );

  const getCustomersByName = React.useCallback(
    (name: string) => {
      return customers.filter((customer) =>
        customer.name.toLowerCase().includes(name.toLowerCase())
      );
    },
    [customers]
  );

  return {
    // Data
    customers,
    pagination,

    // Loading states
    isLoading: loadingStates.initial,
    isFetching: loadingStates.fetching,
    isValidating: loadingStates.validating,
    loadingStates,

    // Error handling
    error: enhancedError,

    // Actions
    createCustomer,
    updateCustomer,
    mergeCustomers,
    downloadReport,
    deleteCustomer,
    refetch,

    // Helpers
    getCustomerById,
    getCustomersByName,
    mutate,
    // Session info
    isAuthenticated,
    sessionStatus: status,
  };
}
