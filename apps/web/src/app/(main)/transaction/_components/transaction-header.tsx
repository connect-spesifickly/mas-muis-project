"use client";

import { Button } from "@/components/ui/button";
import { FileSpreadsheet } from "lucide-react";
import { Transaction } from "@/types/transaction";

interface TransactionHeaderProps {
  transactions: Transaction[];
  customers: { id: string; name: string }[];
  loading: boolean;
  onExport: () => void;
}

export function TransactionHeader({
  transactions,
  customers,
  loading,
  onExport,
}: TransactionHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-blue-700 mb-2 mt-2 md:mt-4">
          Transaksi Kas
        </h1>
        <p className="text-gray-500 mb-4 text-sm md:text-base">
          Kelola semua transaksi kas masuk dan keluar dengan mudah dan nyaman.
        </p>
      </div>

      <Button
        variant="outline"
        disabled={loading || !transactions?.length}
        onClick={onExport}
        className="hidden sm:flex"
      >
        <FileSpreadsheet className="h-4 w-4 mr-2" />
        Export Excel
      </Button>
    </div>
  );
}
