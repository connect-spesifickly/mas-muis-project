import prisma from "../prisma";
import { ResponseError } from "../helpers/error";
import { ItemType } from "@prisma/client";

class AssetStockService {
  async getAssets() {
    const assets = await prisma.item.findMany({
      where: {
        type: ItemType.ASSET,
        deletedAt: null,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const totalValue = assets.reduce(
      (sum, asset) =>
        sum + Number(asset.quantity) * Number(asset.purchasePrice),
      0
    );

    return {
      assets,
      totalValue,
    };
  }

  async getStocks() {
    const stocks = await prisma.item.findMany({
      where: {
        type: ItemType.STOCK,
        deletedAt: null,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const totalValue = stocks.reduce(
      (sum, stock) =>
        sum + Number(stock.quantity) * Number(stock.purchasePrice),
      0
    );

    return {
      stocks,
      totalValue,
    };
  }

  async createAsset(data: {
    name: string;
    description?: string;
    quantity: number;
    purchasePrice: number;
    type: ItemType;
  }) {
    try {
      const asset = await prisma.item.create({
        data: {
          name: data.name,
          description: data.description,
          quantity: data.quantity,
          purchasePrice: data.purchasePrice,
          type: data.type,
        },
      });
      return asset;
    } catch (error) {
      if (
        error instanceof Error &&
        error.message.includes("Unique constraint")
      ) {
        throw new ResponseError(400, "Asset dengan nama ini sudah ada");
      }
      throw error;
    }
  }

  async createStock(data: {
    name: string;
    description?: string;
    quantity: number;
    purchasePrice: number;
    type: ItemType;
  }) {
    try {
      const stock = await prisma.item.create({
        data: {
          name: data.name,
          description: data.description,
          quantity: data.quantity,
          purchasePrice: data.purchasePrice,
          type: data.type,
        },
      });
      return stock;
    } catch (error) {
      if (
        error instanceof Error &&
        error.message.includes("Unique constraint")
      ) {
        throw new ResponseError(400, "Stock dengan nama ini sudah ada");
      }
      throw error;
    }
  }

  async updateAsset(
    id: string,
    data: {
      name?: string;
      description?: string;
      quantity?: number;
      purchasePrice?: number;
    }
  ) {
    const asset = await prisma.item.findUnique({
      where: { id, type: ItemType.ASSET },
    });

    if (!asset) {
      throw new ResponseError(404, "Asset tidak ditemukan");
    }

    if (asset.deletedAt) {
      throw new ResponseError(400, "Asset sudah dihapus");
    }

    try {
      const updatedAsset = await prisma.item.update({
        where: { id },
        data,
      });
      return updatedAsset;
    } catch (error) {
      if (
        error instanceof Error &&
        error.message.includes("Unique constraint")
      ) {
        throw new ResponseError(400, "Asset dengan nama ini sudah ada");
      }
      throw error;
    }
  }

  async updateStock(
    id: string,
    data: {
      name?: string;
      description?: string;
      quantity?: number;
      purchasePrice?: number;
    }
  ) {
    const stock = await prisma.item.findUnique({
      where: { id, type: ItemType.STOCK },
    });

    if (!stock) {
      throw new ResponseError(404, "Stock tidak ditemukan");
    }

    if (stock.deletedAt) {
      throw new ResponseError(400, "Stock sudah dihapus");
    }

    try {
      const updatedStock = await prisma.item.update({
        where: { id },
        data,
      });
      return updatedStock;
    } catch (error) {
      if (
        error instanceof Error &&
        error.message.includes("Unique constraint")
      ) {
        throw new ResponseError(400, "Stock dengan nama ini sudah ada");
      }
      throw error;
    }
  }

  async deleteAsset(id: string) {
    const asset = await prisma.item.findUnique({
      where: { id, type: ItemType.ASSET },
    });

    if (!asset) {
      throw new ResponseError(404, "Asset tidak ditemukan");
    }

    if (asset.deletedAt) {
      throw new ResponseError(400, "Asset sudah dihapus");
    }

    await prisma.item.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return true;
  }

  async deleteStock(id: string) {
    const stock = await prisma.item.findUnique({
      where: { id, type: ItemType.STOCK },
    });

    if (!stock) {
      throw new ResponseError(404, "Stock tidak ditemukan");
    }

    if (stock.deletedAt) {
      throw new ResponseError(400, "Stock sudah dihapus");
    }

    await prisma.item.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return true;
  }

  async createAdjustment(data: {
    itemId: string;
    quantityChange: number;
    reason: string;
    recordedById: string;
  }) {
    const item = await prisma.item.findUnique({
      where: { id: data.itemId },
    });

    if (!item) {
      throw new ResponseError(404, "Item tidak ditemukan");
    }

    if (item.deletedAt) {
      throw new ResponseError(400, "Item sudah dihapus");
    }

    const newQuantity = item.quantity + data.quantityChange;

    if (newQuantity < 0) {
      throw new ResponseError(400, "Kuantitas tidak boleh kurang dari 0");
    }

    // Create adjustment record
    await prisma.itemAdjustment.create({
      data: {
        quantityChange: data.quantityChange,
        reason: data.reason,
        itemId: data.itemId,
        recordedById: data.recordedById,
      },
    });

    // Update item quantity
    const updatedItem = await prisma.item.update({
      where: { id: data.itemId },
      data: { quantity: newQuantity },
    });

    return updatedItem;
  }
}

export default new AssetStockService();
