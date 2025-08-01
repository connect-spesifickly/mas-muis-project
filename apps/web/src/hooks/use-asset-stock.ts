import useSWR from "swr";
import { useSession } from "next-auth/react";
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
