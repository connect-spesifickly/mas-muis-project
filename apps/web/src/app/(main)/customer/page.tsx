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
import { Badge } from "@/components/ui/badge";
import { Search, Users, Download } from "lucide-react";

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
    <div className="flex flex-col sm:flex-row gap-4 items-center">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-[10px] h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Cari customer..."
          value={searchTerm}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>
      {canMerge && (
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <Users className="w-4 h-4" />
          Gabung Customer
        </Button>
      )}
    </div>
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
          {/* Search and Actions Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Pencarian & Aksi</CardTitle>
            </CardHeader>
            <CardContent>
              <CustomerActions
                onSearch={handleSearch}
                canMerge={user?.role === "OWNER" || user?.role === "TECHNICIAN"}
              />
            </CardContent>
          </Card>

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
    </div>
  );
}
