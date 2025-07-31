"use client";

import ExcelTable from "@/components/excel-table";
import { Transaction, TransactionType } from "@/types/transaction";
import { Card, CardContent } from "@/components/ui/card";

interface TransactionTableProps {
  transactions: Transaction[];
  customerList: { id: string; name: string }[];
  displayTransactions: Transaction[];
  loading: boolean;
  showRunningBalance: boolean;
  onAdd: (data: Partial<Transaction>) => Promise<void>;
  onUpdate: (id: string, data: Partial<Transaction>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export function TransactionTable({
  transactions,
  customerList,
  displayTransactions,
  loading,
  showRunningBalance,
  onAdd,
  onUpdate,
  onDelete,
}: TransactionTableProps) {
  // Create dynamic columns with customer options
  const transactionColumns = [
    {
      key: "transactionDate",
      label: "Tanggal",
      type: "date" as const,
      required: true,
    },
    {
      key: "customerId",
      label: "Customer",
      type: "select" as const,
      options: [
        "Pilih Customer",
        ...customerList.map((customer) => customer.name),
      ],
    },
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

  // Custom cell renderer for amount column
  const customCellRenderer = (
    column: { key: string; label: string; type: string },
    value: unknown,
    row: Record<string, unknown>,
    isEditing: boolean
  ) => {
    if (column.key === "amount" && !isEditing) {
      const numValue =
        typeof value === "number" ? value : parseFloat(String(value)) || 0;
      const isExpense = row.type === "EXPENSE";

      return (
        <span
          className={`break-words ${
            isExpense
              ? "text-red-600 font-medium"
              : "text-green-600 font-medium"
          }`}
        >
          {new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
          }).format(Math.abs(numValue))}
        </span>
      );
    }

    // For transactionDate column, show date and time
    if (column.key === "transactionDate" && !isEditing) {
      const dateValue =
        value instanceof Date ? value : value ? new Date(String(value)) : null;
      if (dateValue) {
        return (
          <span className="break-words">
            {dateValue.toLocaleDateString("id-ID")}
            <br />
            <span className="text-xs text-gray-500">
              {dateValue.toLocaleTimeString("id-ID", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </span>
        );
      }
    }

    // For createdAt column, show input time (when transaction was created)
    if (column.key === "createdAt" && !isEditing) {
      const createdAtValue = row.createdAt
        ? new Date(String(row.createdAt))
        : null;
      if (createdAtValue) {
        return (
          <span className="text-xs text-gray-400 break-words">
            {createdAtValue.toLocaleTimeString("id-ID", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        );
      }
    }

    return undefined; // Fallback to default renderCell
  };

  console.log("TransactionTable - displayTransactions:", displayTransactions);
  console.log("TransactionTable - showRunningBalance:", showRunningBalance);

  return (
    <Card className="shadow-lg rounded-2xl border-0 bg-white/90 w-full">
      <CardContent className="p-0 md:p-4">
        <ExcelTable
          title=""
          data={displayTransactions}
          columns={transactionColumns}
          showRunningBalance={showRunningBalance}
          showDuplicate={false}
          onAdd={onAdd}
          onUpdate={onUpdate}
          onDelete={onDelete}
          customCellRenderer={customCellRenderer}
        />
      </CardContent>
    </Card>
  );
}
