"use client";

import { useState } from "react";
import { Transaction } from "@/types/transaction";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Download, Search, X, FileSpreadsheet } from "lucide-react";
import { toast } from "sonner";
import { handleExportExcel } from "./transaction-export";

interface TransactionExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: Transaction[];
  customers: { id: string; name: string }[];
}

export function TransactionExportModal({
  isOpen,
  onClose,
  transactions,
  customers,
}: TransactionExportModalProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [exportType, setExportType] = useState<"all" | "filtered">("all");

  // Filter customers based on search term
  const filteredCustomers = customers.filter((customer) =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId);

  // Filter transactions based on selected customer
  const filteredTransactions = selectedCustomerId
    ? transactions.filter((t) => t.customerId === selectedCustomerId)
    : transactions;

  const handleExport = async () => {
    if (exportType === "filtered" && !selectedCustomerId) {
      toast.error("Pilih customer untuk export data");
      return;
    }

    setIsLoading(true);
    try {
      const transactionsToExport =
        exportType === "filtered" ? filteredTransactions : transactions;
      await handleExportExcel(transactionsToExport, customers);
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

  const handleCustomerSelect = (customer: { id: string; name: string }) => {
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
            Export Data Transaksi
          </DialogTitle>
          <DialogDescription>
            Export semua transaksi atau filter berdasarkan customer tertentu
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Export Type Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Tipe Export</label>
            <div className="flex gap-2">
              <Button
                variant={exportType === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setExportType("all")}
                className="flex-1"
              >
                <FileSpreadsheet className="w-4 h-4 mr-2" />
                Semua Transaksi
              </Button>
              <Button
                variant={exportType === "filtered" ? "default" : "outline"}
                size="sm"
                onClick={() => setExportType("filtered")}
                className="flex-1"
              >
                <Search className="w-4 h-4 mr-2" />
                Filter Customer
              </Button>
            </div>
          </div>

          {/* Customer Search (only show when filtered export is selected) */}
          {exportType === "filtered" && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Cari Customer</label>
              <div className="relative">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Ketik nama customer..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    onFocus={() =>
                      searchTerm.length > 0 && setShowDropdown(true)
                    }
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
          )}

          {/* Selected Customer Preview */}
          {exportType === "filtered" && selectedCustomer && (
            <div className="relative p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200 shadow-sm">
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
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-green-400 to-emerald-400 rounded-b-lg"></div>
            </div>
          )}

          {/* Export Summary */}
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="text-sm text-blue-800">
              <span className="font-medium">Info:</span>{" "}
              {exportType === "all"
                ? `Export akan menghasilkan file Excel dengan ${transactions.length} transaksi.`
                : `Export akan menghasilkan file Excel dengan ${filteredTransactions.length} transaksi untuk customer "${selectedCustomer?.name || ""}".`}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            Batal
          </Button>
          <Button
            onClick={handleExport}
            disabled={
              (exportType === "filtered" && !selectedCustomerId) || isLoading
            }
            className="bg-green-600 hover:bg-green-700"
          >
            {isLoading ? "Mengexport..." : "Export Excel"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
