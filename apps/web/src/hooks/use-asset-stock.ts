import useSWR from "swr";
import { useSession } from "next-auth/react";
import { assetStockApi } from "@/lib/api/asset-stock";
import type {
  Asset,
  Stock,
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
    status === "authenticated" ? "assets" : null,
    async () => {
      console.log("Fetching assets with token:", token);
      const result = await assetStockApi.getAssets(token);
      console.log("Assets API response:", result);
      return result;
    }
  );

  const createAsset = async (data: CreateAssetData) => {
    console.log("Creating asset with data:", data);
    const result = await assetStockApi.createAsset(data, token);
    console.log("Create asset result:", result);
    mutate();
  };

  const updateAsset = async (id: string, data: UpdateAssetData) => {
    await assetStockApi.updateAsset(id, data, token);
    mutate();
  };

  const deleteAsset = async (id: string) => {
    await assetStockApi.deleteAsset(id, token);
    mutate();
  };

  return {
    assets: data?.assets || [],
    totalValue: data?.totalValue || 0,
    loading: !data && !error,
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
    status === "authenticated" ? "stocks" : null,
    async () => {
      console.log("Fetching stocks with token:", token);
      const result = await assetStockApi.getStocks(token);
      console.log("Stocks API response:", result);
      return result;
    }
  );

  const createStock = async (data: CreateStockData) => {
    console.log("Creating stock with data:", data);
    const result = await assetStockApi.createStock(data, token);
    console.log("Create stock result:", result);
    mutate();
  };

  const updateStock = async (id: string, data: UpdateStockData) => {
    await assetStockApi.updateStock(id, data, token);
    mutate();
  };

  const deleteStock = async (id: string) => {
    await assetStockApi.deleteStock(id, token);
    mutate();
  };

  return {
    stocks: data?.stocks || [],
    totalValue: data?.totalValue || 0,
    loading: !data && !error,
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
    await assetStockApi.adjustItem(data, token);
  };

  return {
    adjustItem,
  };
}
