"use client";

import { useState } from "react";
import { useUser } from "@/hooks/use-user";
import ExcelTable from "@/components/excel-table";
import { useTransactions } from "@/hooks/use-transaction";
import {
  Transaction,
  TransactionType,
  CreateTransactionData,
  UpdateTransactionData,
} from "@/types/transaction";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const TRANSACTION_COLUMNS = [
  {
    key: "transactionDate",
    label: "Tanggal",
    type: "date" as const,
    required: true,
  },
  { key: "customerId", label: "Customer", type: "text" as const },
  {
    key: "description",
    label: "Deskripsi",
    type: "textarea" as const,
    required: true,
  },
  {
    key: "type",
    label: "Tipe",
    type: "select" as const,
    options: Object.values(TransactionType),
    required: true,
  },
  { key: "amount", label: "Jumlah", type: "number" as const, required: true },
];

function TransactionFilters({
  filters,
  onFiltersChange,
}: {
  filters: { month: number; year: number };
  onFiltersChange: (filters: { month: number; year: number }) => void;
}) {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);
  const months = [
    { value: 1, label: "Januari" },
    { value: 2, label: "Februari" },
    { value: 3, label: "Maret" },
    { value: 4, label: "April" },
    { value: 5, label: "Mei" },
    { value: 6, label: "Juni" },
    { value: 7, label: "Juli" },
    { value: 8, label: "Agustus" },
    { value: 9, label: "September" },
    { value: 10, label: "Oktober" },
    { value: 11, label: "November" },
    { value: 12, label: "Desember" },
  ];

  return (
    <Card className="shadow-md rounded-xl border-0 bg-gradient-to-r from-blue-50 to-white/80 mb-2">
      <CardContent className="py-4 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex gap-4 w-full md:w-auto">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-600 mb-1">
              Bulan
            </label>
            <Select
              value={filters.month.toString()}
              onValueChange={(value) =>
                onFiltersChange({ ...filters, month: Number(value) })
              }
            >
              <SelectTrigger className="w-[140px] rounded-lg border-gray-300 bg-white/80 focus:ring-2 focus:ring-blue-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {months.map((month) => (
                  <SelectItem key={month.value} value={month.value.toString()}>
                    {month.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-600 mb-1">
              Tahun
            </label>
            <Select
              value={filters.year.toString()}
              onValueChange={(value) =>
                onFiltersChange({ ...filters, year: Number(value) })
              }
            >
              <SelectTrigger className="w-[120px] rounded-lg border-gray-300 bg-white/80 focus:ring-2 focus:ring-blue-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {years.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function TransaksiKas() {
  const { user } = useUser();
  const [filters, setFilters] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
  });

  const {
    transactions,
    isLoading,
    error,
    createTransaction,
    updateTransaction,
    deleteTransaction,
  } = useTransactions({
    month: filters.month,
    year: filters.year,
    userRole: user?.role,
  });

  const handleFilterChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
  };

  const handleCreateTransaction = async (data: Partial<Transaction>) => {
    try {
      await createTransaction(data as CreateTransactionData);
    } catch (error) {
      console.error("Failed to create transaction:", error);
    }
  };

  const handleUpdateTransaction = async (
    id: string,
    data: Partial<Transaction>
  ) => {
    try {
      await updateTransaction(id, data as UpdateTransactionData);
    } catch (error) {
      console.error("Failed to update transaction:", error);
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    try {
      await deleteTransaction(id);
    } catch (error) {
      console.error("Failed to delete transaction:", error);
    }
  };

  if (isLoading) return <div className="p-6">Loading...</div>;
  if (error)
    return <div className="p-6 text-red-500">Error: {error.message}</div>;

  return (
    <div className="p-0 md:p-4 max-w-7xl w-full mx-auto">
      <h1 className="text-2xl md:text-3xl font-bold text-blue-700 mb-2 mt-2 md:mt-4">
        Transaksi Kas
      </h1>
      <p className="text-gray-500 mb-4 text-sm md:text-base">
        Kelola semua transaksi kas masuk dan keluar dengan mudah dan nyaman.
      </p>
      <TransactionFilters
        filters={filters}
        onFiltersChange={handleFilterChange}
      />
      <div className="my-4 border-t border-gray-200" />
      <Card className="shadow-lg rounded-2xl border-0 bg-white/90 w-full">
        <CardContent className="p-0 md:p-4">
          <ExcelTable
            title=""
            data={transactions}
            columns={TRANSACTION_COLUMNS}
            showRunningBalance={user?.role === "OWNER"}
            onAdd={handleCreateTransaction}
            onUpdate={handleUpdateTransaction}
            onDelete={handleDeleteTransaction}
          />
        </CardContent>
      </Card>
    </div>
  );
}
