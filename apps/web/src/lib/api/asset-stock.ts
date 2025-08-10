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
  AdjustmentHistory,
} from "@/types/asset-stock";

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

interface ApiError {
  success: boolean;
  message: string;
  error?: {
    message: string;
  };
}

export const assetStockApi = {
  // Asset APIs
  getAssets: async (token?: string): Promise<AssetListResponse> => {
    try {
      const response = await api.get<ApiResponse<AssetListResponse>>(
        "/asset-stock/assets",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data.data;
    } catch (error) {
      const apiError = error as { response?: { data: ApiError } };
      console.error("API Error - getAssets:", apiError.response?.data || error);
      throw new Error(
        apiError.response?.data?.message || "Failed to fetch assets"
      );
    }
  },

  createAsset: async (
    data: CreateAssetData,
    token?: string
  ): Promise<Asset> => {
    try {
      const response = await api.post<ApiResponse<Asset>>(
        "/asset-stock/assets",
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data.data;
    } catch (error) {
      const apiError = error as { response?: { data: ApiError } };
      console.error(
        "API Error - createAsset:",
        apiError.response?.data || error
      );
      throw new Error(
        apiError.response?.data?.message || "Failed to create asset"
      );
    }
  },

  updateAsset: async (
    id: string,
    data: UpdateAssetData,
    token?: string
  ): Promise<Asset> => {
    try {
      const response = await api.put<ApiResponse<Asset>>(
        `/asset-stock/assets/${id}`,
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data.data;
    } catch (error) {
      const apiError = error as { response?: { data: ApiError } };
      console.error(
        "API Error - updateAsset:",
        apiError.response?.data || error
      );
      throw new Error(
        apiError.response?.data?.message || "Failed to update asset"
      );
    }
  },

  deleteAsset: async (id: string, token?: string): Promise<void> => {
    try {
      await api.delete(`/asset-stock/assets/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (error) {
      const apiError = error as { response?: { data: ApiError } };
      console.error(
        "API Error - deleteAsset:",
        apiError.response?.data || error
      );
      throw new Error(
        apiError.response?.data?.message || "Failed to delete asset"
      );
    }
  },

  // Stock APIs
  getStocks: async (token?: string): Promise<StockListResponse> => {
    try {
      const response = await api.get<ApiResponse<StockListResponse>>(
        "/asset-stock/stocks",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data.data;
    } catch (error) {
      const apiError = error as { response?: { data: ApiError } };
      console.error("API Error - getStocks:", apiError.response?.data || error);
      throw new Error(
        apiError.response?.data?.message || "Failed to fetch stocks"
      );
    }
  },

  createStock: async (
    data: CreateStockData,
    token?: string
  ): Promise<Stock> => {
    try {
      const response = await api.post<ApiResponse<Stock>>(
        "/asset-stock/stocks",
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data.data;
    } catch (error) {
      const apiError = error as { response?: { data: ApiError } };
      console.error(
        "API Error - createStock:",
        apiError.response?.data || error
      );
      throw new Error(
        apiError.response?.data?.message || "Failed to create stock"
      );
    }
  },

  updateStock: async (
    id: string,
    data: UpdateStockData,
    token?: string
  ): Promise<Stock> => {
    try {
      const response = await api.put<ApiResponse<Stock>>(
        `/asset-stock/stocks/${id}`,
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data.data;
    } catch (error) {
      const apiError = error as { response?: { data: ApiError } };
      console.error(
        "API Error - updateStock:",
        apiError.response?.data || error
      );
      throw new Error(
        apiError.response?.data?.message || "Failed to update stock"
      );
    }
  },

  deleteStock: async (id: string, token?: string): Promise<void> => {
    try {
      await api.delete(`/asset-stock/stocks/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (error) {
      const apiError = error as { response?: { data: ApiError } };
      console.error(
        "API Error - deleteStock:",
        apiError.response?.data || error
      );
      throw new Error(
        apiError.response?.data?.message || "Failed to delete stock"
      );
    }
  },

  // Adjustment API
  adjustItem: async (data: AdjustmentData, token?: string): Promise<void> => {
    try {
      await api.post("/asset-stock/adjustments", data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (error) {
      const apiError = error as { response?: { data: ApiError } };
      console.error(
        "API Error - adjustItem:",
        apiError.response?.data || error
      );
      throw new Error(
        apiError.response?.data?.message || "Failed to adjust item"
      );
    }
  },

  // History API
  getAdjustmentHistory: async (
    params?: { type?: string; itemId?: string },
    token?: string
  ): Promise<AdjustmentHistory[]> => {
    try {
      const queryParams = new URLSearchParams();
      if (params?.type) queryParams.append("type", params.type);
      if (params?.itemId) queryParams.append("itemId", params.itemId);

      const response = await api.get<ApiResponse<AdjustmentHistory[]>>(
        `/asset-stock/adjustments/history?${queryParams.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data.data;
    } catch (error) {
      const apiError = error as { response?: { data: ApiError } };
      console.error(
        "API Error - getAdjustmentHistory:",
        apiError.response?.data || error
      );
      throw new Error(
        apiError.response?.data?.message || "Failed to fetch adjustment history"
      );
    }
  },
};
