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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

// Constants
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

// Search Hook with debounce
const useCustomerSearch = (onSearch: (searchTerm: string) => void) => {
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

  return {
    searchTerm,
    handleSearchChange,
  };
};

// Customer Actions Component
interface CustomerActionsProps {
  onSearch: (searchTerm: string) => void;
  onMerge: (primaryId: string, duplicateId: string) => void;
  canMerge: boolean;
}

function CustomerActions({
  onSearch,
  canMerge,
}: Omit<CustomerActionsProps, "onMerge">) {
  const { searchTerm, handleSearchChange } = useCustomerSearch(onSearch);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pencarian & Aksi</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center">
          <div className="flex gap-4">
            <div className="relative">
              <Input
                type="text"
                placeholder="Cari customer..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="min-w-[300px]"
              />
            </div>
          </div>

          {canMerge && <Button variant="outline">Gabung Customer</Button>}
        </div>
      </CardContent>
    </Card>
  );
}

// Pagination Component
interface CustomerPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

function CustomerPagination({
  currentPage,
  totalPages,
  onPageChange,
}: CustomerPaginationProps) {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex justify-center gap-2">
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
      </CardContent>
    </Card>
  );
}

// Main Component
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
    // Since there's no delete in the service, we might want to implement soft delete
    // or show a message that deletion is not allowed due to business rules
    console.log("Delete not implemented - consider merge instead", id);
  };

  const handleDownloadReport = async (customerId: string) => {
    try {
      const reportData = await downloadReport(customerId);
      // Implement Excel download logic here
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
    <div className="p-6 space-y-6">
      {/* Search and Actions */}
      <CustomerActions
        onSearch={handleSearch}
        canMerge={user?.role === "OWNER" || user?.role === "TECHNICIAN"}
      />

      {/* Customer Table */}
      <ExcelTable
        title="Data Customer"
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

      {/* Pagination */}
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
