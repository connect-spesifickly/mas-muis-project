"use client";

import { useState, useCallback } from "react";
import { useUser } from "@/hooks/use-user";
import ExcelTable from "@/components/excel-table";
import { useCustomers } from "@/hooks/use-customer";
import {
  Customer,
  CreateCustomerData,
  UpdateCustomerData,
} from "@/types/customer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function CustomerActions({
  onSearch,
  canMerge,
}: {
  onSearch: (searchTerm: string) => void;
  canMerge: boolean;
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useCallback(
    debounce((term: unknown) => {
      onSearch(term as string);
    }, 300),
    [onSearch]
  );
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    debouncedSearch(value);
  };
  return (
    <Card className="shadow-md rounded-xl border-0 bg-gradient-to-r from-blue-50 to-white/80 mb-2">
      <CardContent className="py-4 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex gap-4 w-full md:w-auto">
          <Input
            type="text"
            placeholder="Cari customer..."
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="min-w-[220px] rounded-lg border-gray-300 bg-white/80 focus:ring-2 focus:ring-blue-200 px-4 py-2 text-sm"
          />
        </div>
        {canMerge && (
          <Button
            variant="outline"
            className="rounded-lg bg-blue-100 text-blue-700 hover:bg-blue-200 transition-all shadow-sm px-4 py-2"
          >
            Gabung Customer
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

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
        className="rounded-lg px-3 py-1"
      >
        Previous
      </Button>
      {pages.map((page) => (
        <Button
          key={page}
          onClick={() => onPageChange(page)}
          variant={page === currentPage ? "default" : "outline"}
          className={`rounded-lg px-3 py-1 ${page === currentPage ? "bg-blue-600 text-white" : ""}`}
        >
          {page}
        </Button>
      ))}
      <Button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        variant="outline"
        className="rounded-lg px-3 py-1"
      >
        Next
      </Button>
    </div>
  );
}

// Simple debounce function
function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
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
  const [filters, setFilters] = useState({
    search: "",
    page: 1,
    limit: 20,
  });
  const {
    customers,
    pagination,
    isLoading,
    error,
    createCustomer,
    updateCustomer,
    downloadReport,
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
      const reportData = await downloadReport(customerId);
      console.log("Download report:", reportData);
    } catch (error) {
      console.error("Failed to download report:", error);
    }
  };
  const handleSearch = (searchTerm: string) => {
    setFilters((prev) => ({ ...prev, search: searchTerm, page: 1 }));
  };
  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };
  if (isLoading && customers.length === 0)
    return <div className="p-6">Loading...</div>;
  if (error)
    return <div className="p-6 text-red-500">Error: {error.message}</div>;
  return (
    <div className="p-0 md:p-4 max-w-7xl w-full mx-auto">
      <h1 className="text-2xl md:text-3xl font-bold text-blue-700 mb-2 mt-2 md:mt-4">
        Data Customer
      </h1>
      <p className="text-gray-500 mb-4 text-sm md:text-base">
        Kelola data customer dengan mudah, pencarian cepat, dan tampilan nyaman.
      </p>
      <CustomerActions
        onSearch={handleSearch}
        canMerge={user?.role === "OWNER" || user?.role === "TECHNICIAN"}
      />
      <div className="my-4 border-t border-gray-200" />
      <Card className="shadow-lg rounded-2xl border-0 bg-white/90 w-full">
        <CardContent className="p-0 md:p-4">
          <ExcelTable
            title=""
            data={customers}
            columns={CUSTOMER_COLUMNS}
            onAdd={handleCreateCustomer}
            onUpdate={handleUpdateCustomer}
            onDelete={handleDeleteCustomer}
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
      {pagination.totalPages > 1 && (
        <CustomerPagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
}
