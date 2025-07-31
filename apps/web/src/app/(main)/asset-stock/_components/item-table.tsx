"use client";

import { Plus, Edit } from "lucide-react";
import { Asset, Stock } from "@/types/asset-stock";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ItemTableProps {
  items: (Asset | Stock)[];
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  total: number;
  type: "ASSET" | "STOCK";
  loading?: boolean;
  onAddItem: () => void;
  onAdjustItem: (item: Asset | Stock) => void;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
};

const formatDate = (date: Date | string) => {
  return new Date(date).toLocaleDateString("id-ID");
};

export function ItemTable({
  items,
  title,
  icon: Icon,
  total,
  loading = false,
  onAddItem,
  onAdjustItem,
}: ItemTableProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Icon className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
          <Button
            onClick={onAddItem}
            size="sm"
            className="h-8 w-8 p-0 bg-green-500 hover:bg-green-600"
            title={`Tambah ${title}`}
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        <div className="text-sm font-bold text-green-600">
          {formatCurrency(total)}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-gray-50">
              <th className="border border-gray-300 px-3 py-2 text-left font-medium text-gray-700">
                Tgl. Pengadaan
              </th>
              <th className="border border-gray-300 px-3 py-2 text-left font-medium text-gray-700">
                {title}
              </th>
              <th className="border border-gray-300 px-3 py-2 text-center font-medium text-gray-700">
                Qty
              </th>
              <th className="border border-gray-300 px-3 py-2 text-right font-medium text-gray-700">
                Nilai
              </th>
              <th className="border border-gray-300 px-3 py-2 text-left font-medium text-gray-700">
                Keterangan
              </th>
              <th className="border border-gray-300 px-3 py-2 text-center font-medium text-gray-700">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={6}
                  className="border border-gray-300 px-3 py-8 text-center text-gray-500"
                >
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    <span className="ml-2">Memuat data...</span>
                  </div>
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="border border-gray-300 px-3 py-8 text-center text-gray-500"
                >
                  Tidak ada data {title.toLowerCase()}
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="border border-gray-300 px-3 py-2 text-xs text-gray-600">
                    {formatDate(item.createdAt)}
                  </td>
                  <td className="border border-gray-300 px-3 py-2">
                    <div className="font-medium text-gray-900">{item.name}</div>
                  </td>
                  <td className="border border-gray-300 px-3 py-2 text-center">
                    <Badge variant="secondary" className="font-medium">
                      {item.quantity}
                    </Badge>
                  </td>
                  <td className="border border-gray-300 px-3 py-2 text-right text-xs font-medium text-gray-900">
                    {formatCurrency(item.quantity * item.purchasePrice)}
                  </td>
                  <td className="border border-gray-300 px-3 py-2 text-xs text-gray-500 max-w-[200px] break-words">
                    {item.description || "-"}
                  </td>
                  <td className="border border-gray-300 px-3 py-2 text-center">
                    <Button
                      onClick={() => onAdjustItem(item)}
                      size="sm"
                      variant="outline"
                      className="h-8 w-8 p-0 border-blue-200 text-blue-600 hover:bg-blue-50"
                      title="Sesuaikan Kuantitas"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
