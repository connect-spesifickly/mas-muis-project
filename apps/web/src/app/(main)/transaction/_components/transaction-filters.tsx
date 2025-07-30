"use client";

interface TransactionFiltersProps {
  filters: { month: number; year: number };
  onFiltersChange: (filters: { month: number; year: number }) => void;
}

export function TransactionFilters({
  filters,
  onFiltersChange,
}: TransactionFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 p-4 border-b">
      <div className="flex flex-col sm:flex-row gap-2">
        <select
          value={filters.month}
          onChange={(e) =>
            onFiltersChange({ ...filters, month: Number(e.target.value) })
          }
          className="px-3 py-2 border rounded-md"
        >
          <option value={1}>Januari</option>
          <option value={2}>Februari</option>
          <option value={3}>Maret</option>
          <option value={4}>April</option>
          <option value={5}>Mei</option>
          <option value={6}>Juni</option>
          <option value={7}>Juli</option>
          <option value={8}>Agustus</option>
          <option value={9}>September</option>
          <option value={10}>Oktober</option>
          <option value={11}>November</option>
          <option value={12}>Desember</option>
        </select>
        <select
          value={filters.year}
          onChange={(e) =>
            onFiltersChange({ ...filters, year: Number(e.target.value) })
          }
          className="px-3 py-2 border rounded-md"
        >
          {Array.from(
            { length: 10 },
            (_, i) => new Date().getFullYear() - i
          ).map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
