/* eslint-disable @typescript-eslint/no-explicit-any */
import useSWR from "swr";
import useSWRInfinite from "swr/infinite";
import { useSession } from "next-auth/react";
import * as React from "react";
import { assetStockApi } from "@/lib/api/asset-stock";
import type {
  CreateAssetData,
  CreateStockData,
  UpdateAssetData,
  UpdateStockData,
  AdjustmentData,
} from "@/types/asset-stock";

export function useAssets() {
  const { data: session, status } = useSession();
  const token = session?.accessToken;

  const { data, error, mutate } = useSWR(
    status === "authenticated" && token ? "assets" : null,
    async () => {
      try {
        const result = await assetStockApi.getAssets(token);
        return result;
      } catch (error) {
        console.error("Error fetching assets:", error);
        throw error;
      }
    }
  );

  const createAsset = async (data: CreateAssetData) => {
    if (!token) throw new Error("No authentication token");
    const result = await assetStockApi.createAsset(data, token);
    mutate();
    return result;
  };

  const updateAsset = async (id: string, data: UpdateAssetData) => {
    if (!token) throw new Error("No authentication token");
    const result = await assetStockApi.updateAsset(id, data, token);
    mutate();
    return result;
  };

  const deleteAsset = async (id: string) => {
    if (!token) throw new Error("No authentication token");
    await assetStockApi.deleteAsset(id, token);
    mutate();
  };

  return {
    assets: data?.assets || [],
    totalValue: data?.totalValue || 0,
    loading: !data && !error && status === "authenticated",
    error,
    createAsset,
    updateAsset,
    deleteAsset,
    mutate,
  };
}

export function useStocks() {
  const { data: session, status } = useSession();
  const token = session?.accessToken;

  const { data, error, mutate } = useSWR(
    status === "authenticated" && token ? "stocks" : null,
    async () => {
      try {
        const result = await assetStockApi.getStocks(token);
        return result;
      } catch (error) {
        console.error("Error fetching stocks:", error);
        throw error;
      }
    }
  );

  const createStock = async (data: CreateStockData) => {
    if (!token) throw new Error("No authentication token");
    const result = await assetStockApi.createStock(data, token);
    mutate();
    return result;
  };

  const updateStock = async (id: string, data: UpdateStockData) => {
    if (!token) throw new Error("No authentication token");
    const result = await assetStockApi.updateStock(id, data, token);
    mutate();
    return result;
  };

  const deleteStock = async (id: string) => {
    if (!token) throw new Error("No authentication token");
    await assetStockApi.deleteStock(id, token);
    mutate();
  };

  return {
    stocks: data?.stocks || [],
    totalValue: data?.totalValue || 0,
    loading: !data && !error && status === "authenticated",
    error,
    createStock,
    updateStock,
    deleteStock,
    mutate,
  };
}

export function useAdjustment() {
  const { data: session } = useSession();
  const token = session?.accessToken;

  const adjustItem = async (data: AdjustmentData) => {
    if (!token) throw new Error("No authentication token");
    await assetStockApi.adjustItem(data, token);
  };

  return {
    adjustItem,
  };
}

// Infinite scroll version for assets
export function useAssetsInfinite(limit: number = 15) {
  const { data: session, status } = useSession();
  const token = session?.accessToken;
  const isAuthenticated = status === "authenticated";

  // Key generator for infinite loading
  const getKey = (pageIndex: number, previousPageData: any) => {
    // If no token, don't fetch
    if (!isAuthenticated || !token) return null;

    // If reached the end, don't fetch
    if (
      previousPageData &&
      (!previousPageData.assets || previousPageData.assets.length < limit)
    )
      return null;

    // First page, we don't have previousPageData
    if (pageIndex === 0) {
      return ["assets-infinite", { page: 1, limit }, token];
    }

    // Add the cursor to the API endpoint
    return ["assets-infinite", { page: pageIndex + 1, limit }, token];
  };

  const fetcher = async ([, params, tkn]: [
    string,
    { page: number; limit: number },
    string,
  ]) => {
    try {
      const result = await assetStockApi.getAssets(tkn, params);
      return result;
    } catch (error) {
      console.error("Error fetching assets:", error);
      throw error;
    }
  };

  const { data, error, isLoading, isValidating, mutate, size, setSize } =
    useSWRInfinite(getKey, fetcher, {
      revalidateOnFocus: false,
      revalidateFirstPage: false,
      errorRetryCount: 3,
      errorRetryInterval: 1000,
    });

  // Flatten all assets from all pages
  const assets = React.useMemo(() => {
    if (!data) return [];
    return data.flatMap((page) => page?.assets || []);
  }, [data]);

  // Calculate total value
  const totalValue = React.useMemo(() => {
    if (!data) return 0;
    return data.reduce((total, page) => total + (page?.totalValue || 0), 0);
  }, [data]);

  // Check if we can load more
  const hasMore = React.useMemo(() => {
    if (!data || data.length === 0) return true;
    const lastPage = data[data.length - 1];
    return lastPage && lastPage.assets && lastPage.assets.length === limit;
  }, [data, limit]);

  // Load more function
  const loadMore = React.useCallback(() => {
    if (hasMore && !isLoading && !isValidating) {
      setSize(size + 1);
    }
  }, [hasMore, isLoading, isValidating, setSize, size]);

  const createAsset = async (data: CreateAssetData) => {
    if (!token) throw new Error("No authentication token");
    const result = await assetStockApi.createAsset(data, token);
    mutate();
    return result;
  };

  const updateAsset = async (id: string, data: UpdateAssetData) => {
    if (!token) throw new Error("No authentication token");
    const result = await assetStockApi.updateAsset(id, data, token);
    mutate();
    return result;
  };

  const deleteAsset = async (id: string) => {
    if (!token) throw new Error("No authentication token");
    await assetStockApi.deleteAsset(id, token);
    mutate();
  };

  return {
    assets,
    totalValue,
    hasMore,
    loadMore,
    size,
    setSize,
    loading: !data && !error && status === "authenticated",
    isLoadingMore: isValidating && data && data.length > 0,
    error,
    createAsset,
    updateAsset,
    deleteAsset,
    mutate,
  };
}

// Infinite scroll version for stocks
export function useStocksInfinite(limit: number = 15) {
  const { data: session, status } = useSession();
  const token = session?.accessToken;
  const isAuthenticated = status === "authenticated";

  // Key generator for infinite loading
  const getKey = (pageIndex: number, previousPageData: any) => {
    // If no token, don't fetch
    if (!isAuthenticated || !token) return null;

    // If reached the end, don't fetch
    if (
      previousPageData &&
      (!previousPageData.stocks || previousPageData.stocks.length < limit)
    )
      return null;

    // First page, we don't have previousPageData
    if (pageIndex === 0) {
      return ["stocks-infinite", { page: 1, limit }, token];
    }

    // Add the cursor to the API endpoint
    return ["stocks-infinite", { page: pageIndex + 1, limit }, token];
  };

  const fetcher = async ([, params, tkn]: [
    string,
    { page: number; limit: number },
    string,
  ]) => {
    try {
      const result = await assetStockApi.getStocks(tkn, params);
      return result;
    } catch (error) {
      console.error("Error fetching stocks:", error);
      throw error;
    }
  };

  const { data, error, isLoading, isValidating, mutate, size, setSize } =
    useSWRInfinite(getKey, fetcher, {
      revalidateOnFocus: false,
      revalidateFirstPage: false,
      errorRetryCount: 3,
      errorRetryInterval: 1000,
    });

  // Flatten all stocks from all pages
  const stocks = React.useMemo(() => {
    if (!data) return [];
    return data.flatMap((page) => page?.stocks || []);
  }, [data]);

  // Calculate total value
  const totalValue = React.useMemo(() => {
    if (!data) return 0;
    return data.reduce((total, page) => total + (page?.totalValue || 0), 0);
  }, [data]);

  // Check if we can load more
  const hasMore = React.useMemo(() => {
    if (!data || data.length === 0) return true;
    const lastPage = data[data.length - 1];
    return lastPage && lastPage.stocks && lastPage.stocks.length === limit;
  }, [data, limit]);

  // Load more function
  const loadMore = React.useCallback(() => {
    if (hasMore && !isLoading && !isValidating) {
      setSize(size + 1);
    }
  }, [hasMore, isLoading, isValidating, setSize, size]);

  const createStock = async (data: CreateStockData) => {
    if (!token) throw new Error("No authentication token");
    const result = await assetStockApi.createStock(data, token);
    mutate();
    return result;
  };

  const updateStock = async (id: string, data: UpdateStockData) => {
    if (!token) throw new Error("No authentication token");
    const result = await assetStockApi.updateStock(id, data, token);
    mutate();
    return result;
  };

  const deleteStock = async (id: string) => {
    if (!token) throw new Error("No authentication token");
    await assetStockApi.deleteStock(id, token);
    mutate();
  };

  return {
    stocks,
    totalValue,
    hasMore,
    loadMore,
    size,
    setSize,
    loading: !data && !error && status === "authenticated",
    isLoadingMore: isValidating && data && data.length > 0,
    error,
    createStock,
    updateStock,
    deleteStock,
    mutate,
  };
}
