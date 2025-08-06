"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface YearFilterProps {
  selectedYear: number;
  onYearChange: (year: number) => void;
  title?: string;
}

export function YearFilter({
  selectedYear,
  onYearChange,
  title = "Filter Tahun",
}: YearFilterProps) {
  // Generate years from current year back to 10 years ago
  const years = Array.from(
    { length: 10 },
    (_, i) => new Date().getFullYear() - i
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium">Tahun:</label>
          <Select
            value={selectedYear.toString()}
            onValueChange={(value) => onYearChange(Number(value))}
          >
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Pilih tahun" />
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
      </CardContent>
    </Card>
  );
}
