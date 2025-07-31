"use client";

import { useState } from "react";
import { CreateAssetData, CreateStockData } from "@/types/asset-stock";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface AddItemModalProps {
  isOpen: boolean;
  type: "ASSET" | "STOCK" | null;
  onClose: () => void;
  onAdd: (data: CreateAssetData | CreateStockData) => Promise<void>;
}

export function AddItemModal({
  isOpen,
  type,
  onClose,
  onAdd,
}: AddItemModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    quantity: "",
    purchasePrice: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen || !type) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.quantity || !formData.purchasePrice) {
      alert("Harap isi semua field yang diperlukan");
      return;
    }

    const data = {
      name: formData.name,
      description: formData.description || undefined,
      quantity: Number.parseInt(formData.quantity),
      purchasePrice: Number.parseInt(formData.purchasePrice),
    };

    setIsLoading(true);
    try {
      await onAdd(data);
      // Modal will be closed by the parent component after successful creation
    } catch (error) {
      console.error("Error adding item:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      name: "",
      description: "",
      quantity: "",
      purchasePrice: "",
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <h3 className="text-lg font-semibold mb-4">
          Tambah {type === "ASSET" ? "Aset" : "Stok"} Baru
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">
              Nama {type === "ASSET" ? "Aset" : "Stok"} *
            </Label>
            <Input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder={`Masukkan nama ${type === "ASSET" ? "aset" : "stok"}`}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Deskripsi</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Masukkan deskripsi (opsional)"
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantity">Kuantitas *</Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              value={formData.quantity}
              onChange={(e) =>
                setFormData({ ...formData, quantity: e.target.value })
              }
              placeholder="Masukkan kuantitas"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="purchasePrice">Harga Beli *</Label>
            <Input
              id="purchasePrice"
              type="number"
              min="0"
              value={formData.purchasePrice}
              onChange={(e) =>
                setFormData({ ...formData, purchasePrice: e.target.value })
              }
              placeholder="Masukkan harga beli"
              required
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
              className="flex-1"
            >
              Batal
            </Button>
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading ? "Menyimpan..." : "Simpan"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
