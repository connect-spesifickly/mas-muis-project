"use client";

import { Calendar } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface MonthYearFilterProps {
  selectedMonth: number;
  selectedYear: number;
  onMonthChange: (month: number) => void;
  onYearChange: (year: number) => void;
}

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
  (_, i) => new Date().getFullYear() - 5 + i
);

export function MonthYearFilter({
  selectedMonth,
  selectedYear,
  onMonthChange,
  onYearChange,
}: MonthYearFilterProps) {
  return (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">
          Pilih Periode Laporan
        </h3>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
        <div className="flex items-center gap-3">
          <Calendar className="h-5 w-5 text-blue-600" />
          <Select
            value={selectedMonth.toString()}
            onValueChange={(value) => onMonthChange(Number.parseInt(value))}
          >
            <SelectTrigger className="w-[180px] bg-white border-2 border-blue-200 focus:border-blue-500">
              <SelectValue placeholder="Pilih Bulan" />
            </SelectTrigger>
            <SelectContent>
              {months.map((month) => (
                <SelectItem key={month.value} value={month.value.toString()}>
                  {month.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-3">
          <Calendar className="h-5 w-5 text-green-600" />
          <Select
            value={selectedYear.toString()}
            onValueChange={(value) => onYearChange(Number.parseInt(value))}
          >
            <SelectTrigger className="w-[120px] bg-white border-2 border-green-200 focus:border-green-500">
              <SelectValue placeholder="Pilih Tahun" />
            </SelectTrigger>
            <SelectContent>
              {years.map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="text-center">
        <div className="inline-block bg-gradient-to-r from-blue-500 to-green-500 text-white px-6 py-3 rounded-lg shadow-lg">
          <span className="font-bold text-lg">
            BULAN:{" "}
            {months.find((m) => m.value === selectedMonth)?.label.toUpperCase()}{" "}
            {selectedYear}
          </span>
        </div>
      </div>
    </div>
  );
}
