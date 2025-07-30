"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useTransactions } from "@/hooks/use-transaction";
import { useCustomers } from "@/hooks/use-customer";
import ExcelTable from "@/components/excel-table";
import { Button } from "@/components/ui/button";
import { FileSpreadsheet } from "lucide-react";
import { toast } from "sonner";
import {
  Transaction,
  TransactionType,
  CreateTransactionData,
} from "@/types/transaction";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

// Add export function
const handleExportExcel = async (
  transactions: Transaction[],
  customers: { id: string; name: string }[]
) => {
  try {
    const XLSX = await import("xlsx");

    // Format data untuk export
    const exportData = transactions.map((transaction) => {
      const customer = customers.find((c) => c.id === transaction.customerId);
      const transactionDate = transaction.transactionDate
        ? new Date(String(transaction.transactionDate))
        : null;
      const createdAt = transaction.createdAt
        ? new Date(String(transaction.createdAt))
        : null;

      const row = [
        transactionDate ? transactionDate.toLocaleDateString("id-ID") : "",
        customer?.name || transaction.customerId || "",
        transaction.description || "",
        transaction.type || "",
        new Intl.NumberFormat("id-ID", {
          style: "currency",
          currency: "IDR",
        }).format(transaction.amount || 0),
        transaction.runningBalance
          ? new Intl.NumberFormat("id-ID", {
              style: "currency",
              currency: "IDR",
            }).format(transaction.runningBalance)
          : "",
        createdAt
          ? createdAt.toLocaleDateString("id-ID") +
            " " +
            createdAt.toLocaleTimeString("id-ID", {
              hour: "2-digit",
              minute: "2-digit",
            })
          : "",
      ];

      console.log("Export row:", row);
      return row;
    });

    // Header untuk Excel
    const headers = [
      "Tanggal Transaksi",
      "Customer",
      "Deskripsi",
      "Tipe",
      "Jumlah",
      "Saldo",
      "Waktu Input",
    ];

    // Buat worksheet dengan header sebagai row pertama
    const ws = XLSX.utils.aoa_to_sheet([headers, ...exportData]);

    // Set lebar kolom
    const colWidths = [
      { wch: 15 }, // Tanggal Transaksi
      { wch: 20 }, // Customer
      { wch: 30 }, // Deskripsi
      { wch: 10 }, // Tipe
      { wch: 15 }, // Jumlah
      { wch: 15 }, // Saldo
      { wch: 20 }, // Waktu Input
    ];
    ws["!cols"] = colWidths;

    // Tambahkan range untuk Table dan AutoFilter
    const range = XLSX.utils.decode_range(ws["!ref"] || "A1");
    ws["!autofilter"] = { ref: XLSX.utils.encode_range(range) };

    // Tambahkan Table untuk memungkinkan sorting dan filtering
    if (!ws["!tables"]) ws["!tables"] = [];
    ws["!tables"].push({
      name: "TransaksiTable",
      ref: XLSX.utils.encode_range(range),
      columns: headers.map((header, index) => ({
        name: header,
        key: index,
      })),
    });

    // Styling untuk header (row pertama)
    headers.forEach((_, index) => {
      const cellRef = XLSX.utils.encode_cell({ r: 0, c: index });
      if (!ws[cellRef]) ws[cellRef] = {};
      ws[cellRef].s = {
        font: { bold: true, color: { rgb: "FFFFFF" } },
        fill: { fgColor: { rgb: "4472C4" } },
        alignment: { horizontal: "center", vertical: "center" },
      };
    });

    // Buat workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Transaksi");

    // Generate filename dengan tanggal
    const now = new Date();
    const dateStr = now.toISOString().split("T")[0];
    const filename = `transaksi_${dateStr}.xlsx`;

    // Download file
    XLSX.writeFile(wb, filename);
    toast("File Excel berhasil diunduh!");
  } catch (error) {
    console.error("Excel export error:", error);
    toast("Gagal mengexport file Excel");
  }
};

export default function TransaksiKas() {
  const { data: session } = useSession();
  const [filters, setFilters] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
  });

  console.log("Transaction Page - User:", session?.user);
  console.log("Transaction Page - Filters:", filters);

  const { transactions, isLoading, error, createTransaction } = useTransactions(
    {
      month: filters.month,
      year: filters.year,
      userRole: session?.role,
    }
  );

  console.log("Transaction Page - Transactions:", transactions);
  console.log("Transaction Page - Loading:", isLoading);
  console.log("Transaction Page - Error:", error);

  // Get customers for dropdown
  const { customers: customerList } = useCustomers({
    page: 1,
    limit: 100,
  });

  // Function to get customer name by ID
  const getCustomerNameById = (customerId: string | number | undefined) => {
    if (!customerId) return "-";
    const customer = customerList.find((c) => c.id === customerId);
    return customer ? customer.name : "-";
  };

  // Function to format transaction data for display
  const formatTransactionForDisplay = (transaction: Transaction) => {
    return {
      ...transaction,
      customerId: getCustomerNameById(transaction.customerId),
      // Add a computed field for amount display with color
      amountDisplay: {
        value: transaction.amount,
        isExpense: transaction.type === "EXPENSE",
      },
    };
  };

  // Format transactions for display
  const displayTransactions = transactions.map(formatTransactionForDisplay);

  // Debug: log transaction data for sorting
  console.log("Raw transactions:", transactions);
  console.log("Display transactions:", displayTransactions);
  console.log("First transaction createdAt:", transactions[0]?.createdAt);
  console.log(
    "First transaction transactionDate:",
    transactions[0]?.transactionDate
  );

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

    // For other columns or when editing, use default renderer
    // Return undefined to use default renderCell
    return undefined;
  };

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

  const handleFilterChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
  };

  const handleCreateTransaction = async (data: Partial<Transaction>) => {
    try {
      // Convert customer name to customerId if customerId is a name
      const transactionData = { ...data };

      // Handle customerId conversion
      if (
        typeof transactionData.customerId === "string" &&
        transactionData.customerId &&
        transactionData.customerId !== "Pilih Customer"
      ) {
        const customer = customerList.find(
          (c) => c.name === transactionData.customerId
        );
        if (customer) {
          transactionData.customerId = customer.id;
        } else {
          // If customer not found, set to undefined (optional field)
          transactionData.customerId = undefined;
        }
      } else {
        // If customerId is empty, undefined, placeholder, or not provided, set to undefined
        transactionData.customerId = undefined;
      }

      // Handle transactionDate format - ExcelTable returns string for date input
      if (transactionData.transactionDate) {
        // ExcelTable returns string for date input, convert to Date
        if (typeof transactionData.transactionDate === "string") {
          transactionData.transactionDate = new Date(
            transactionData.transactionDate + "T00:00:00"
          );
        }
      } else {
        // Set default to current date if not provided
        transactionData.transactionDate = new Date();
      }

      // Ensure amount is a number
      if (typeof transactionData.amount === "string") {
        transactionData.amount = parseFloat(transactionData.amount);
      }

      // Ensure required fields are present
      if (
        !transactionData.description ||
        !transactionData.amount ||
        !transactionData.type
      ) {
        throw new Error("Description, amount, and type are required");
      }

      console.log("Sending transaction data:", transactionData);

      // Clean up data to only send required fields to backend
      const cleanData = {
        description: transactionData.description!,
        amount: transactionData.amount!,
        type: transactionData.type!,
        customerId: transactionData.customerId,
        transactionDate:
          transactionData.transactionDate instanceof Date
            ? transactionData.transactionDate.toISOString()
            : transactionData.transactionDate,
      };

      console.log("Clean transaction data:", cleanData);
      await createTransaction(cleanData as unknown as CreateTransactionData);
    } catch (error) {
      console.error("Failed to create transaction:", error);
      throw error; // Re-throw to show error in UI
    }
  };

  const handleUpdateTransaction = async (
    id: string,
    data: Partial<Transaction>
  ) => {
    try {
      // Convert customer name to customerId if customerId is a name
      const transactionData = { ...data };

      // Handle customerId conversion
      if (
        typeof transactionData.customerId === "string" &&
        transactionData.customerId &&
        transactionData.customerId !== "Pilih Customer"
      ) {
        const customer = customerList.find(
          (c) => c.name === transactionData.customerId
        );
        if (customer) {
          transactionData.customerId = customer.id;
        } else {
          // If customer not found, set to undefined (optional field)
          transactionData.customerId = undefined;
        }
      } else {
        // If customerId is empty, undefined, placeholder, or not provided, set to undefined
        transactionData.customerId = undefined;
      }

      // Handle transactionDate format - ExcelTable returns string for date input
      if (transactionData.transactionDate) {
        // ExcelTable returns string for date input, convert to Date
        if (typeof transactionData.transactionDate === "string") {
          transactionData.transactionDate = new Date(
            transactionData.transactionDate + "T00:00:00"
          );
        }
      }

      // Ensure amount is a number
      if (typeof transactionData.amount === "string") {
        transactionData.amount = parseFloat(transactionData.amount);
      }

      console.log("Updating transaction data:", transactionData);

      // Clean up data to only send required fields to backend
      const cleanData = {
        ...transactionData,
        transactionDate:
          transactionData.transactionDate instanceof Date
            ? transactionData.transactionDate.toISOString()
            : transactionData.transactionDate,
      };

      console.log("Clean update data:", cleanData);
      // TODO: Add updateTransaction function to useTransactions hook
      // await updateTransaction(id, cleanData as unknown as CreateTransactionData);
    } catch (error) {
      console.error("Failed to update transaction:", error);
      throw error; // Re-throw to show error in UI
    }
  };

  if (isLoading) return <div className="p-6">Loading...</div>;
  if (error)
    return <div className="p-6 text-red-500">Error: {error.message}</div>;

  return (
    <div className="p-0 md:p-4 max-w-7xl w-full mx-auto">
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
          disabled={isLoading || !transactions?.length}
          onClick={() =>
            handleExportExcel(transactions || [], customerList || [])
          }
          className="hidden sm:flex"
        >
          <FileSpreadsheet className="h-4 w-4 mr-2" />
          Export Excel
        </Button>
      </div>

      <TransactionFilters
        filters={filters}
        onFiltersChange={handleFilterChange}
      />
      <div className="my-4 border-t border-gray-200" />
      <Card className="shadow-lg rounded-2xl border-0 bg-white/90 w-full">
        <CardContent className="p-0 md:p-4">
          <ExcelTable
            title=""
            data={displayTransactions}
            columns={transactionColumns}
            showRunningBalance={session?.role === "OWNER"}
            onAdd={handleCreateTransaction}
            onUpdate={handleUpdateTransaction}
            customCellRenderer={customCellRenderer}
          />
        </CardContent>
      </Card>
    </div>
  );
}
