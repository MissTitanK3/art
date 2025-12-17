"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/primitives/table";
import { Button } from "@workspace/ui/primitives/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/primitives/select";
import {
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { cn } from "@workspace/ui/lib/utils";

export interface Column<T> {
  header: React.ReactNode;
  accessorKey?: keyof T;
  accessorFn?: (item: T) => any;
  cell?: (item: T) => React.ReactNode;
  sortable?: boolean;
  className?: string;
  id?: string;
}

export interface SortConfig {
  key: string;
  direction: "asc" | "desc";
}

export function useSortableData<T>(
  data: T[],
  columns: Column<T>[],
  initialSort?: SortConfig,
  initialPageSize: number = 50,
  totalItems?: number
) {
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(
    initialSort ?? null
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const isServerSide = typeof totalItems === "number";

  // Reset to page 1 when data changes (e.g. filtering), but only for client-side
  useEffect(() => {
    if (!isServerSide) {
      setCurrentPage(1);
    }
  }, [data, pageSize, isServerSide]);

  const sortedData = useMemo(() => {
    if (!sortConfig) return data;

    return [...data].sort((a, b) => {
      const col = columns.find(
        (c) =>
          (c.accessorKey as string) === sortConfig.key || c.id === sortConfig.key
      );

      if (!col) return 0;

      const getVal = (item: T) => {
        if (col.accessorFn) return col.accessorFn(item);
        if (col.accessorKey) return item[col.accessorKey];
        return "";
      };

      const valA = getVal(a);
      const valB = getVal(b);

      if (typeof valA === "string" && typeof valB === "string") {
        return sortConfig.direction === "asc"
          ? valA.localeCompare(valB)
          : valB.localeCompare(valA);
      }

      if (valA < valB) return sortConfig.direction === "asc" ? -1 : 1;
      if (valA > valB) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
  }, [data, sortConfig, columns]);

  const totalPages = Math.ceil(
    (isServerSide ? totalItems : sortedData.length) / pageSize
  );

  const paginatedData = useMemo(() => {
    if (isServerSide) return sortedData;
    const start = (currentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, currentPage, pageSize, isServerSide]);

  const toggleSort = (key: string) => {
    setSortConfig((current) => {
      if (current?.key === key) {
        return {
          key,
          direction: current.direction === "asc" ? "desc" : "asc",
        };
      }
      return { key, direction: "asc" };
    });
  };

  return {
    sortedData,
    paginatedData,
    sortConfig,
    toggleSort,
    setSortConfig,
    currentPage,
    setCurrentPage,
    totalPages,
    pageSize,
    setPageSize,
  };
}

interface SortableTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyExtractor: (item: T) => string;
  sortConfig?: SortConfig | null;
  onSort?: (key: string) => void;
  className?: string;
  pagination?: {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    pageSize?: number;
    onPageSizeChange?: (size: number) => void;
  };
}

export function SortableTable<T>({
  data,
  columns,
  keyExtractor,
  sortConfig,
  onSort,
  className,
  pagination,
}: SortableTableProps<T>) {
  return (
    <div className="space-y-4">
      <div className={cn("rounded-md border overflow-x-auto", className)}>
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((col, idx) => {
                const key =
                  (col.accessorKey as string) || col.id || `col-${idx}`;
                const isSorted = sortConfig?.key === key;

                return (
                  <TableHead
                    key={key}
                    className={cn(
                      col.className,
                      col.sortable && "cursor-pointer hover:bg-muted/50"
                    )}
                    onClick={() => col.sortable && onSort?.(key)}
                  >
                    <div className="flex items-center gap-1">
                      {col.header}
                      {col.sortable &&
                        (isSorted ? (
                          sortConfig.direction === "asc" ? (
                            <ArrowUp className="h-3 w-3" />
                          ) : (
                            <ArrowDown className="h-3 w-3" />
                          )
                        ) : (
                          <ArrowUpDown className="h-3 w-3 opacity-30" />
                        ))}
                    </div>
                  </TableHead>
                );
              })}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item) => (
              <TableRow key={keyExtractor(item)}>
                {columns.map((col, idx) => {
                  const key =
                    (col.accessorKey as string) || col.id || `col-${idx}`;
                  return (
                    <TableCell key={key} className={col.className}>
                      {col.cell
                        ? col.cell(item)
                        : col.accessorKey
                          ? (item[col.accessorKey] as React.ReactNode)
                          : null}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {pagination && (
        <div className="flex items-center justify-end space-x-6 lg:space-x-8">
          {pagination.pageSize && pagination.onPageSizeChange && (
            <div className="flex items-center space-x-2">
              <p className="text-sm font-medium">Rows per page</p>
              <Select
                value={`${pagination.pageSize}`}
                onValueChange={(value) => {
                  pagination.onPageSizeChange?.(Number(value));
                }}
              >
                <SelectTrigger className="h-8 w-[70px]">
                  <SelectValue placeholder={pagination.pageSize} />
                </SelectTrigger>
                <SelectContent side="top">
                  {[10, 20, 30, 40, 50, 100].map((pageSize) => (
                    <SelectItem key={pageSize} value={`${pageSize}`}>
                      {pageSize}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="flex w-[100px] items-center justify-center text-sm font-medium">
            Page {pagination.currentPage} of {pagination.totalPages}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => pagination.onPageChange(1)}
              disabled={pagination.currentPage === 1}
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() =>
                pagination.onPageChange(pagination.currentPage - 1)
              }
              disabled={pagination.currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() =>
                pagination.onPageChange(pagination.currentPage + 1)
              }
              disabled={pagination.currentPage === pagination.totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => pagination.onPageChange(pagination.totalPages)}
              disabled={pagination.currentPage === pagination.totalPages}
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
