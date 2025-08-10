import prisma from "../prisma";
import { ResponseError } from "../helpers/error";
import { ItemType } from "@prisma/client";

class AssetStockService {
  // =================================================================
  // BAGIAN PRIVATE: Logika Inti yang Digunakan Bersama (DRY Principle)
  // =================================================================

  /**
   * Perbaikan #1: Metode Generik untuk Mengambil Item (Menghilangkan Duplikasi)
   * Perbaikan #2: Menggunakan Prisma query biasa untuk menghindari masalah enum di raw query
   */
  private async _getItems(type: ItemType) {
    const whereClause = { type, deletedAt: null };

    // Jalankan query untuk mengambil daftar item
    const items = await prisma.item.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
    });

    // Hitung total nilai dari items
    const totalValue = items.reduce((sum, item) => {
      return sum + Number(item.quantity) * Number(item.purchasePrice);
    }, 0);

    return { items, totalValue };
  }

  /**
   * Perbaikan #1: Metode Generik untuk Membuat Item (Menghilangkan Duplikasi)
   */
  private async _createItem(
    data: {
      name: string;
      description?: string;
      quantity: number;
      purchasePrice: number;
    },
    type: ItemType
  ) {
    try {
      return await prisma.item.create({
        data: { ...data, type },
      });
    } catch (error) {
      if (
        error instanceof Error &&
        error.message.includes("Unique constraint")
      ) {
        const typeName = type === ItemType.ASSET ? "Asset" : "Stock";
        throw new ResponseError(400, `${typeName} dengan nama ini sudah ada`);
      }
      throw error;
    }
  }

  /**
   * Perbaikan #1: Metode Generik untuk Update Item (Menghilangkan Duplikasi)
   */
  private async _updateItem(
    id: string,
    data: {
      name?: string;
      description?: string;
      quantity?: number;
      purchasePrice?: number;
    }
  ) {
    // Validasi eksistensi dan status 'deletedAt' tetap diperlukan sebelum update
    // Ini memastikan kita memberikan pesan error yang benar
    const item = await prisma.item.findUnique({ where: { id } });
    const typeName = item?.type === ItemType.ASSET ? "Asset" : "Stock";

    if (!item) {
      throw new ResponseError(404, `${typeName || "Item"} tidak ditemukan`);
    }
    if (item.deletedAt) {
      throw new ResponseError(400, `${typeName} sudah dihapus`);
    }

    try {
      return await prisma.item.update({
        where: { id },
        data,
      });
    } catch (error) {
      if (
        error instanceof Error &&
        error.message.includes("Unique constraint")
      ) {
        throw new ResponseError(400, `${typeName} dengan nama ini sudah ada`);
      }
      throw error;
    }
  }

  /**
   * Perbaikan #1: Metode Generik untuk Delete Item (Menghilangkan Duplikasi)
   * Perbaikan #3: Hanya 1 query ke DB menggunakan updateMany (Lebih Efisien)
   */
  private async _deleteItem(id: string, type: ItemType) {
    const typeName = type === ItemType.ASSET ? "Asset" : "Stock";

    // Update langsung dengan klausa where yang lebih spesifik
    const result = await prisma.item.updateMany({
      where: { id, type, deletedAt: null }, // Hanya update jika belum dihapus
      data: { deletedAt: new Date() },
    });

    // Jika tidak ada baris yang diupdate, berarti item tidak ditemukan atau sudah dihapus sebelumnya
    if (result.count === 0) {
      throw new ResponseError(
        404,
        `${typeName} tidak ditemukan atau sudah pernah dihapus.`
      );
    }

    return true;
  }

  // =================================================================
  // BAGIAN PUBLIC: Antarmuka yang Digunakan oleh Controller (Tetap Sama)
  // =================================================================

  async getAssets() {
    const { items, totalValue } = await this._getItems(ItemType.ASSET);
    return { assets: items, totalValue };
  }

  async getStocks() {
    const { items, totalValue } = await this._getItems(ItemType.STOCK);
    return { stocks: items, totalValue };
  }

  // Controller Anda mengirimkan `type` di dalam `data`, jadi kita tidak perlu meneruskannya secara eksplisit
  async createAsset(data: {
    name: string;
    description?: string;
    quantity: number;
    purchasePrice: number;
    type: ItemType;
  }) {
    return this._createItem(data, ItemType.ASSET);
  }

  async createStock(data: {
    name: string;
    description?: string;
    quantity: number;
    purchasePrice: number;
    type: ItemType;
  }) {
    return this._createItem(data, ItemType.STOCK);
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
    // Kita tidak perlu meneruskan tipe karena logikanya sudah digabungkan di _updateItem
    return this._updateItem(id, data);
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
    return this._updateItem(id, data);
  }

  async deleteAsset(id: string) {
    return this._deleteItem(id, ItemType.ASSET);
  }

  async deleteStock(id: string) {
    return this._deleteItem(id, ItemType.STOCK);
  }

  /**
   * Perbaikan #4: Menggunakan Transaksi untuk menjamin konsistensi data
   */
  async createAdjustment(data: {
    itemId: string;
    quantityChange: number;
    reason: string;
    recordedById: string;
  }) {
    return prisma.$transaction(async (tx) => {
      const item = await tx.item.findUnique({
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

      // 1. Buat catatan penyesuaian
      await tx.itemAdjustment.create({
        data: {
          quantityChange: data.quantityChange,
          reason: data.reason,
          itemId: data.itemId,
          recordedById: data.recordedById,
        },
      });

      // 2. Update kuantitas item
      const updatedItem = await tx.item.update({
        where: { id: data.itemId },
        data: { quantity: newQuantity },
      });

      // Jika kedua operasi di atas berhasil, transaksi akan di-commit.
      // Jika ada yang gagal, semua akan di-rollback.
      return updatedItem;
    });
  }

  /**
   * Mendapatkan history penyesuaian untuk semua item
   */
  async getAdjustmentHistory(type?: ItemType) {
    const adjustments = await prisma.itemAdjustment.findMany({
      where: {
        item: {
          type: type || undefined,
          deletedAt: null,
        },
      },
      include: {
        item: {
          select: {
            id: true,
            name: true,
            type: true,
            purchasePrice: true,
          },
        },
        recordedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        adjustedAt: "desc",
      },
    });

    return adjustments;
  }

  /**
   * Mendapatkan history penyesuaian untuk item tertentu
   */
  async getItemAdjustmentHistory(itemId: string) {
    const adjustments = await prisma.itemAdjustment.findMany({
      where: {
        itemId,
        item: {
          deletedAt: null,
        },
      },
      include: {
        item: {
          select: {
            id: true,
            name: true,
            type: true,
            purchasePrice: true,
          },
        },
        recordedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        adjustedAt: "desc",
      },
    });

    return adjustments;
  }
}

export default new AssetStockService();
