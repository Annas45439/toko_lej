"use client";

import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  ColumnDef,
  SortingState,
  ColumnFiltersState,
} from "@tanstack/react-table";
import { useState } from "react";
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T, any>[];
  pageSize?: number;
  globalFilter?: string;
  onGlobalFilterChange?: (value: string) => void;
}

export function DataTable<T>({
  data,
  columns,
  pageSize = 10,
  globalFilter = "",
  onGlobalFilterChange,
}: DataTableProps<T>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const table = useReactTable({
    data,
    columns,
    state: { sorting, columnFilters, globalFilter },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize } },
  });

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-xl border border-white/10">
        <table className="w-full text-sm">
          <thead>
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id} className="border-b border-white/10 bg-white/5">
                {hg.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400 select-none"
                    onClick={header.column.getToggleSortingHandler()}
                    style={{ cursor: header.column.getCanSort() ? "pointer" : "default" }}
                  >
                    <div className="flex items-center gap-1">
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {header.column.getCanSort() && (
                        <span className="text-slate-600">
                          {header.column.getIsSorted() === "asc" ? (
                            <ChevronUp size={14} className="text-cyan-400" />
                          ) : header.column.getIsSorted() === "desc" ? (
                            <ChevronDown size={14} className="text-cyan-400" />
                          ) : (
                            <ChevronUp size={14} className="opacity-20" />
                          )}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-12 text-center text-slate-500">
                  Tidak ada data
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row, i) => (
                <tr
                  key={row.id}
                  className="border-b border-white/5 transition-colors hover:bg-white/5"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-3 text-slate-300">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between text-sm text-slate-400">
        <span>
          {table.getFilteredRowModel().rows.length} data
          {table.getPageCount() > 1 &&
            ` · Hal ${table.getState().pagination.pageIndex + 1} dari ${table.getPageCount()}`}
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
            className="p-1.5 rounded-lg hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronsLeft size={16} />
          </button>
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="p-1.5 rounded-lg hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft size={16} />
          </button>
          {Array.from({ length: Math.min(5, table.getPageCount()) }, (_, i) => {
            const pageIdx = Math.max(0, Math.min(
              table.getState().pagination.pageIndex - 2,
              table.getPageCount() - 5
            )) + i;
            return (
              <button
                key={pageIdx}
                onClick={() => table.setPageIndex(pageIdx)}
                className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors ${
                  table.getState().pagination.pageIndex === pageIdx
                    ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/40"
                    : "hover:bg-white/10"
                }`}
              >
                {pageIdx + 1}
              </button>
            );
          })}
          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="p-1.5 rounded-lg hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight size={16} />
          </button>
          <button
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
            className="p-1.5 rounded-lg hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronsRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
