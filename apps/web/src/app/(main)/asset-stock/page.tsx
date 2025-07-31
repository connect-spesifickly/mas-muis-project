"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Package, HardDrive } from "lucide-react";
import { useAssets, useStocks, useAdjustment } from "@/hooks/use-asset-stock";
import { ItemTable, AdjustmentModal, AddItemModal } from "./_components";
import {
  Asset,
  Stock,
  CreateAssetData,
  CreateStockData,
} from "@/types/asset-stock";
import { toast } from "sonner";

export default function AssetStockPage() {
  const { data: session, status } = useSession();
  const {
    assets,
    totalValue: assetsTotal,
    createAsset,
    loading: assetsLoading,
    error: assetsError,
  } = useAssets();
  const {
    stocks,
    totalValue: stocksTotal,
    createStock,
    loading: stocksLoading,
    error: stocksError,
  } = useStocks();
  const { adjustItem } = useAdjustment();

  // Modal states
  const [adjustmentModal, setAdjustmentModal] = useState({
    isOpen: false,
    item: null as Asset | Stock | null,
    type: null as "ASSET" | "STOCK" | null,
  });

  const [addItemModal, setAddItemModal] = useState({
    isOpen: false,
    type: null as "ASSET" | "STOCK" | null,
  });

  // Check if user is authenticated
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">
            Anda harus login untuk mengakses halaman ini
          </p>
        </div>
      </div>
    );
  }

  // Check if user has OWNER role
  if (session?.role !== "OWNER") {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Akses Ditolak</p>
          <p className="text-sm text-gray-500 mt-2">
            Anda harus memiliki role OWNER untuk mengakses manajemen aset & stok
          </p>
          <p className="text-sm text-gray-500">
            Role Anda saat ini: {session?.role || "Tidak diketahui"}
          </p>
        </div>
      </div>
    );
  }

  const handleAddItem = (type: "ASSET" | "STOCK") => {
    setAddItemModal({ isOpen: true, type });
  };

  const handleCloseAddModal = () => {
    setAddItemModal({ isOpen: false, type: null });
  };

  const handleAddAsset = async (data: CreateAssetData) => {
    try {
      await createAsset(data);
      toast.success("Aset berhasil ditambahkan");
    } catch (error) {
      console.error("Error creating asset:", error);
      toast.error("Gagal menambahkan aset. Silakan coba lagi.");
    }
  };

  const handleAddStock = async (data: CreateStockData) => {
    try {
      await createStock(data);
      toast.success("Stok berhasil ditambahkan");
    } catch (error) {
      console.error("Error creating stock:", error);
      toast.error("Gagal menambahkan stok. Silakan coba lagi.");
    }
  };

  const handleAddItemSubmit = async (
    data: CreateAssetData | CreateStockData
  ) => {
    try {
      if (addItemModal.type === "ASSET") {
        await handleAddAsset(data as CreateAssetData);
      } else if (addItemModal.type === "STOCK") {
        await handleAddStock(data as CreateStockData);
      }
    } catch (error) {
      console.error("Error adding item:", error);
      toast.error("Terjadi kesalahan saat menambahkan item");
    }
  };

  const handleAdjustItem = (item: Asset | Stock) => {
    const type = "quantity" in item ? "ASSET" : "STOCK";
    setAdjustmentModal({ isOpen: true, item, type });
  };

  const handleCloseAdjustmentModal = () => {
    setAdjustmentModal({ isOpen: false, item: null, type: null });
  };

  const handleAdjustment = async (quantityChange: number, reason: string) => {
    if (!adjustmentModal.item || !adjustmentModal.type) return;

    try {
      await adjustItem({
        itemId: adjustmentModal.item.id,
        quantityChange,
        reason,
        type: adjustmentModal.type,
      });
      toast.success("Penyesuaian berhasil disimpan");
    } catch (error) {
      console.error("Error adjusting item:", error);
      toast.error("Gagal menyimpan penyesuaian. Silakan coba lagi.");
    }
  };

  // Show error if API is not available
  if (assetsError || stocksError) {
    return (
      <div className="min-h-screen bg-gray-100 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex h-16 shrink-0 items-center gap-2 md:px-1 px-2">
            <div className="flex items-center justify-between flex-1">
              <h1 className="text-2xl md:text-3xl font-bold md:px-5 font-[stencil]">
                Aset & Stok
              </h1>
            </div>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mt-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  API Endpoint Tidak Tersedia
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>
                    Backend API untuk aset dan stok belum tersedia. Silakan
                    hubungi administrator untuk mengaktifkan fitur ini.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex h-16 shrink-0 items-center gap-2 md:px-1 px-2">
          <div className="flex items-center justify-between flex-1">
            <h1 className="text-2xl md:text-3xl font-bold md:px-5 font-[stencil]">
              Aset & Stok
            </h1>
          </div>
        </div>

        {/* Content */}
        <div className="px-4 pb-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ItemTable
              items={assets}
              title="ASET"
              icon={HardDrive}
              total={assetsTotal}
              type="ASSET"
              loading={assetsLoading}
              onAddItem={() => handleAddItem("ASSET")}
              onAdjustItem={handleAdjustItem}
            />

            <ItemTable
              items={stocks}
              title="STOK"
              icon={Package}
              total={stocksTotal}
              type="STOCK"
              loading={stocksLoading}
              onAddItem={() => handleAddItem("STOCK")}
              onAdjustItem={handleAdjustItem}
            />
          </div>
        </div>
      </div>

      {/* Add Item Modal */}
      <AddItemModal
        isOpen={addItemModal.isOpen}
        type={addItemModal.type}
        onClose={handleCloseAddModal}
        onAdd={handleAddItemSubmit}
      />

      {/* Adjustment Modal */}
      <AdjustmentModal
        isOpen={adjustmentModal.isOpen}
        item={adjustmentModal.item}
        type={adjustmentModal.type}
        onClose={handleCloseAdjustmentModal}
        onAdjust={handleAdjustment}
      />
    </div>
  );
}
