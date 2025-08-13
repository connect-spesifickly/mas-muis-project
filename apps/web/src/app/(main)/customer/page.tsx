"use client";

import { useState } from "react";
import { useUser } from "@/hooks/use-user";
import { useSession } from "next-auth/react";
import ExcelTable from "@/components/excel-table";
import { useCustomers } from "@/hooks/use-customer";
import {
  Customer,
  CreateCustomerData,
  UpdateCustomerData,
  MergeCustomerData,
} from "@/types/customer";

interface CustomerReportData {
  id: string;
  name: string;
  phone: string;
  address?: string;
  notes?: string;
  services: Array<{
    id: string;
    createdAt: string;
    devices: Array<{
      deviceType: string;
      problemDescription: string;
      accessoriesLeft: string;
      status: string;
      completedAt?: string;
    }>;
  }>;
  transactions: Array<{
    id: string;
    transactionDate: string;
    description: string;
    amount: number;
    type: string;
  }>;
}
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Users, AlertTriangle, Download, Search, X } from "lucide-react";
import { toast } from "sonner";
import * as XLSX from "xlsx";

function CustomerPagination({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  return (
    <div className="flex justify-center gap-2 mt-4">
      <Button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        variant="outline"
        size="sm"
      >
        Previous
      </Button>
      {pages.map((page) => (
        <Button
          key={page}
          onClick={() => onPageChange(page)}
          variant={page === currentPage ? "default" : "outline"}
          size="sm"
        >
          {page}
        </Button>
      ))}
      <Button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        variant="outline"
        size="sm"
      >
        Next
      </Button>
    </div>
  );
}

function MergeCustomerModal({
  isOpen,
  onClose,
  customers,
  onMerge,
}: {
  isOpen: boolean;
  onClose: () => void;
  customers: Customer[];
  onMerge: (data: MergeCustomerData) => Promise<void>;
}) {
  const [primaryCustomerId, setPrimaryCustomerId] = useState<string>("");
  const [duplicateCustomerId, setDuplicateCustomerId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const handleMerge = async () => {
    if (!primaryCustomerId || !duplicateCustomerId) {
      toast.error("Pilih kedua customer untuk digabungkan");
      return;
    }

    if (primaryCustomerId === duplicateCustomerId) {
      toast.error("Tidak bisa menggabungkan customer yang sama");
      return;
    }

    setIsLoading(true);
    try {
      await onMerge({
        primaryCustomerId,
        duplicateCustomerId,
      });
      onClose();
      setPrimaryCustomerId("");
      setDuplicateCustomerId("");
    } catch (error) {
      console.error("Merge failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const primaryCustomer = customers.find((c) => c.id === primaryCustomerId);
  const duplicateCustomer = customers.find((c) => c.id === duplicateCustomerId);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Gabung Customer
          </DialogTitle>
          <DialogDescription>
            Pilih dua customer yang akan digabungkan. Customer pertama akan
            menjadi customer utama, dan customer kedua akan dihapus setelah data
            digabungkan.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Primary Customer Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Customer Utama</label>
            <Select
              value={primaryCustomerId}
              onValueChange={setPrimaryCustomerId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih customer utama" />
              </SelectTrigger>
              <SelectContent>
                {customers.map((customer) => (
                  <SelectItem key={customer.id} value={customer.id}>
                    {customer.name} - {customer.phone}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {primaryCustomer && (
              <div className="p-3 bg-blue-50 rounded-lg text-sm">
                <div className="font-medium">{primaryCustomer.name}</div>
                <div className="text-gray-600">{primaryCustomer.phone}</div>
                {primaryCustomer.address && (
                  <div className="text-gray-600">{primaryCustomer.address}</div>
                )}
              </div>
            )}
          </div>

          {/* Duplicate Customer Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Customer yang Akan Dihapus
            </label>
            <Select
              value={duplicateCustomerId}
              onValueChange={setDuplicateCustomerId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih customer yang akan dihapus" />
              </SelectTrigger>
              <SelectContent>
                {customers
                  .filter((customer) => customer.id !== primaryCustomerId)
                  .map((customer) => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.name} - {customer.phone}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            {duplicateCustomer && (
              <div className="p-3 bg-red-50 rounded-lg text-sm">
                <div className="font-medium">{duplicateCustomer.name}</div>
                <div className="text-gray-600">{duplicateCustomer.phone}</div>
                {duplicateCustomer.address && (
                  <div className="text-gray-600">
                    {duplicateCustomer.address}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Warning */}
          {primaryCustomer && duplicateCustomer && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center gap-2 text-yellow-800">
                <AlertTriangle className="w-4 h-4" />
                <span className="text-sm font-medium">Peringatan</span>
              </div>
              <p className="text-sm text-yellow-700 mt-1">
                Customer &quot;{duplicateCustomer.name}&quot; akan dihapus
                setelah digabungkan dengan &quot;{primaryCustomer.name}&quot;.
                Tindakan ini tidak dapat dibatalkan.
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Batal
          </Button>
          <Button
            onClick={handleMerge}
            disabled={!primaryCustomerId || !duplicateCustomerId || isLoading}
            className="bg-red-600 hover:bg-red-700"
          >
            {isLoading ? "Menggabungkan..." : "Gabungkan Customer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ExportExcelModal({
  isOpen,
  onClose,
  customers,
  onExport,
}: {
  isOpen: boolean;
  onClose: () => void;
  customers: Customer[];
  onExport: (customerId: string) => Promise<void>;
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  // Filter customers based on search term
  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone.includes(searchTerm)
  );

  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId);

  const handleExport = async () => {
    if (!selectedCustomerId) {
      toast.error("Pilih customer untuk export data");
      return;
    }

    setIsLoading(true);
    try {
      await onExport(selectedCustomerId);
      onClose();
      setSearchTerm("");
      setSelectedCustomerId("");
      setShowDropdown(false);
    } catch (error) {
      console.error("Export failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    onClose();
    setSearchTerm("");
    setSelectedCustomerId("");
    setShowDropdown(false);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setShowDropdown(e.target.value.length > 0);
    setSelectedCustomerId(""); // Clear selection when searching
  };

  const handleCustomerSelect = (customer: Customer) => {
    setSelectedCustomerId(customer.id);
    setSearchTerm(customer.name);
    setShowDropdown(false);
  };

  const clearSearch = () => {
    setSearchTerm("");
    setSelectedCustomerId("");
    setShowDropdown(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="w-5 h-5" />
            Export Data Customer
          </DialogTitle>
          <DialogDescription>
            Ketik nama atau nomor HP customer untuk mencari dan export datanya
            ke file Excel.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search Input with Dropdown */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Cari Customer</label>
            <div className="relative">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Ketik nama atau nomor HP customer..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  onFocus={() => searchTerm.length > 0 && setShowDropdown(true)}
                  className="pl-10 pr-10"
                />
                {searchTerm && (
                  <button
                    onClick={clearSearch}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Dropdown Results */}
              {showDropdown && searchTerm && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {filteredCustomers.length > 0 ? (
                    filteredCustomers.map((customer) => (
                      <div
                        key={customer.id}
                        onClick={() => handleCustomerSelect(customer)}
                        className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                      >
                        <div className="font-medium text-gray-900">
                          {customer.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {customer.phone}
                        </div>
                        {customer.address && (
                          <div className="text-xs text-gray-400 mt-1 truncate">
                            {customer.address}
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="p-3 text-gray-500 text-center">
                      Tidak ada customer ditemukan
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Selected Customer Preview */}
          {selectedCustomer && (
            <div className="relative p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200 shadow-sm">
              {/* Customer Info */}
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <svg
                    className="w-3 h-3 text-green-600 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    ></path>
                  </svg>
                  <span className="text-sm font-semibold text-green-900">
                    {selectedCustomer.name}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <svg
                    className="w-3 h-3 text-green-600 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    ></path>
                  </svg>
                  <span className="text-xs text-green-700 font-medium">
                    {selectedCustomer.phone}
                  </span>
                </div>

                {selectedCustomer.address && (
                  <div className="flex items-start gap-2">
                    <svg
                      className="w-3 h-3 text-green-600 flex-shrink-0 mt-0.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      ></path>
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      ></path>
                    </svg>
                    <span className="text-xs text-green-600 leading-relaxed">
                      {selectedCustomer.address}
                    </span>
                  </div>
                )}
              </div>

              {/* Bottom accent */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-green-400 to-emerald-400 rounded-b-lg"></div>
            </div>
          )}

          {/* Info */}
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="text-sm text-blue-800">
              <span className="font-medium">Info:</span> Export akan
              menghasilkan file Excel dengan data lengkap customer termasuk
              riwayat service dan transaksi.
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            Batal
          </Button>
          <Button
            onClick={handleExport}
            disabled={!selectedCustomerId || isLoading}
            className="bg-green-600 hover:bg-green-700"
          >
            {isLoading ? "Mengexport..." : "Export Excel"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Customer Loading Skeleton Component
function CustomerSkeleton() {
  return (
    <div className="w-full h-full relative">
      {/* Header Skeleton */}
      <div className="sticky top-16 z-40 bg-background border-b">
        <div className="flex h-16 shrink-0 items-center gap-2 md:px-1 px-2">
          <div className="flex items-center justify-between flex-1">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-6 w-20" />
          </div>
        </div>
      </div>

      <div className="flex flex-col w-full">
        <div className="flex flex-1 flex-col gap-4 p-2 md:p-6">
          {/* Customer Table Skeleton */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-6 w-40" />
                  <Skeleton className="h-4 w-80" />
                </div>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-9 w-36" />
                  <Skeleton className="h-9 w-32" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {/* Table Header */}
              <div className="border-b">
                <div className="px-6 py-4">
                  <div className="flex items-center justify-between mb-4">
                    <Skeleton className="h-9 w-64" /> {/* Search bar */}
                    <Skeleton className="h-9 w-24" /> {/* Add button */}
                  </div>

                  {/* Table Headers */}
                  <div className="grid grid-cols-6 gap-4">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                </div>
              </div>

              {/* Table Rows */}
              <div className="divide-y">
                {Array.from({ length: 10 }).map((_, index) => (
                  <div key={index} className="px-6 py-4">
                    <div className="grid grid-cols-6 gap-4 items-center">
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-20" />
                      </div>
                      <Skeleton className="h-4 w-28" />
                      <div className="space-y-1">
                        <Skeleton className="h-3 w-full" />
                        <Skeleton className="h-3 w-3/4" />
                      </div>
                      <Skeleton className="h-3 w-24" />
                      <Skeleton className="h-4 w-20" />
                      <div className="flex items-center gap-1">
                        <Skeleton className="h-8 w-8 rounded" />
                        <Skeleton className="h-8 w-8 rounded" />
                        <Skeleton className="h-8 w-8 rounded" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Table Footer */}
              <div className="border-t px-6 py-4">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-48" />
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-8 w-20" />
                    <Skeleton className="h-8 w-8" />
                    <Skeleton className="h-8 w-8" />
                    <Skeleton className="h-8 w-8" />
                    <Skeleton className="h-8 w-16" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pagination Skeleton */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-center gap-2">
                <Skeleton className="h-9 w-20" />
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-9 w-9" />
                ))}
                <Skeleton className="h-9 w-16" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

const CUSTOMER_COLUMNS = [
  {
    key: "name",
    label: "Nama Customer",
    type: "text" as const,
    required: true,
  },
  { key: "phone", label: "Telepon", type: "text" as const, required: true },
  { key: "address", label: "Alamat", type: "textarea" as const },
  { key: "notes", label: "Catatan", type: "textarea" as const },
  { key: "createdAt", label: "Tanggal Bergabung", type: "date" as const },
];

export default function DataCustomer() {
  const { user } = useUser();
  const { data: session } = useSession();
  const canDelete = session?.role === "OWNER";
  const [filters, setFilters] = useState({
    search: "",
    page: 1,
    limit: 20,
  });
  const [isMergeModalOpen, setIsMergeModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  const {
    customers,
    pagination,
    isLoading,
    error,
    createCustomer,
    updateCustomer,
    mergeCustomers,
    mutate: mutateCustomers,
  } = useCustomers(filters);

  const handleCreateCustomer = async (data: Partial<Customer>) => {
    try {
      await createCustomer(data as CreateCustomerData);
    } catch (error) {
      console.error("Failed to create customer:", error);
    }
  };

  const handleUpdateCustomer = async (id: string, data: Partial<Customer>) => {
    try {
      await updateCustomer(id, data as UpdateCustomerData);
    } catch (error) {
      console.error("Failed to update customer:", error);
    }
  };

  const handleDeleteCustomer = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus customer ini?")) return;
    try {
      await fetch(`/api/customer/${id}`, {
        method: "DELETE",
      });
      mutateCustomers();
      toast.success("Customer berhasil dihapus");
    } catch (error) {
      console.error("Failed to delete customer:", error);
      toast.error("Gagal menghapus customer");
    }
  };

  const handleDownloadReport = async (customerId: string) => {
    try {
      console.log("Starting download report for customer:", customerId);

      // Get customer data from API
      const response = await fetch(
        `/api/customers/${customerId}/download-report`,
        {
          headers: {
            Authorization: `Bearer ${session?.accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Response status:", response.status);
      console.log("Response ok:", response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Response error:", errorText);
        throw new Error(
          `HTTP error! status: ${response.status}, message: ${errorText}`
        );
      }

      const result = await response.json();
      console.log("API response:", result);

      if (!result.data) {
        throw new Error("No data received from API");
      }

      const customerData: CustomerReportData = result.data;

      // Create Excel workbook with single table
      const workbook = XLSX.utils.book_new();

      // Create single long table with all data
      const tableData = [
        [
          "Nama",
          "No. HP",
          "Alamat",
          "Ket.",
          "Riwayat Service",
          "",
          "",
          "",
          "Riwayat Pembayaran",
          "",
          "",
        ],
        [
          "",
          "",
          "",
          "",
          "Tgl.",
          "Device",
          "Keadaan",
          "Status",
          "Tgl.",
          "Rincian",
          "Penerimaan",
        ],
      ];

      // Add services data
      if (customerData.services && customerData.services.length > 0) {
        customerData.services.forEach((service) => {
          service.devices.forEach((device) => {
            const serviceDate = new Date(service.createdAt).toLocaleDateString(
              "id-ID"
            );

            tableData.push([
              customerData.name,
              customerData.phone,
              customerData.address || "-",
              customerData.notes || "-",
              serviceDate,
              device.deviceType,
              device.problemDescription,
              device.status,
              "",
              "",
              "",
            ]);
          });
        });
      }

      // Add transactions data
      if (customerData.transactions && customerData.transactions.length > 0) {
        customerData.transactions.forEach((transaction) => {
          const transactionDate = new Date(
            transaction.transactionDate
          ).toLocaleDateString("id-ID");
          const amount = new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
          }).format(transaction.amount);

          tableData.push([
            customerData.name,
            customerData.phone,
            customerData.address || "-",
            customerData.notes || "-",
            "",
            "",
            "",
            "",
            transactionDate,
            transaction.description,
            amount,
          ]);
        });
      }

      // Create single sheet from table data
      const sheet = XLSX.utils.aoa_to_sheet(tableData);
      XLSX.utils.book_append_sheet(workbook, sheet, "Laporan Customer");

      // Generate Excel file
      const excelBuffer = XLSX.write(workbook, {
        bookType: "xlsx",
        type: "array",
      });
      const blob = new Blob([excelBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `laporan-customer-${customerData.name}-${new Date().toISOString().split("T")[0]}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("Laporan Excel berhasil diunduh");
    } catch (error) {
      console.error("Failed to download report:", error);
      toast.error("Gagal mengunduh laporan");
    }
  };

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  const handleMergeCustomers = async (data: MergeCustomerData) => {
    try {
      await mergeCustomers(data);
    } catch (error) {
      console.error("Failed to merge customers:", error);
    }
  };

  // Show skeleton loading when loading and no customers data
  if (isLoading && customers.length === 0) {
    return <CustomerSkeleton />;
  }

  if (error)
    return <div className="p-6 text-red-500">Error: {error.message}</div>;

  // Header actions for ExcelTable
  const headerActions = (
    <div className="flex items-center gap-2">
      {(user?.role === "OWNER" || user?.role === "TECHNICIAN") && (
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
          onClick={() => setIsMergeModalOpen(true)}
        >
          <Users className="w-4 h-4" />
          Gabung Customer
        </Button>
      )}

      {user?.role === "OWNER" && (
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-2 bg-green-50 border-green-200 hover:bg-green-100 text-green-700"
          onClick={() => setIsExportModalOpen(true)}
        >
          <Download className="w-4 h-4" />
          Export Excel
        </Button>
      )}
    </div>
  );

  return (
    <div className="w-full h-full relative">
      <div className="sticky top-16 z-40 bg-background border-b">
        <div className="flex h-16 shrink-0 items-center gap-2 md:px-1 px-2">
          <div className="flex items-center justify-between flex-1">
            <h1 className="text-2xl md:text-3xl font-bold md:px-5 font-[stencil]">
              Data Customer
            </h1>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-sm">
                {customers.length} Customer
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col w-full">
        <div className="flex flex-1 flex-col gap-4 p-2 md:p-6">
          {/* Customer Table */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Daftar Customer</CardTitle>
              <p className="text-sm text-muted-foreground">
                Kelola data customer dengan mudah, pencarian cepat, dan tampilan
                nyaman
              </p>
            </CardHeader>
            <CardContent className="p-0">
              <ExcelTable
                title=""
                data={customers}
                columns={CUSTOMER_COLUMNS}
                showDuplicate={false}
                onAdd={handleCreateCustomer}
                onUpdate={handleUpdateCustomer}
                onDelete={handleDeleteCustomer}
                canDelete={canDelete}
                headerActions={headerActions}
                customActions={[
                  {
                    label: "Download Report",
                    icon: "Download",
                    onClick: handleDownloadReport,
                    visible: user?.role === "OWNER",
                  },
                ]}
              />
            </CardContent>
          </Card>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <Card>
              <CardContent className="pt-6">
                <CustomerPagination
                  currentPage={pagination.currentPage}
                  totalPages={pagination.totalPages}
                  onPageChange={handlePageChange}
                />
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Merge Customer Modal */}
      <MergeCustomerModal
        isOpen={isMergeModalOpen}
        onClose={() => setIsMergeModalOpen(false)}
        customers={customers}
        onMerge={handleMergeCustomers}
      />

      {/* Export Excel Modal */}
      <ExportExcelModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        customers={customers}
        onExport={handleDownloadReport}
      />
    </div>
  );
}
