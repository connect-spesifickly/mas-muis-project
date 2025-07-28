"use client";

import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  Filter,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Plus,
  Save,
  X,
  MoreHorizontal,
  Edit,
  Trash2,
  Copy,
  Download,
} from "lucide-react";

interface Column {
  key: string;
  label: string;
  type: "text" | "number" | "date" | "select" | "email" | "textarea";
  required?: boolean;
  options?: string[];
}

interface CustomAction {
  label: string;
  icon: string;
  onClick: (rowId: string) => void;
  visible?: boolean;
}

interface ExcelTableProps<
  T extends Record<string, unknown> = Record<string, unknown>,
> {
  title: string;
  data: T[];
  columns: Column[];
  showRunningBalance?: boolean;
  onAdd?: (data: T) => Promise<void>;
  onUpdate?: (id: string, data: Partial<T>) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
  customActions?: CustomAction[];
}

export default function ExcelTable<
  T extends Record<string, unknown> = Record<string, unknown>,
>({
  title,
  data,
  columns,
  showRunningBalance = false,
  onAdd,
  onUpdate,
  onDelete,
  customActions = [],
}: ExcelTableProps<T>) {
  const [tableData, setTableData] = useState<T[]>(data);
  const [newRow, setNewRow] = useState<Partial<T>>({});
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "asc" | "desc";
  } | null>(null);
  const [globalSearch, setGlobalSearch] = useState("");
  const [editingRow, setEditingRow] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Update table data when props change
  useEffect(() => {
    setTableData(data);
  }, [data]);

  // Filter and sort data
  const filteredAndSortedData = useMemo(() => {
    const filtered = tableData.filter((row) => {
      // Global search
      if (globalSearch) {
        const searchLower = globalSearch.toLowerCase();
        const matchesGlobal = Object.values(row).some((value) =>
          String(value).toLowerCase().includes(searchLower)
        );
        if (!matchesGlobal) return false;
      }

      // Column filters
      return Object.entries(filters).every(([key, filterValue]) => {
        if (!filterValue) return true;
        const cellValue = String(row[key]).toLowerCase();
        return cellValue.includes(filterValue.toLowerCase());
      });
    });

    // Sort
    if (sortConfig) {
      filtered.sort((a, b) => {
        const aValue = String(a[sortConfig.key] || "");
        const bValue = String(b[sortConfig.key] || "");

        if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [tableData, filters, sortConfig, globalSearch]);

  const handleSort = (key: string) => {
    setSortConfig((current) => {
      if (current?.key === key) {
        return current.direction === "asc" ? { key, direction: "desc" } : null;
      }
      return { key, direction: "asc" };
    });
  };

  const handleFilter = (key: string, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleAddRow = async () => {
    if (Object.keys(newRow).length === 0 || !onAdd) return;

    try {
      setLoading(true);
      await onAdd(newRow as T);
      setNewRow({});
    } catch (error) {
      console.error("Failed to add row:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditRow = async (
    rowId: string,
    field: string,
    value: unknown
  ) => {
    if (!onUpdate) {
      // Fallback to local state update if no API handler
      setTableData((prev) =>
        prev.map((row) =>
          String(row.id) === rowId ? { ...row, [field]: value } : row
        )
      );
      return;
    }

    try {
      const updatedData = { [field]: value } as Partial<T>;
      await onUpdate(rowId, updatedData);
    } catch (error) {
      console.error("Failed to update row:", error);
    }
  };

  const handleDeleteRow = async (rowId: string) => {
    if (!onDelete) {
      // Fallback to local state update if no API handler
      setTableData((prev) => prev.filter((row) => row.id !== rowId));
      return;
    }

    try {
      await onDelete(rowId);
    } catch (error) {
      console.error("Failed to delete row:", error);
    }
  };

  const handleDuplicateRow = (row: T) => {
    const duplicatedRow = {
      ...row,
      id: `${String(row.id)}_copy_${Date.now()}`,
    } as T;
    setTableData((prev) => [...prev, duplicatedRow]);
  };

  const renderCell = (
    column: Column,
    value: unknown,
    isEditing: boolean,
    onChange?: (value: unknown) => void
  ) => {
    if (!isEditing) {
      if (column.type === "number") {
        const numValue = typeof value === "number" ? value : 0;
        if (showRunningBalance && column.key === "amount") {
          return (
            <div className="flex items-center justify-between">
              <span
                className={numValue < 0 ? "text-red-600" : "text-green-600"}
              >
                {new Intl.NumberFormat("id-ID", {
                  style: "currency",
                  currency: "IDR",
                }).format(Math.abs(numValue))}
              </span>
            </div>
          );
        }
        return <span>{new Intl.NumberFormat("id-ID").format(numValue)}</span>;
      }
      if (column.type === "date") {
        const dateValue =
          value instanceof Date
            ? value
            : value
              ? new Date(String(value))
              : null;
        return (
          <span>{dateValue ? dateValue.toLocaleDateString("id-ID") : ""}</span>
        );
      }
      return <span>{String(value || "")}</span>;
    }

    switch (column.type) {
      case "select":
        return (
          <Select value={String(value || "")} onValueChange={onChange}>
            <SelectTrigger className="h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {column.options?.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      case "textarea":
        return (
          <Textarea
            value={String(value || "")}
            onChange={(e) => onChange?.(e.target.value)}
            className="min-h-[60px] resize-none"
          />
        );
      case "number":
        return (
          <Input
            type="number"
            value={String(value || "")}
            onChange={(e) => onChange?.(Number(e.target.value))}
            className="h-8"
          />
        );
      case "date":
        return (
          <Input
            type="date"
            value={String(value || "")}
            onChange={(e) => onChange?.(e.target.value)}
            className="h-8"
          />
        );
      default:
        return (
          <Input
            type={column.type}
            value={String(value || "")}
            onChange={(e) => onChange?.(e.target.value)}
            className="h-8"
          />
        );
    }
  };

  const getIconComponent = (iconName: string) => {
    const icons: Record<string, React.ComponentType<{ className?: string }>> = {
      Download,
      Edit,
      Trash2,
      Copy,
    };
    const IconComponent = icons[iconName] || Edit;
    return <IconComponent className="h-4 w-4" />;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{title}</CardTitle>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari data..."
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
                className="pl-8 w-64"
              />
            </div>
            {onAdd && (
              <Button onClick={handleAddRow} size="sm" disabled={loading}>
                <Plus className="h-4 w-4 mr-2" />
                Tambah
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow className="bg-gradient-to-r from-blue-50 to-indigo-50">
                {columns.map((column) => (
                  <TableHead key={column.key} className="relative group">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">
                        {column.label}
                        {column.required && (
                          <span className="text-red-500 ml-1">*</span>
                        )}
                      </span>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSort(column.key)}
                          className="h-6 w-6 p-0"
                        >
                          {sortConfig?.key === column.key ? (
                            sortConfig.direction === "asc" ? (
                              <ArrowUp className="h-3 w-3" />
                            ) : (
                              <ArrowDown className="h-3 w-3" />
                            )
                          ) : (
                            <ArrowUpDown className="h-3 w-3" />
                          )}
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                            >
                              <Filter className="h-3 w-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <div className="p-2">
                              <Input
                                placeholder={`Filter ${column.label}...`}
                                value={filters[column.key] || ""}
                                onChange={(e) =>
                                  handleFilter(column.key, e.target.value)
                                }
                              />
                            </div>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </TableHead>
                ))}
                <TableHead className="w-[120px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* Input Row */}
              {onAdd && (
                <TableRow className="bg-green-50 hover:bg-green-100">
                  {columns.map((column) => (
                    <TableCell key={column.key}>
                      {renderCell(column, newRow[column.key], true, (value) =>
                        setNewRow((prev) => ({ ...prev, [column.key]: value }))
                      )}
                    </TableCell>
                  ))}
                  <TableCell>
                    <Button
                      onClick={handleAddRow}
                      size="sm"
                      variant="outline"
                      disabled={loading}
                    >
                      <Save className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              )}

              {/* Data Rows */}
              {filteredAndSortedData.map((row, index) => {
                const rowId = String(row.id || index);
                return (
                  <TableRow
                    key={rowId}
                    className={`${
                      index % 2 === 0 ? "bg-white" : "bg-gray-50"
                    } hover:bg-blue-50 transition-colors`}
                  >
                    {columns.map((column) => (
                      <TableCell key={column.key}>
                        {renderCell(
                          column,
                          row[column.key],
                          editingRow === rowId,
                          (value) => handleEditRow(rowId, column.key, value)
                        )}
                      </TableCell>
                    ))}
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {onUpdate && (
                            <DropdownMenuItem
                              onClick={() =>
                                setEditingRow(
                                  editingRow === rowId ? null : rowId
                                )
                              }
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              {editingRow === rowId ? "Selesai Edit" : "Edit"}
                            </DropdownMenuItem>
                          )}
                          {onDelete && (
                            <DropdownMenuItem
                              onClick={() => handleDeleteRow(rowId)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Hapus
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            onClick={() => handleDuplicateRow(row)}
                          >
                            <Copy className="h-4 w-4 mr-2" />
                            Duplikat
                          </DropdownMenuItem>
                          {customActions.map((action, idx) =>
                            action.visible !== false ? (
                              <DropdownMenuItem
                                key={idx}
                                onClick={() => action.onClick(rowId)}
                              >
                                {getIconComponent(action.icon)}
                                <span className="ml-2">{action.label}</span>
                              </DropdownMenuItem>
                            ) : null
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}

              {/* Empty State */}
              {filteredAndSortedData.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={columns.length + 1}
                    className="h-24 text-center"
                  >
                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                      <p>Tidak ada data yang ditemukan</p>
                      {(globalSearch ||
                        Object.values(filters).some((f) => f)) && (
                        <p className="text-sm">
                          Coba ubah filter atau kata kunci pencarian
                        </p>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Filter Summary */}
        {(globalSearch || Object.keys(filters).some((key) => filters[key])) && (
          <div className="mt-4 flex items-center gap-2 flex-wrap">
            <span className="text-sm text-muted-foreground">Filter aktif:</span>
            {globalSearch && (
              <Badge variant="secondary" className="gap-1">
                Pencarian: {globalSearch}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 hover:bg-transparent"
                  onClick={() => setGlobalSearch("")}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )}
            {Object.entries(filters).map(
              ([key, value]) =>
                value && (
                  <Badge key={key} variant="secondary" className="gap-1">
                    {columns.find((col) => col.key === key)?.label}: {value}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0 hover:bg-transparent"
                      onClick={() => handleFilter(key, "")}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                )
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setFilters({});
                setGlobalSearch("");
              }}
              className="text-xs"
            >
              Clear All
            </Button>
          </div>
        )}

        {/* Data Summary */}
        <div className="mt-4 text-sm text-muted-foreground">
          Menampilkan {filteredAndSortedData.length} dari {tableData.length}{" "}
          data
        </div>
      </CardContent>
    </Card>
  );
}
