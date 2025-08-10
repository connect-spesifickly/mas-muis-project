"use client";

import React, { useState, useEffect } from "react";
import { Download, Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { assetStockApi } from "@/lib/api/asset-stock";
import { AdjustmentHistory } from "@/types/asset-stock";
import { toast } from "sonner";
import * as XLSX from "xlsx";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface AdjustmentHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  type?: "ASSET" | "STOCK";
  itemId?: string;
  itemName?: string;
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString("id-ID", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export function AdjustmentHistoryModal({
  isOpen,
  onClose,
  type,
  itemId,
  itemName,
}: AdjustmentHistoryModalProps) {
  const { data: session } = useSession();
  const [history, setHistory] = useState<AdjustmentHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchHistory();
    }
  }, [isOpen, type, itemId]);

  const fetchHistory = async () => {
    if (!session?.accessToken) return;

    setLoading(true);
    try {
      const params: { type?: string; itemId?: string } = {};
      if (type) params.type = type;
      if (itemId) params.itemId = itemId;

      const data = await assetStockApi.getAdjustmentHistory(
        params,
        session.accessToken
      );
      setHistory(data);
    } catch (error) {
      console.error("Error fetching history:", error);
      toast.error("Gagal memuat history penyesuaian");
    } finally {
      setLoading(false);
    }
  };

  const exportToExcel = async () => {
    if (history.length === 0) {
      toast.error("Tidak ada data untuk diexport");
      return;
    }

    setExporting(true);
    try {
      // Create workbook and worksheet
      const workbook = {
        SheetNames: ["History Penyesuaian"],
        Sheets: {
          "History Penyesuaian": {},
        },
      };

      // Define headers
      const headers = [
        "Tanggal",
        "Item",
        "Tipe",
        "Perubahan Kuantitas",
        "Alasan",
        "Dilakukan Oleh",
        "Email",
      ];

      // Create data array
      const data = [
        headers,
        ...history.map((item) => [
          formatDate(item.adjustedAt),
          item.item.name,
          item.item.type === "ASSET" ? "Aset" : "Stok",
          item.quantityChange,
          item.reason,
          item.recordedBy.name,
          item.recordedBy.email,
        ]),
      ];

      // Convert to worksheet format
      const worksheet = {};
      data.forEach((row, rowIndex) => {
        row.forEach((cell, colIndex) => {
          const cellAddress =
            String.fromCharCode(65 + colIndex) + (rowIndex + 1);
          worksheet[cellAddress] = { v: cell };
        });
      });

      // Set column widths
      worksheet["!cols"] = [
        { wch: 20 }, // Tanggal
        { wch: 25 }, // Item
        { wch: 10 }, // Tipe
        { wch: 15 }, // Perubahan Kuantitas
        { wch: 30 }, // Alasan
        { wch: 20 }, // Dilakukan Oleh
        { wch: 25 }, // Email
      ];

      workbook.Sheets["History Penyesuaian"] = worksheet;

      // Convert to binary string
      const wbout = XLSX.write(workbook, { bookType: "xlsx", type: "binary" });

      // Convert binary string to blob
      const blob = new Blob([s2ab(wbout)], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      // Download file
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);

      // Generate filename based on context
      let filename = "history-penyesuaian";
      if (itemId && itemName) {
        filename = `history-${itemName.replace(/[^a-zA-Z0-9]/g, "-")}`;
      } else if (type) {
        filename = `history-${type.toLowerCase()}`;
      }
      filename += `-${new Date().toISOString().split("T")[0]}.xlsx`;

      link.setAttribute("download", filename);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("File Excel berhasil didownload");
      onClose();
    } catch (error) {
      console.error("Error exporting to Excel:", error);
      toast.error("Gagal mengexport file Excel");
    } finally {
      setExporting(false);
    }
  };

  // Helper function to convert string to array buffer
  const s2ab = (s: string) => {
    const buf = new ArrayBuffer(s.length);
    const view = new Uint8Array(buf);
    for (let i = 0; i < s.length; i++) view[i] = s.charCodeAt(i) & 0xff;
    return buf;
  };

  const getTitle = () => {
    if (itemId && itemName) {
      return `Export History ${itemName}`;
    }
    if (type) {
      return `Export History ${type === "ASSET" ? "Aset" : "Stok"}`;
    }
    return "Export History Penyesuaian";
  };

  const getDescription = () => {
    if (loading) return "Memuat data...";
    if (history.length === 0) return "Tidak ada data untuk diexport";

    const itemText =
      itemId && itemName
        ? itemName
        : type
          ? type === "ASSET"
            ? "semua aset"
            : "semua stok"
          : "semua item";

    return `Unduh ${history.length} record history penyesuaian ${itemText} dalam format Excel`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{getTitle()}</DialogTitle>
          <DialogDescription>{getDescription()}</DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={exporting}>
            Batal
          </Button>
          <Button
            onClick={exportToExcel}
            disabled={loading || history.length === 0 || exporting}
            className="flex items-center gap-2"
          >
            {exporting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Mengunduh...
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                Unduh Excel
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
