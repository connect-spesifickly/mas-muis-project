"use client";

import { Calendar, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TransactionFiltersProps {
  filters: { month: number; year: number };
  onFiltersChange: (filters: { month: number; year: number }) => void;
  onExportClick: () => void;
  isExportDisabled?: boolean;
}

export function TransactionFilters({
  filters,
  onFiltersChange,
  onExportClick,
  isExportDisabled = false,
}: TransactionFiltersProps) {
  const months = [
    { value: 1, label: "Januari" },
    { value: 2, label: "Februari" },
    { value: 3, label: "Maret" },
    { value: 4, label: "April" },
    { value: 5, label: "Mei" },
    { value: 6, label: "Juni" },
    { value: 7, label: "Juli" },
    { value: 8, label: "Agustus" },
    { value: 9, label: "September" },
    { value: 10, label: "Oktober" },
    { value: 11, label: "November" },
    { value: 12, label: "Desember" },
  ];

  const years = Array.from(
    { length: 10 },
    (_, i) => new Date().getFullYear() - i
  );

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-center justify-between w-full">
      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium text-muted-foreground">
            Periode:
          </span>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <select
            value={filters.month}
            onChange={(e) =>
              onFiltersChange({ ...filters, month: Number(e.target.value) })
            }
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
          >
            {months.map((month) => (
              <option key={month.value} value={month.value}>
                {month.label}
              </option>
            ))}
          </select>

          <select
            value={filters.year}
            onChange={(e) =>
              onFiltersChange({ ...filters, year: Number(e.target.value) })
            }
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
          >
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
      </div>

      <Button
        variant="outline"
        size="sm"
        className="flex items-center gap-2 bg-green-50 border-green-200 hover:bg-green-100 text-green-700"
        onClick={onExportClick}
        disabled={isExportDisabled}
      >
        <Download className="w-4 h-4" />
        Export Excel
      </Button>
    </div>
  );
}
