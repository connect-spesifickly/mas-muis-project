"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { AddPatientDialog } from "./_components/AddPatientDialog";
import { ServiceQueueTable } from "./_components/ServiceQueueTable";
import { useSession } from "next-auth/react";
import { Loader2, Users, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

// Skeleton Components
const SkeletonTableRow = () => (
  <tr className="border-b">
    <td className="p-4">
      <Skeleton className="h-4 w-16" />
    </td>
    <td className="p-4">
      <div className="space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-24" />
      </div>
    </td>
    <td className="p-4">
      <Skeleton className="h-4 w-28" />
    </td>
    <td className="p-4">
      <Skeleton className="h-4 w-20" />
    </td>
    <td className="p-4">
      <Skeleton className="h-6 w-20 rounded-full" />
    </td>
    <td className="p-4">
      <Skeleton className="h-4 w-24" />
    </td>
    <td className="p-4">
      <div className="flex space-x-2">
        <Skeleton className="h-8 w-16" />
        <Skeleton className="h-8 w-16" />
      </div>
    </td>
  </tr>
);

const SkeletonTable = () => (
  <div className="border rounded-lg overflow-hidden">
    <div className="bg-gray-50 border-b">
      <div className="grid grid-cols-7 gap-4 p-4">
        <Skeleton className="h-4 w-8" />
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-12" />
        <Skeleton className="h-4 w-18" />
        <Skeleton className="h-4 w-14" />
      </div>
    </div>
    <table className="w-full">
      <tbody>
        {Array.from({ length: 5 }).map((_, index) => (
          <SkeletonTableRow key={index} />
        ))}
      </tbody>
    </table>
  </div>
);

const SkeletonCard = () => (
  <Card>
    <CardHeader>
      <div className="space-y-2">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-80" />
      </div>
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        {/* Header section with stats and button */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-gray-400" />
            <Skeleton className="h-4 w-32" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>

        {/* Table skeleton */}
        <SkeletonTable />
      </div>
    </CardContent>
  </Card>
);

const LoadingSkeleton = () => (
  <div className="w-full h-full relative">
    {/* Header Skeleton */}
    <div className="sticky top-16 z-40 bg-background border-b">
      <div className="flex h-16 shrink-0 items-center gap-2 md:px-1 px-2">
        <div className="flex items-center justify-between flex-1">
          <Skeleton className="h-8 w-40 md:ml-5" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
        </div>
      </div>
    </div>

    <div className="flex flex-col w-full">
      <div className="flex flex-1 flex-col gap-4 p-2 md:p-6">
        <SkeletonCard />
      </div>
    </div>
  </div>
);

const TableLoadingSkeleton = () => (
  <div className="flex items-center justify-center h-48">
    <div className="text-center space-y-3">
      <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
      <div className="space-y-1">
        <Skeleton className="h-4 w-32 mx-auto" />
        <Skeleton className="h-3 w-24 mx-auto" />
      </div>
    </div>
  </div>
);

const ErrorState = ({ onRetry }: { onRetry: () => void }) => (
  <div className="w-full h-full relative">
    <div className="sticky top-16 z-40 bg-background border-b">
      <div className="flex h-16 shrink-0 items-center gap-2 md:px-1 px-2">
        <div className="flex items-center justify-between flex-1">
          <h1 className="text-2xl md:text-3xl font-bold md:px-5 font-[stencil]">
            Antrian Pasien
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
                  Gagal Memuat Data
                </h3>
                <p className="text-sm text-red-600">
                  Terjadi kesalahan saat memuat antrian pasien. Silakan coba
                  lagi.
                </p>
              </div>
              <button
                onClick={onRetry}
                className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
              >
                <Loader2 className="w-4 h-4 mr-2" />
                Coba Lagi
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
);

const EmptyState = () => (
  <div className="text-center py-12 space-y-4">
    <div className="flex items-center justify-center">
      <Users className="h-16 w-16 text-gray-400" />
    </div>
    <div className="space-y-2">
      <h3 className="text-lg font-medium text-gray-900">Belum Ada Antrian</h3>
      <p className="text-sm text-gray-500">
        Belum ada pasien dalam antrian. Tambahkan pasien baru untuk memulai.
      </p>
    </div>
  </div>
);

export default function PatientQueuePage() {
  const { data: session, status } = useSession();
  const [services, setServices] = useState<[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tableLoading, setTableLoading] = useState(false);

  const fetchServices = useCallback(
    async (showTableLoading = false) => {
      if (showTableLoading) {
        setTableLoading(true);
      } else {
        setLoading(true);
      }

      setError(null);

      if (!session?.accessToken) {
        setLoading(false);
        setTableLoading(false);
        return;
      }

      try {
        console.log(
          "Fetching services with token:",
          session.accessToken.substring(0, 20) + "..."
        );

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/services`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${session.accessToken}`,
            },
          }
        );

        console.log("Services API response status:", res.status);

        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }

        const data = await res.json();
        console.log("Services API response data:", data);
        console.log("Data Services:", data.data.data);

        setServices(data.data.data || []);
        setError(null);
      } catch (error) {
        console.error("Services fetch error:", error);
        setError(
          error instanceof Error ? error.message : "Gagal memuat antrian pasien"
        );
        setServices([]);
        toast.error("Gagal memuat antrian pasien.");
      } finally {
        setLoading(false);
        setTableLoading(false);
      }
    },
    [session]
  );

  const handleRetry = useCallback(() => {
    fetchServices();
  }, [fetchServices]);

  const handleRefresh = useCallback(() => {
    fetchServices(true);
  }, [fetchServices]);

  useEffect(() => {
    if (status === "authenticated") {
      fetchServices();
    } else if (status === "unauthenticated") {
      setLoading(false);
    }
  }, [fetchServices, status]);

  // Show loading skeleton during initial load
  if (status === "loading" || (loading && services.length === 0)) {
    return <LoadingSkeleton />;
  }

  // Show auth error
  if (status === "unauthenticated") {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="mb-4">
            <AlertTriangle className="mx-auto h-12 w-12 text-red-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Akses Terbatas
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            Anda harus login untuk mengakses halaman antrian pasien.
          </p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error && services.length === 0) {
    return <ErrorState onRetry={handleRetry} />;
  }

  return (
    <div className="w-full h-full relative">
      <div className="sticky top-16 z-40 bg-background border-b">
        <div className="flex h-16 shrink-0 items-center gap-2 md:px-1 px-2">
          <div className="flex items-center justify-between flex-1">
            <h1 className="text-2xl md:text-3xl font-bold md:px-5 font-[stencil]">
              Antrian Pasien
            </h1>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-sm">
                {loading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    <span>Loading...</span>
                  </div>
                ) : (
                  `${services.length} Services`
                )}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col w-full">
        <div className="flex flex-1 flex-col gap-4 p-2 md:p-6">
          {/* Patient Queue Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Daftar Antrian Pasien</CardTitle>
              <p className="text-sm text-muted-foreground">
                Kelola daftar perangkat yang sedang diservis dan status layanan
              </p>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Users className="w-5 h-5 text-primary" />
                  <span className="text-sm font-medium">
                    {loading ? (
                      <Skeleton className="h-4 w-32 inline-block" />
                    ) : (
                      `Total Services: ${services.length}`
                    )}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {!loading && (
                    <button
                      onClick={handleRefresh}
                      disabled={tableLoading}
                      className="inline-flex items-center px-3 py-1.5 text-sm bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors disabled:opacity-50"
                    >
                      {tableLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        "Refresh"
                      )}
                    </button>
                  )}
                  <AddPatientDialog
                    onServiceAdded={() => fetchServices(true)}
                  />
                </div>
              </div>

              {/* Content Area */}
              {loading || tableLoading ? (
                <TableLoadingSkeleton />
              ) : error ? (
                <div className="text-center py-8 space-y-4">
                  <AlertTriangle className="h-12 w-12 text-red-500 mx-auto" />
                  <div className="space-y-2">
                    <h3 className="text-lg font-medium text-red-800">
                      Gagal Memuat Data
                    </h3>
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                  <button
                    onClick={handleRetry}
                    className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                  >
                    Coba Lagi
                  </button>
                </div>
              ) : services.length === 0 ? (
                <EmptyState />
              ) : (
                <ServiceQueueTable
                  services={services}
                  onStatusUpdated={() => fetchServices(true)}
                />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
