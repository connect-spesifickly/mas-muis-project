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
    () => assetStockApi.getAssets(token)
  );

  const createAsset = async (data: CreateAssetData) => {
    await assetStockApi.createAsset(data, token);
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
    assets: data?.data || [],
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
    () => assetStockApi.getStocks(token)
  );

  const createStock = async (data: CreateStockData) => {
    await assetStockApi.createStock(data, token);
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
    stocks: data?.data || [],
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
