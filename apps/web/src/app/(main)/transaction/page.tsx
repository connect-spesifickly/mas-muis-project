"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useTransactions } from "@/hooks/use-transaction";
import { useCustomers } from "@/hooks/use-customer";
import { Transaction } from "@/types/transaction";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Import components
import {
  TransactionFilters,
  TransactionTable,
  TransactionExportModal,
  formatTransactionForDisplay,
  handleCreateTransaction as createTransactionHandler,
  handleUpdateTransaction as updateTransactionHandler,
} from "./_components";

export default function TransaksiKas() {
  const { data: session, status } = useSession();
  const [filters, setFilters] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
  });
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

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

  // Get customers for dropdown
  const { customers: customerList } = useCustomers({
    page: 1,
    limit: 100,
  });

  // Format transactions for display
  const displayTransactions = transactions.map((transaction) =>
    formatTransactionForDisplay(transaction, customerList)
  );

  // Check if user is authenticated
  if (status === "loading") {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="mb-4">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Akses Terbatas
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            Anda harus login untuk mengakses halaman transaksi kas.
          </p>
        </div>
      </div>
    );
  }

  // Show error if API is not available
  if (error) {
    return (
      <div className="w-full h-full relative">
        <div className="sticky top-16 z-40 bg-background border-b">
          <div className="flex h-16 shrink-0 items-center gap-2 md:px-1 px-2">
            <div className="flex items-center justify-between flex-1">
              <h1 className="text-2xl md:text-3xl font-bold md:px-5 font-[stencil]">
                Transaksi Kas
              </h1>
            </div>
          </div>
        </div>

        <div className="flex flex-col w-full">
          <div className="flex flex-1 flex-col gap-4 p-2 md:p-6">
            <div className="border rounded-lg p-6 bg-red-50 border-red-200">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-red-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    Terjadi Kesalahan
                  </h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>
                      Gagal memuat data transaksi kas. Silakan coba lagi atau
                      hubungi administrator.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

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

  if (isLoading) return <div className="p-6">Loading...</div>;

  return (
    <div className="w-full h-full relative">
      <div className="sticky top-16 z-40 bg-background border-b">
        <div className="flex h-16 shrink-0 items-center gap-2 md:px-1 px-2">
          <div className="flex items-center justify-between flex-1">
            <h1 className="text-2xl md:text-3xl font-bold md:px-5 font-[stencil]">
              Transaksi Kas
            </h1>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-sm">
                {filters.month}/{filters.year}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col w-full">
        <div className="flex flex-1 flex-col gap-4 p-2 md:p-6">
          {/* Filter Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Filter Periode</CardTitle>
            </CardHeader>
            <CardContent>
              <TransactionFilters
                filters={filters}
                onFiltersChange={handleFilterChange}
                onExportClick={() => setIsExportModalOpen(true)}
                isExportDisabled={isLoading || !transactions?.length}
              />
            </CardContent>
          </Card>

          {/* Transaction Table */}
          <Card>
            <CardHeader>
              <div>
                <CardTitle className="text-lg">Daftar Transaksi</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Kelola semua transaksi kas masuk dan keluar
                </p>
              </div>
            </CardHeader>
            <CardContent className="p-0">
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
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Export Excel Modal */}
      <TransactionExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        transactions={transactions}
        customers={customerList}
      />
    </div>
  );
}
