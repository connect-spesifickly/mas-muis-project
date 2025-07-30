"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useTransactions } from "@/hooks/use-transaction";
import { useCustomers } from "@/hooks/use-customer";
import { Transaction } from "@/types/transaction";

// Import components
import {
  TransactionHeader,
  TransactionFilters,
  TransactionTable,
  handleExportExcel,
  formatTransactionForDisplay,
  handleCreateTransaction as createTransactionHandler,
  handleUpdateTransaction as updateTransactionHandler,
} from "./_components";

export default function TransaksiKas() {
  const { data: session } = useSession();
  const [filters, setFilters] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
  });

  console.log("Transaction Page - User:", session?.user);
  console.log("Transaction Page - Filters:", filters);

  // Fetch transactions
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
    userRole: session?.role,
  });

  console.log("Transaction Page - Transactions:", transactions);
  console.log("Transaction Page - Loading:", isLoading);
  console.log("Transaction Page - Error:", error);

  // Get customers for dropdown
  const { customers: customerList } = useCustomers({
    page: 1,
    limit: 100,
  });

  // Format transactions for display
  const displayTransactions = transactions.map((transaction) =>
    formatTransactionForDisplay(transaction, customerList)
  );

  // Debug: log transaction data for sorting
  console.log("Raw transactions:", transactions);
  console.log("Display transactions:", displayTransactions);
  console.log("First transaction createdAt:", transactions[0]?.createdAt);
  console.log(
    "First transaction transactionDate:",
    transactions[0]?.transactionDate
  );

  // Handler functions
  const handleFilterChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
  };

  const handleCreateTransaction = async (data: Partial<Transaction>) => {
    await createTransactionHandler(data, customerList, async (cleanData) => {
      await createTransaction(cleanData);
    });
  };

  const handleUpdateTransaction = async (
    id: string,
    data: Partial<Transaction>
  ) => {
    await updateTransactionHandler(
      id,
      data,
      customerList,
      async (id, cleanData) => {
        await updateTransaction(id, cleanData);
      }
    );
  };

  const handleDeleteTransaction = async (id: string) => {
    await deleteTransaction(id);
  };

  const handleExport = () => {
    handleExportExcel(transactions, customerList);
  };

  if (isLoading) return <div className="p-6">Loading...</div>;
  if (error)
    return <div className="p-6 text-red-500">Error: {error.message}</div>;

  return (
    <div className="p-0 md:p-4 max-w-7xl w-full mx-auto">
      <TransactionHeader
        transactions={transactions}
        customers={customerList}
        loading={isLoading}
        onExport={handleExport}
      />

      <TransactionFilters
        filters={filters}
        onFiltersChange={handleFilterChange}
      />

      <div className="my-4 border-t border-gray-200" />

      <TransactionTable
        transactions={transactions}
        customerList={customerList}
        displayTransactions={displayTransactions}
        loading={isLoading}
        showRunningBalance={session?.role === "OWNER"}
        onAdd={handleCreateTransaction}
        onUpdate={handleUpdateTransaction}
        onDelete={handleDeleteTransaction}
      />
    </div>
  );
}
