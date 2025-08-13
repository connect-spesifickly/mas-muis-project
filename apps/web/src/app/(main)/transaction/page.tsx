"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useTransactions } from "@/hooks/use-transaction";
import { useCustomers } from "@/hooks/use-customer";
import { Transaction } from "@/types/transaction";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertTriangle,
  DollarSign,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

// Import components
import {
  TransactionFilters,
  TransactionTable,
  TransactionExportModal,
  formatTransactionForDisplay,
  handleCreateTransaction as createTransactionHandler,
  handleUpdateTransaction as updateTransactionHandler,
} from "./_components";

// Skeleton Components
const SkeletonFilterCard = () => (
  <Card>
    <CardHeader>
      <Skeleton className="h-6 w-32" />
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex flex-col space-y-2">
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-10 w-32" />
          </div>
          <div className="flex flex-col space-y-2">
            <Skeleton className="h-4 w-14" />
            <Skeleton className="h-10 w-24" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-10 w-20" />
            <Skeleton className="h-10 w-24" />
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);

const SkeletonTableHeader = () => (
  <div className="bg-gray-50 border-b px-6 py-4">
    <div className="grid grid-cols-8 gap-4">
      <Skeleton className="h-4 w-12" />
      <Skeleton className="h-4 w-16" />
      <Skeleton className="h-4 w-20" />
      <Skeleton className="h-4 w-14" />
      <Skeleton className="h-4 w-18" />
      <Skeleton className="h-4 w-16" />
      <Skeleton className="h-4 w-20" />
      <Skeleton className="h-4 w-14" />
    </div>
  </div>
);

const SkeletonTableRow = ({
  showBalance = false,
}: {
  showBalance?: boolean;
}) => (
  <div className="border-b px-6 py-4">
    <div className="grid grid-cols-8 gap-4 items-center">
      <Skeleton className="h-4 w-16" />
      <Skeleton className="h-4 w-24" />
      <div className="space-y-1">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-3 w-16" />
      </div>
      <Skeleton className="h-6 w-16 rounded-full" />
      <div className="space-y-1">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-3 w-20" />
      </div>
      <Skeleton className="h-4 w-20" />
      {showBalance && <Skeleton className="h-4 w-24" />}
      <div className="flex space-x-2">
        <Skeleton className="h-8 w-8 rounded" />
        <Skeleton className="h-8 w-8 rounded" />
      </div>
    </div>
  </div>
);

const SkeletonTransactionTable = ({
  showBalance = false,
}: {
  showBalance?: boolean;
}) => (
  <Card>
    <CardHeader>
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>
    </CardHeader>
    <CardContent className="p-0">
      <div className="border rounded-lg overflow-hidden">
        <SkeletonTableHeader />
        <div className="divide-y">
          {Array.from({ length: 8 }).map((_, index) => (
            <SkeletonTableRow key={index} showBalance={showBalance} />
          ))}
        </div>
      </div>

      {/* Pagination skeleton */}
      <div className="flex items-center justify-between px-6 py-4 border-t">
        <Skeleton className="h-4 w-32" />
        <div className="flex items-center space-x-2">
          <Skeleton className="h-8 w-8 rounded" />
          <Skeleton className="h-8 w-8 rounded" />
          <Skeleton className="h-8 w-8 rounded" />
          <Skeleton className="h-8 w-8 rounded" />
          <Skeleton className="h-8 w-8 rounded" />
        </div>
      </div>
    </CardContent>
  </Card>
);

const SkeletonStatsCards = () => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-green-100 rounded-lg">
            <TrendingUp className="h-6 w-6 text-green-600" />
          </div>
          <div className="space-y-1">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-6 w-24" />
          </div>
        </div>
      </CardContent>
    </Card>

    <Card>
      <CardContent className="p-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-red-100 rounded-lg">
            <TrendingDown className="h-6 w-6 text-red-600" />
          </div>
          <div className="space-y-1">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-6 w-24" />
          </div>
        </div>
      </CardContent>
    </Card>

    <Card>
      <CardContent className="p-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <DollarSign className="h-6 w-6 text-blue-600" />
          </div>
          <div className="space-y-1">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-6 w-24" />
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
);

const LoadingSkeleton = ({
  showBalance = false,
}: {
  showBalance?: boolean;
}) => (
  <div className="w-full h-full relative">
    {/* Header Skeleton */}
    <div className="sticky top-16 z-40 bg-background border-b">
      <div className="flex h-16 shrink-0 items-center gap-2 md:px-1 px-2">
        <div className="flex items-center justify-between flex-1">
          <Skeleton className="h-8 w-40 md:ml-5" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
        </div>
      </div>
    </div>

    <div className="flex flex-col w-full">
      <div className="flex flex-1 flex-col gap-4 p-2 md:p-6">
        {/* Stats Cards Skeleton */}
        <SkeletonStatsCards />

        {/* Filter Card Skeleton */}
        <SkeletonFilterCard />

        {/* Transaction Table Skeleton */}
        <SkeletonTransactionTable showBalance={showBalance} />
      </div>
    </div>
  </div>
);

const ErrorState = ({ onRetry }: { onRetry?: () => void }) => (
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
        <Card>
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center">
                <AlertTriangle className="h-12 w-12 text-red-500" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-medium text-red-800">
                  Terjadi Kesalahan
                </h3>
                <p className="text-sm text-red-600">
                  Gagal memuat data transaksi kas. Silakan coba lagi atau
                  hubungi administrator.
                </p>
              </div>
              {onRetry && (
                <button
                  onClick={onRetry}
                  className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                >
                  Coba Lagi
                </button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
);

export default function TransaksiKas() {
  const { data: session, status } = useSession();
  const canDelete = session?.role === "OWNER";
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
  const displayTransactions =
    transactions?.map((transaction) =>
      formatTransactionForDisplay(transaction, customerList || [])
    ) || [];

  // Show main loading skeleton during initial load
  if (status === "loading" || (isLoading && !transactions)) {
    return <LoadingSkeleton showBalance={session?.role === "OWNER"} />;
  }

  // Check if user is authenticated
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
    return <ErrorState />;
  }

  // Handler functions
  const handleFilterChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
  };

  const handleCreateTransaction = async (data: Partial<Transaction>) => {
    await createTransactionHandler(
      data,
      customerList || [],
      async (cleanData) => {
        await createTransaction(cleanData);
      }
    );
  };

  const handleUpdateTransaction = async (
    id: string,
    data: Partial<Transaction>
  ) => {
    await updateTransactionHandler(
      id,
      data,
      customerList || [],
      async (id, cleanData) => {
        await updateTransaction(id, cleanData);
      }
    );
  };

  const handleDeleteTransaction = async (id: string) => {
    await deleteTransaction(id);
  };

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
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    <span>Loading...</span>
                  </div>
                ) : (
                  `${filters.month}/${filters.year}`
                )}
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
              {isLoading ? (
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-4 items-end">
                    <div className="flex flex-col space-y-2">
                      <Skeleton className="h-4 w-12" />
                      <Skeleton className="h-10 w-32" />
                    </div>
                    <div className="flex flex-col space-y-2">
                      <Skeleton className="h-4 w-14" />
                      <Skeleton className="h-10 w-24" />
                    </div>
                    <div className="flex gap-2">
                      <Skeleton className="h-10 w-20" />
                      <Skeleton className="h-10 w-24" />
                    </div>
                  </div>
                </div>
              ) : (
                <TransactionFilters
                  filters={filters}
                  onFiltersChange={handleFilterChange}
                  onExportClick={() => setIsExportModalOpen(true)}
                  isExportDisabled={isLoading || !transactions?.length}
                />
              )}
            </CardContent>
          </Card>

          {/* Transaction Table - ALWAYS SHOW */}
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
              {isLoading ? (
                <div className="space-y-4 p-6">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-10 w-32" />
                    <Skeleton className="h-10 w-24" />
                  </div>
                  <div className="border rounded-lg overflow-hidden">
                    <SkeletonTableHeader />
                    <div className="divide-y">
                      {Array.from({ length: 8 }).map((_, index) => (
                        <SkeletonTableRow
                          key={index}
                          showBalance={session?.role === "OWNER"}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                // ALWAYS SHOW TransactionTable - whether data exists or not
                <TransactionTable
                  transactions={transactions || []}
                  customerList={customerList || []}
                  displayTransactions={displayTransactions}
                  loading={isLoading}
                  showRunningBalance={session?.role === "OWNER"}
                  onAdd={handleCreateTransaction}
          onUpdate={handleUpdateTransaction}
          onDelete={handleDeleteTransaction}
          canDelete={canDelete}
                />
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Export Excel Modal */}
      <TransactionExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        transactions={transactions || []}
        customers={customerList || []}
      />
    </div>
  );
}
