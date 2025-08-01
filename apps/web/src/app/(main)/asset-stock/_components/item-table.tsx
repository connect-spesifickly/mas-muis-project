"use client";

import { Edit, Trash2, MoreHorizontal } from "lucide-react";
import { Asset, Stock } from "@/types/asset-stock";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ItemTableProps {
  items: (Asset | Stock)[];
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  total: number;
  type: "ASSET" | "STOCK";
  loading?: boolean;
  onAdjustItem: (item: Asset | Stock) => void;
  onDeleteItem: (item: Asset | Stock) => void;
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
  onAdjustItem,
  onDeleteItem,
}: ItemTableProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon className="w-5 h-5 text-blue-600" />
            <CardTitle className="text-lg">{title}</CardTitle>
          </div>
          <div className="text-sm font-bold text-green-600">
            {formatCurrency(total)}
          </div>
        </div>
      </CardHeader>
      <CardContent>
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
                      <div className="font-medium text-gray-900">
                        {item.name}
                      </div>
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
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            className="h-8 w-8 p-0"
                            title="Menu Aksi"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => onAdjustItem(item)}
                            className="flex items-center gap-2"
                          >
                            <Edit className="w-4 h-4" />
                            Sesuaikan Kuantitas
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => onDeleteItem(item)}
                            className="flex items-center gap-2 text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                            Hapus
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
