"use client";

import React, { useState, useEffect } from "react";
import { Download, X, Loader2 } from "lucide-react";
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
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface AdjustmentHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  type?: "ASSET" | "STOCK";
  itemId?: string;
  itemName?: string;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
};

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
      link.setAttribute(
        "download",
        `history-penyesuaian-${type || "all"}-${new Date().toISOString().split("T")[0]}.xlsx`
      );
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("File Excel berhasil didownload");
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
      return `History Penyesuaian - ${itemName}`;
    }
    if (type) {
      return `History Penyesuaian ${type === "ASSET" ? "Aset" : "Stok"}`;
    }
    return "History Penyesuaian Semua Item";
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl">{getTitle()}</DialogTitle>
              <DialogDescription>
                Riwayat penyesuaian kuantitas aset dan stok
                {!loading && (
                  <span className="ml-2 text-sm font-medium text-gray-600">
                    ({history.length} data)
                  </span>
                )}
              </DialogDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={exportToExcel}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
                disabled={loading || history.length === 0 || exporting}
              >
                {exporting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
                {exporting ? "Exporting..." : "Export Excel"}
              </Button>
              <Button
                onClick={onClose}
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="mt-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              <span>Memuat history...</span>
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Tidak ada history penyesuaian
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm min-w-[1000px]">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-300 px-4 py-3 text-left font-medium text-gray-700 w-[180px]">
                      Tanggal
                    </th>
                    <th className="border border-gray-300 px-4 py-3 text-left font-medium text-gray-700 w-[200px]">
                      Item
                    </th>
                    <th className="border border-gray-300 px-4 py-3 text-center font-medium text-gray-700 w-[100px]">
                      Tipe
                    </th>
                    <th className="border border-gray-300 px-4 py-3 text-center font-medium text-gray-700 w-[120px]">
                      Perubahan
                    </th>
                    <th className="border border-gray-300 px-4 py-3 text-left font-medium text-gray-700 w-[300px]">
                      Alasan
                    </th>
                    <th className="border border-gray-300 px-4 py-3 text-left font-medium text-gray-700 w-[250px]">
                      Dilakukan Oleh
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="border border-gray-300 px-4 py-3 text-sm text-gray-600">
                        {formatDate(item.adjustedAt)}
                      </td>
                      <td className="border border-gray-300 px-4 py-3">
                        <div className="font-medium text-gray-900">
                          {item.item.name}
                        </div>
                      </td>
                      <td className="border border-gray-300 px-4 py-3 text-center">
                        <Badge
                          variant={
                            item.item.type === "ASSET" ? "default" : "secondary"
                          }
                          className="text-xs"
                        >
                          {item.item.type === "ASSET" ? "Aset" : "Stok"}
                        </Badge>
                      </td>
                      <td className="border border-gray-300 px-4 py-3 text-center">
                        <Badge
                          variant={
                            item.quantityChange > 0 ? "default" : "destructive"
                          }
                          className="text-xs"
                        >
                          {item.quantityChange > 0 ? "+" : ""}
                          {item.quantityChange}
                        </Badge>
                      </td>
                      <td className="border border-gray-300 px-4 py-3 text-sm text-gray-600">
                        {item.reason}
                      </td>
                      <td className="border border-gray-300 px-4 py-3 text-sm text-gray-600">
                        <div>
                          <div className="font-medium">
                            {item.recordedBy.name}
                          </div>
                          <div className="text-gray-500 text-xs">
                            {item.recordedBy.email}
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
