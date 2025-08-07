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
import { Users, AlertTriangle } from "lucide-react";
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
  const [filters, setFilters] = useState({
    search: "",
    page: 1,
    limit: 20,
  });
  const [isMergeModalOpen, setIsMergeModalOpen] = useState(false);

  const {
    customers,
    pagination,
    isLoading,
    error,
    createCustomer,
    updateCustomer,
    mergeCustomers,
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
    console.log("Delete not implemented - consider merge instead", id);
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

  if (isLoading && customers.length === 0)
    return <div className="p-6">Loading...</div>;

  if (error)
    return <div className="p-6 text-red-500">Error: {error.message}</div>;

  // Header actions for ExcelTable
  const headerActions = (user?.role === "OWNER" ||
    user?.role === "TECHNICIAN") && (
    <Button
      variant="outline"
      size="sm"
      className="flex items-center gap-2"
      onClick={() => setIsMergeModalOpen(true)}
    >
      <Users className="w-4 h-4" />
      Gabung Customer
    </Button>
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
    </div>
  );
}
