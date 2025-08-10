"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Package, HardDrive, Plus, Search } from "lucide-react";
import { useAssets, useStocks, useAdjustment } from "@/hooks/use-asset-stock";
import { ItemTable, AdjustmentModal, AddItemModal } from "./_components";
import {
  Asset,
  Stock,
  CreateAssetData,
  CreateStockData,
} from "@/types/asset-stock";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import React from "react";

export default function AssetStockPage() {
  const { data: session, status } = useSession();
  const [assetSearchTerm, setAssetSearchTerm] = useState("");
  const [stockSearchTerm, setStockSearchTerm] = useState("");

  const {
    assets,
    totalValue: assetsTotal,
    createAsset,
    deleteAsset,
    loading: assetsLoading,
    error: assetsError,
    mutate: mutateAssets,
  } = useAssets();

  const {
    stocks,
    totalValue: stocksTotal,
    createStock,
    deleteStock,
    loading: stocksLoading,
    error: stocksError,
    mutate: mutateStocks,
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
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="mb-4">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Akses Terbatas
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            Anda harus login untuk mengakses halaman manajemen aset & stok.
          </p>
          <Button
            onClick={() => (window.location.href = "/login")}
            className="w-full"
          >
            Login Sekarang
          </Button>
        </div>
      </div>
    );
  }

  // Check if user has required role
  if (session?.role !== "OWNER" && session?.role !== "ACCOUNTANT") {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Akses Ditolak</p>
          <p className="text-sm text-gray-500 mt-2">
            Anda harus memiliki role OWNER atau ACCOUNTANT untuk mengakses
            manajemen aset & stok
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
      handleCloseAddModal();
    } catch (error) {
      console.error("Error creating asset:", error);
      toast.error("Gagal menambahkan aset. Silakan coba lagi.");
    }
  };

  const handleAddStock = async (data: CreateStockData) => {
    try {
      await createStock(data);
      toast.success("Stok berhasil ditambahkan");
      handleCloseAddModal();
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
    const type = item.type === "ASSET" ? "ASSET" : "STOCK";
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
      mutateAssets();
      mutateStocks();
      handleCloseAdjustmentModal();
    } catch (error) {
      console.error("Error adjusting item:", error);
      toast.error("Gagal menyimpan penyesuaian. Silakan coba lagi.");
    }
  };

  const handleDeleteItem = async (item: Asset | Stock) => {
    try {
      if (item.type === "ASSET") {
        await deleteAsset(item.id);
        toast.success("Aset berhasil dihapus");
      } else {
        await deleteStock(item.id);
        toast.success("Stok berhasil dihapus");
      }
    } catch (error) {
      console.error("Error deleting item:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      if (
        errorMessage.includes("Unauthorized") ||
        errorMessage.includes("403")
      ) {
        toast.error(
          "Anda tidak memiliki izin untuk menghapus item ini. Hanya OWNER yang dapat menghapus aset dan stok."
        );
      } else {
        toast.error("Gagal menghapus item. Silakan coba lagi.");
      }
    }
  };

  // Filter items based on search terms
  const filteredAssets = assets.filter(
    (asset: Asset) =>
      asset.name.toLowerCase().includes(assetSearchTerm.toLowerCase()) ||
      asset.description?.toLowerCase().includes(assetSearchTerm.toLowerCase())
  );

  const filteredStocks = stocks.filter(
    (stock: Stock) =>
      stock.name.toLowerCase().includes(stockSearchTerm.toLowerCase()) ||
      stock.description?.toLowerCase().includes(stockSearchTerm.toLowerCase())
  );

  // Show error if API is not available
  if (assetsError || stocksError) {
    console.error("Asset/Stock Error:", assetsError || stocksError);

    // Check if it's an authentication error
    const currentError = assetsError || stocksError;
    const isAuthError =
      currentError.message?.includes("Unauthenticated") ||
      currentError.message?.includes("jwt") ||
      currentError.message?.includes("token");

    return (
      <div className="w-full h-full relative">
        <div className="sticky top-16 z-40 bg-background border-b">
          <div className="flex h-16 shrink-0 items-center gap-2 md:px-1 px-2">
            <div className="flex items-center justify-between flex-1">
              <h1 className="text-2xl md:text-3xl font-bold md:px-5 font-[stencil]">
                Aset & Stok
              </h1>
            </div>
          </div>
        </div>

        <div className="flex flex-col w-full">
          <div className="flex flex-1 flex-col gap-4 p-2 md:p-6">
            <div
              className={`border rounded-lg p-6 ${isAuthError ? "bg-yellow-50 border-yellow-200" : "bg-red-50 border-red-200"}`}
            >
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg
                    className={`h-5 w-5 ${isAuthError ? "text-yellow-400" : "text-red-400"}`}
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
                  <h3
                    className={`text-sm font-medium ${isAuthError ? "text-yellow-800" : "text-red-800"}`}
                  >
                    {isAuthError ? "Masalah Autentikasi" : "Terjadi Kesalahan"}
                  </h3>
                  <div
                    className={`mt-2 text-sm ${isAuthError ? "text-yellow-700" : "text-red-700"}`}
                  >
                    <p>
                      {isAuthError
                        ? "Sesi login Anda mungkin telah berakhir. Silakan login ulang untuk melanjutkan."
                        : "Gagal memuat data aset dan stok. Silakan coba lagi atau hubungi administrator."}
                    </p>
                    {isAuthError && (
                      <Button
                        onClick={() => (window.location.href = "/login")}
                        variant="outline"
                        size="sm"
                        className="mt-3"
                      >
                        Login Ulang
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative">
      <div className="sticky top-16 z-40 bg-background border-b">
        <div className="flex h-16 shrink-0 items-center gap-2 md:px-1 px-2">
          <div className="flex items-center justify-between flex-1">
            <h1 className="text-2xl md:text-3xl font-bold md:px-5 font-[stencil]">
              Aset & Stok
            </h1>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-sm">
                Total:{" "}
                {new Intl.NumberFormat("id-ID", {
                  style: "currency",
                  currency: "IDR",
                  minimumFractionDigits: 0,
                }).format(assetsTotal + stocksTotal)}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col w-full">
        <div className="flex flex-1 flex-col gap-4 p-2 md:p-6">
          {/* Asset and Stock Tables Side by Side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Asset Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <HardDrive className="w-5 h-5 text-blue-600" />
                  Aset
                </h2>
                <Button
                  onClick={() => handleAddItem("ASSET")}
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Tambah Aset
                </Button>
              </div>

              <div className="relative">
                <Search className="absolute left-3 top-[10px] h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cari aset..."
                  value={assetSearchTerm}
                  onChange={(e) => setAssetSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <ItemTable
                items={filteredAssets}
                title="ASET"
                icon={HardDrive}
                total={assetsTotal}
                type="ASSET"
                loading={assetsLoading}
                onAdjustItem={handleAdjustItem}
                onDeleteItem={handleDeleteItem}
                canDelete={session?.role === "OWNER"}
              />
            </div>

            {/* Stock Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <Package className="w-5 h-5 text-green-600" />
                  Stok
                </h2>
                <Button
                  onClick={() => handleAddItem("STOCK")}
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Tambah Stok
                </Button>
              </div>

              <div className="relative">
                <Search className="absolute left-3 top-[10px] h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cari stok..."
                  value={stockSearchTerm}
                  onChange={(e) => setStockSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <ItemTable
                items={filteredStocks}
                title="STOK"
                icon={Package}
                total={stocksTotal}
                type="STOCK"
                loading={stocksLoading}
                onAdjustItem={handleAdjustItem}
                onDeleteItem={handleDeleteItem}
                canDelete={session?.role === "OWNER"}
              />
            </div>
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
