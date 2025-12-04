"use client";
import { useCallback } from "react";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@workspace/ui/primitives/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/primitives/select";
type DispatchPaginationProps = {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  startIndex: number;
  endIndex: number;
  onPageChange: (page: number) => void;
  pageSize: number;
  pageSizeOptions: number[];
  onPageSizeChange: (size: number) => void;
};
export function DispatchPagination({
  currentPage,
  totalPages,
  totalItems,
  startIndex,
  endIndex,
  onPageChange,
  pageSize,
  pageSizeOptions,
  onPageSizeChange,
}: DispatchPaginationProps) {
  const renderPaginationNumbers = useCallback(() => {
    const items: React.ReactNode[] = [];
    const windowSize = 1; // show current ±1
    const addPage = (p: number) =>
      items.push(
        <PaginationItem key={p}>
          <PaginationLink
            isActive={p === currentPage}
            href="#"
            onClick={(e) => {
              e.preventDefault();
              onPageChange(p);
            }}
          >
            {p}
          </PaginationLink>
        </PaginationItem>,
      );
    if (totalPages <= 7) {
      for (let p = 1; p <= totalPages; p += 1) addPage(p);
      return items;
    }
    addPage(1);
    if (currentPage - windowSize > 2) {
      items.push(
        <PaginationItem key="start-ellipsis">
          <PaginationEllipsis />
        </PaginationItem>,
      );
    }
    const start = Math.max(2, currentPage - windowSize);
    const end = Math.min(totalPages - 1, currentPage + windowSize);
    for (let p = start; p <= end; p += 1) addPage(p);
    if (currentPage + windowSize < totalPages - 1) {
      items.push(
        <PaginationItem key="end-ellipsis">
          <PaginationEllipsis />
        </PaginationItem>,
      );
    }
    addPage(totalPages);
    return items;
  }, [currentPage, onPageChange, totalPages]);
  if (totalPages <= 1) {
    return (
      <div className="mt-6 flex items-center justify-between text-sm text-muted-foreground">
        <span>
          {totalItems > 0
            ? `Showing ${startIndex + 1}–${endIndex} of ${totalItems}`
            : "No results"}
        </span>
        <PageSizeSelect
          value={pageSize}
          options={pageSizeOptions}
          onChange={onPageSizeChange}
        />
      </div>
    );
  }
  return (
    <div className="mt-6 flex flex-col gap-3">
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          {totalItems > 0
            ? `Showing ${startIndex + 1}–${endIndex} of ${totalItems}`
            : "No results"}
        </span>
        <PageSizeSelect
          value={pageSize}
          options={pageSizeOptions}
          onChange={onPageSizeChange}
        />
      </div>
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              href="#"
              onClick={(e) => {
                e.preventDefault();
                onPageChange(Math.max(1, currentPage - 1));
              }}
            />
          </PaginationItem>
          {renderPaginationNumbers()}
          <PaginationItem>
            <PaginationNext
              href="#"
              onClick={(e) => {
                e.preventDefault();
                onPageChange(Math.min(totalPages, currentPage + 1));
              }}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
function PageSizeSelect({
  value,
  options,
  onChange,
}: {
  value: number;
  options: number[];
  onChange: (value: number) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="hidden sm:inline">Rows:</span>
      <Select
        value={String(value)}
        onValueChange={(v) => {
          const parsed = Number(v);
          if (!Number.isNaN(parsed)) onChange(parsed);
        }}
      >
        <SelectTrigger className="w-[120px]" aria-label="Items per page">
          <SelectValue placeholder="Page size" />
        </SelectTrigger>
        <SelectContent>
          {options.map((n) => (
            <SelectItem key={n} value={String(n)}>
              {n} / page
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
