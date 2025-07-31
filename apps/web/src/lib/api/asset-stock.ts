import { api } from "@/utils/axios";
import type {
  Asset,
  Stock,
  AssetListResponse,
  StockListResponse,
  CreateAssetData,
  CreateStockData,
  UpdateAssetData,
  UpdateStockData,
  AdjustmentData,
} from "@/types/asset-stock";

export const assetStockApi = {
  // Asset APIs
  getAssets: async (token?: string): Promise<AssetListResponse> => {
    const response = await api.get("/asset-stock/assets", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data as AssetListResponse;
  },

  createAsset: async (
    data: CreateAssetData,
    token?: string
  ): Promise<Asset> => {
    const response = await api.post("/asset-stock/assets", data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data.data as Asset;
  },

  updateAsset: async (
    id: string,
    data: UpdateAssetData,
    token?: string
  ): Promise<Asset> => {
    const response = await api.put(`/asset-stock/assets/${id}`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data.data as Asset;
  },

  deleteAsset: async (id: string, token?: string): Promise<void> => {
    await api.delete(`/asset-stock/assets/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  // Stock APIs
  getStocks: async (token?: string): Promise<StockListResponse> => {
    const response = await api.get("/asset-stock/stocks", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data as StockListResponse;
  },

  createStock: async (
    data: CreateStockData,
    token?: string
  ): Promise<Stock> => {
    const response = await api.post("/asset-stock/stocks", data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data.data as Stock;
  },

  updateStock: async (
    id: string,
    data: UpdateStockData,
    token?: string
  ): Promise<Stock> => {
    const response = await api.put(`/asset-stock/stocks/${id}`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data.data as Stock;
  },

  deleteStock: async (id: string, token?: string): Promise<void> => {
    await api.delete(`/asset-stock/stocks/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  // Adjustment API
  adjustItem: async (data: AdjustmentData, token?: string): Promise<void> => {
    await api.post("/asset-stock/adjustments", data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },
};
