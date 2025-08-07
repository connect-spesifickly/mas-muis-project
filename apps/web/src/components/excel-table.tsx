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
  showDuplicate?: boolean;
  onAdd?: (data: T) => Promise<void>;
  onUpdate?: (id: string, data: Partial<T>) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
  customActions?: CustomAction[];
  headerActions?: React.ReactNode;
  customCellRenderer?: (
    column: Column,
    value: unknown,
    row: T,
    isEditing: boolean,
    onChange?: (value: unknown) => void
  ) => React.ReactNode;
}

export default function ExcelTable<
  T extends Record<string, unknown> = Record<string, unknown>,
>({
  title,
  data,
  columns,
  showRunningBalance = false,
  showDuplicate = true,
  onAdd,
  onUpdate,
  onDelete,
  customActions = [],
  headerActions,
  customCellRenderer,
}: ExcelTableProps<T>) {
  const [tableData, setTableData] = useState<T[]>(data);
  const [newRow, setNewRow] = useState<Partial<T>>({});
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "asc" | "desc";
  } | null>(null);
  const [pendingChanges, setPendingChanges] = useState<
    Record<string, Partial<T>>
  >({});
  const [globalSearch, setGlobalSearch] = useState("");
  const [editingRow, setEditingRow] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Update table data when props change
  useEffect(() => {
    setTableData(data);
  }, [data]);

  // Filter and sort data
  const filteredAndSortedData = useMemo(() => {
    console.log("ExcelTable - tableData:", tableData);
    console.log("ExcelTable - sortConfig:", sortConfig);
    console.log("ExcelTable - showRunningBalance:", showRunningBalance);

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

    // Apply sorting - manual sorting takes priority over running balance sorting
    if (sortConfig) {
      // Manual sorting by user clicking column headers
      console.log("Manual sorting by:", sortConfig.key, sortConfig.direction);
      filtered.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];

        // Handle different data types
        if (aValue instanceof Date && bValue instanceof Date) {
          return sortConfig.direction === "asc"
            ? aValue.getTime() - bValue.getTime()
            : bValue.getTime() - aValue.getTime();
        }

        if (typeof aValue === "number" && typeof bValue === "number") {
          return sortConfig.direction === "asc"
            ? aValue - bValue
            : bValue - aValue;
        }

        // Convert to string for comparison
        const aString = String(aValue || "");
        const bString = String(bValue || "");

        if (aString < bString) return sortConfig.direction === "asc" ? -1 : 1;
        if (aString > bString) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    } else if (showRunningBalance) {
      // Default sorting for running balance when no manual sort is applied
      console.log("Default running balance sorting...");
      filtered.sort((a, b) => {
        // Use transactionDate for manual date ordering
        const aTransactionDate = a.transactionDate
          ? new Date(String(a.transactionDate))
          : new Date(0);
        const bTransactionDate = b.transactionDate
          ? new Date(String(b.transactionDate))
          : new Date(0);

        // If transactionDate is the same, use createdAt as secondary sort
        if (aTransactionDate.getTime() === bTransactionDate.getTime()) {
          const aCreatedAt = a.createdAt
            ? new Date(String(a.createdAt))
            : new Date(0);
          const bCreatedAt = b.createdAt
            ? new Date(String(b.createdAt))
            : new Date(0);

          return bCreatedAt.getTime() - aCreatedAt.getTime(); // Newest input first
        }

        return bTransactionDate.getTime() - aTransactionDate.getTime(); // Descending order (newest first)
      });
    }

    return filtered;
  }, [tableData, filters, sortConfig, globalSearch, showRunningBalance]);

  const handleSort = (key: string) => {
    console.log("Sorting clicked for key:", key);
    setSortConfig((current) => {
      if (current?.key === key) {
        // If same column, cycle: asc -> desc -> null (no sort)
        if (current.direction === "asc") {
          console.log("Changing to desc");
          return { key, direction: "desc" };
        } else {
          console.log("Removing sort");
          return null;
        }
      }
      // New column, start with asc
      console.log("New column sort, starting with asc");
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

  const handleEditRow = (rowId: string, field: string, value: unknown) => {
    // Store changes in pendingChanges instead of immediately updating
    setPendingChanges((prev) => ({
      ...prev,
      [rowId]: {
        ...prev[rowId],
        [field]: value,
      },
    }));

    // Update local table data for immediate UI feedback
    setTableData((prev) =>
      prev.map((row) =>
        String(row.id) === rowId ? { ...row, [field]: value } : row
      )
    );
  };

  const handleSaveChanges = async (rowId: string) => {
    if (!onUpdate || !pendingChanges[rowId]) {
      setEditingRow(null);
      setPendingChanges((prev) => {
        const newPending = { ...prev };
        delete newPending[rowId];
        return newPending;
      });
      return;
    }

    try {
      await onUpdate(rowId, pendingChanges[rowId]);

      // Clear pending changes and exit edit mode
      setPendingChanges((prev) => {
        const newPending = { ...prev };
        delete newPending[rowId];
        return newPending;
      });
      setEditingRow(null);
    } catch (error) {
      console.error("Failed to save changes:", error);
      // Revert local changes on error
      setTableData(data);
    }
  };

  const handleCancelEdit = (rowId: string) => {
    // Revert local changes
    setTableData(data);

    // Clear pending changes and exit edit mode
    setPendingChanges((prev) => {
      const newPending = { ...prev };
      delete newPending[rowId];
      return newPending;
    });
    setEditingRow(null);
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
        // Handle different number formats (string, number, Decimal from Prisma)
        let numValue = 0;
        if (typeof value === "number") {
          numValue = value;
        } else if (typeof value === "string") {
          numValue = parseFloat(value) || 0;
        } else if (value && typeof value === "object" && "toNumber" in value) {
          // Handle Prisma Decimal
          numValue = (value as { toNumber: () => number }).toNumber();
        } else if (value !== null && value !== undefined) {
          numValue = Number(value) || 0;
        }

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

        // Check if this is an expense transaction
        // For amount column, we need to check the row data to determine if it's expense
        // This will be handled in the specific component that uses ExcelTable
        return (
          <span>
            {new Intl.NumberFormat("id-ID", {
              style: "currency",
              currency: "IDR",
            }).format(Math.abs(numValue))}
          </span>
        );
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
      return (
        <span className="break-words whitespace-pre-wrap">
          {String(value || "")}
        </span>
      );
    }

    switch (column.type) {
      case "select":
        return (
          <Select value={String(value || "")} onValueChange={onChange}>
            <SelectTrigger className="h-8">
              <SelectValue placeholder="Pilih..." />
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
            {headerActions}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow className="bg-white/80 text-gray-500 font-normal rounded-t-lg border-b-0 transition-all">
                {columns.map((column) => (
                  <TableHead
                    key={column.key}
                    className="relative group text-gray-500 font-normal bg-white/80 first:rounded-tl-lg last:rounded-tr-lg border-b-0 py-3"
                  >
                    <div className="flex items-center justify-between">
                      <span>
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
                          className="h-6 w-6 p-0 bg-transparent border-0 shadow-none text-gray-400 hover:bg-gray-100 hover:text-gray-600"
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
                              className="h-6 w-6 p-0 bg-transparent border-0 shadow-none text-gray-400 hover:bg-gray-100 hover:text-gray-600"
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
                {showRunningBalance && (
                  <TableHead className="text-gray-500 font-normal bg-white/80 border-b-0 py-3">
                    Saldo
                  </TableHead>
                )}
                <TableHead className="w-[120px] bg-white/80 text-gray-500 font-normal border-b-0 last:rounded-tr-lg py-3">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* Input Row */}
              {onAdd && (
                <TableRow className="bg-green-50 hover:bg-green-100 transition-all sticky top-0 z-10">
                  {columns.map((column) => (
                    <TableCell key={column.key} className="max-w-[200px]">
                      {(() => {
                        if (customCellRenderer) {
                          const customResult = customCellRenderer(
                            column,
                            newRow[column.key],
                            newRow as T,
                            true,
                            (value) =>
                              setNewRow((prev) => ({
                                ...prev,
                                [column.key]: value,
                              }))
                          );
                          if (customResult !== undefined) {
                            return customResult;
                          }
                        }
                        return renderCell(
                          column,
                          newRow[column.key],
                          true,
                          (value) =>
                            setNewRow((prev) => ({
                              ...prev,
                              [column.key]: value,
                            }))
                        );
                      })()}
                    </TableCell>
                  ))}
                  {showRunningBalance && (
                    <TableCell className="text-gray-400 italic">-</TableCell>
                  )}
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
                    } hover:bg-blue-50 transition-colors duration-200`}
                  >
                    {columns.map((column) => (
                      <TableCell key={column.key} className="max-w-[200px]">
                        {(() => {
                          if (customCellRenderer) {
                            const customResult = customCellRenderer(
                              column,
                              row[column.key],
                              row,
                              editingRow === rowId,
                              (value) => handleEditRow(rowId, column.key, value)
                            );
                            if (customResult !== undefined) {
                              return customResult;
                            }
                          }
                          return renderCell(
                            column,
                            row[column.key],
                            editingRow === rowId,
                            (value) => handleEditRow(rowId, column.key, value)
                          );
                        })()}
                      </TableCell>
                    ))}
                    {showRunningBalance && (
                      <TableCell>
                        {row.runningBalance ? (
                          <span className="font-medium">
                            {new Intl.NumberFormat("id-ID", {
                              style: "currency",
                              currency: "IDR",
                            }).format(Number(row.runningBalance))}
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                    )}
                    <TableCell>
                      {editingRow === rowId ? (
                        // Show Save/Cancel buttons when editing
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSaveChanges(rowId)}
                            className="text-green-600 hover:text-green-700"
                          >
                            <Save className="h-4 w-4 mr-1" />
                            Simpan
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCancelEdit(rowId)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <X className="h-4 w-4 mr-1" />
                            Batal
                          </Button>
                        </div>
                      ) : (
                        // Show dropdown menu when not editing
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {onUpdate && (
                              <DropdownMenuItem
                                onClick={() => setEditingRow(rowId)}
                              >
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
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
                            {showDuplicate && (
                              <DropdownMenuItem
                                onClick={() => handleDuplicateRow(row)}
                              >
                                <Copy className="h-4 w-4 mr-2" />
                                Duplikat
                              </DropdownMenuItem>
                            )}
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
                      )}
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
