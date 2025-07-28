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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Constants
const TRANSACTION_COLUMNS = [
  { key: "id", label: "ID Transaksi", type: "text" as const, required: true },
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
  {
    key: "category",
    label: "Kategori",
    type: "select" as const,
    options: ["Service", "Inventory", "Operational", "Sales", "Other"],
  },
];

// Filter Component
interface TransactionFiltersProps {
  filters: { month: number; year: number };
  onFiltersChange: (filters: { month: number; year: number }) => void;
}

function TransactionFilters({
  filters,
  onFiltersChange,
}: TransactionFiltersProps) {
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
    <Card>
      <CardHeader>
        <CardTitle>Filter Transaksi</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4 items-center">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Bulan</label>
            <Select
              value={filters.month.toString()}
              onValueChange={(value) =>
                onFiltersChange({ ...filters, month: Number(value) })
              }
            >
              <SelectTrigger className="w-[180px]">
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

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Tahun</label>
            <Select
              value={filters.year.toString()}
              onValueChange={(value) =>
                onFiltersChange({ ...filters, year: Number(value) })
              }
            >
              <SelectTrigger className="w-[180px]">
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

// Main Component
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
    <div className="p-6 space-y-6">
      {/* Filter Controls */}
      <TransactionFilters
        filters={filters}
        onFiltersChange={handleFilterChange}
      />

      {/* Excel Table */}
      <ExcelTable
        title="Transaksi Kas"
        data={transactions}
        columns={TRANSACTION_COLUMNS}
        showRunningBalance={user?.role === "OWNER"}
        onAdd={handleCreateTransaction}
        onUpdate={handleUpdateTransaction}
        onDelete={handleDeleteTransaction}
      />
    </div>
  );
}
