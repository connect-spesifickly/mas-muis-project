export interface Asset {
  id: string;
  name: string;
  description?: string;
  quantity: number;
  purchasePrice: number;
  sellingPrice?: number;
  type: "ASSET";
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Stock {
  id: string;
  name: string;
  description?: string;
  quantity: number;
  purchasePrice: number;
  sellingPrice?: number;
  type: "STOCK";
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface AssetListResponse {
  data: Asset[];
  total: number;
  totalValue: number;
}

export interface StockListResponse {
  data: Stock[];
  total: number;
  totalValue: number;
}

export interface CreateAssetData {
  name: string;
  description?: string;
  quantity: number;
  purchasePrice: number;
}

export interface CreateStockData {
  name: string;
  description?: string;
  quantity: number;
  purchasePrice: number;
}

export interface UpdateAssetData {
  name?: string;
  description?: string;
  quantity?: number;
  purchasePrice?: number;
}

export interface UpdateStockData {
  name?: string;
  description?: string;
  quantity?: number;
  purchasePrice?: number;
}

export interface AdjustmentData {
  itemId: string;
  quantityChange: number;
  reason: string;
  type: "ASSET" | "STOCK";
}
