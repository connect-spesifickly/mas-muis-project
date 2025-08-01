"use client";

import { useState } from "react";
import { Asset, Stock } from "@/types/asset-stock";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface AdjustmentModalProps {
  isOpen: boolean;
  item: Asset | Stock | null;
  type: "ASSET" | "STOCK" | null;
  onClose: () => void;
  onAdjust: (quantityChange: number, reason: string) => Promise<void>;
}

export function AdjustmentModal({
  isOpen,
  item,
  type,
  onClose,
  onAdjust,
}: AdjustmentModalProps) {
  const [quantityChange, setQuantityChange] = useState("");
  const [reason, setReason] = useState("");
  const [isIncrease, setIsIncrease] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const handleAdjust = async () => {
    if (!quantityChange || !reason) {
      alert("Harap isi semua field");
      return;
    }

    const quantity = isIncrease
      ? Number.parseInt(quantityChange)
      : -Number.parseInt(quantityChange);

    setIsLoading(true);
    try {
      await onAdjust(quantity, reason);
      handleClose();
    } catch (error) {
      console.error("Error adjusting item:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setQuantityChange("");
    setReason("");
    setIsIncrease(true);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            Penyesuaian {type === "ASSET" ? "Aset" : "Stok"}
          </DialogTitle>
        </DialogHeader>

        {item && (
          <div className="space-y-4">
            <div className="p-3 bg-gray-50 rounded-lg">
              <Label className="text-sm font-medium text-gray-700">
                Item: {item.name}
              </Label>
              <div className="text-sm text-gray-500 mt-1">
                Quantity saat ini: {item.quantity}
              </div>
            </div>

            <div>
              <Label className="block text-sm font-medium text-gray-700 mb-2">
                Jenis Penyesuaian
              </Label>
              <div className="flex gap-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    checked={isIncrease}
                    onChange={() => setIsIncrease(true)}
                    className="mr-2"
                  />
                  Penambahan
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    checked={!isIncrease}
                    onChange={() => setIsIncrease(false)}
                    className="mr-2"
                  />
                  Pengurangan
                </label>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantity">Jumlah</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={quantityChange}
                onChange={(e) => setQuantityChange(e.target.value)}
                placeholder="Masukkan jumlah"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reason">Keterangan</Label>
              <Textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Masukkan alasan penyesuaian"
                rows={3}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={handleClose}
                disabled={isLoading}
                className="flex-1"
              >
                Batal
              </Button>
              <Button
                onClick={handleAdjust}
                disabled={isLoading}
                className="flex-1"
              >
                {isLoading ? "Menyimpan..." : "Simpan"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
