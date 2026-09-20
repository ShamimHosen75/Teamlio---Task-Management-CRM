import { useMemo, useState, type ReactNode } from "react";
import { ArrowDown, ArrowUp, ChevronLeft, ChevronRight, Search, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EmptyState, SkeletonTable } from "@/components/shared/states";
import { cn } from "@/lib/utils";

export interface Column<T> {
  key: string;
  header: string;
  sortable?: boolean;
  className?: string;
  hideBelow?: "sm" | "md" | "lg" | "xl";
  render: (row: T) => ReactNode;
  sortValue?: (row: T) => string | number;
}

interface DataTableProps<T extends { id: string }> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  searchable?: boolean;
  searchPlaceholder?: string;
  searchKeys?: (keyof T)[];
  pageSize?: number;
  onRowClick?: (row: T) => void;
  toolbar?: ReactNode;
  bulkActions?: (selected: T[]) => ReactNode;
  emptyTitle?: string;
  emptyDescription?: string;
  mobileCard?: (row: T) => ReactNode;
}

const hideClass = {
  sm: "hidden sm:table-cell",
  md: "hidden md:table-cell",
  lg: "hidden lg:table-cell",
  xl: "hidden xl:table-cell",
};

export function DataTable<T extends { id: string }>({
  data,
  columns,
  loading,
  searchable = true,
  searchPlaceholder = "Search…",
  searchKeys,
  pageSize = 10,
  onRowClick,
  toolbar,
  bulkActions,
  emptyTitle = "Nothing here yet",
  emptyDescription = "Once records are added they will appear in this table.",
  mobileCard,
}: DataTableProps<T>) {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(0);
  const [sort, setSort] = useState<{ key: string; dir: "asc" | "desc" } | null>(null);
  const [hidden, setHidden] = useState<string[]>([]);
  const [selected, setSelected] = useState<string[]>([]);

  const visibleColumns = columns.filter((c) => !hidden.includes(c.key));

  const filtered = useMemo(() => {
    if (!query.trim()) return data;
    const q = query.toLowerCase();
    return data.filter((row) => {
      const keys = searchKeys ?? (Object.keys(row) as (keyof T)[]);
      return keys.some((k) => String(row[k] ?? "").toLowerCase().includes(q));
    });
  }, [data, query, searchKeys]);

  const sorted = useMemo(() => {
    if (!sort) return filtered;
    const col = columns.find((c) => c.key === sort.key);
    if (!col?.sortValue) return filtered;
    return [...filtered].sort((a, b) => {
      const av = col.sortValue!(a);
      const bv = col.sortValue!(b);
      if (av === bv) return 0;
      const res = av > bv ? 1 : -1;
      return sort.dir === "asc" ? res : -res;
    });
  }, [filtered, sort, columns]);

  const pageCount = Math.max(1, Math.ceil(sorted.length / pageSize));
  const current = Math.min(page, pageCount - 1);
  const rows = sorted.slice(current * pageSize, current * pageSize + pageSize);
  const selectedRows = data.filter((r) => selected.includes(r.id));

  if (loading) return <SkeletonTable />;

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="grid min-w-0 flex-1 grid-cols-1 gap-2 min-[420px]:grid-cols-2 sm:flex sm:flex-wrap sm:items-center">
          {searchable ? (
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setPage(0);
                }}
                placeholder={searchPlaceholder}
                className="pl-9"
                aria-label="Search table"
              />
            </div>
          ) : null}
          {toolbar}
        </div>
        <div className="flex min-w-0 items-center justify-end gap-2">
          {bulkActions && selectedRows.length > 0 ? (
            <div className="flex items-center gap-2 rounded-lg border bg-surface px-2 py-1 text-xs">
              <span className="text-muted-foreground">{selectedRows.length} selected</span>
              {bulkActions(selectedRows)}
            </div>
          ) : null}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <SlidersHorizontal className="size-4" />
                <span className="hidden sm:inline">Columns</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Visible columns</DropdownMenuLabel>
              {columns.map((c) => (
                <DropdownMenuCheckboxItem
                  key={c.key}
                  checked={!hidden.includes(c.key)}
                  onCheckedChange={(v) =>
                    setHidden((h) => (v ? h.filter((k) => k !== c.key) : [...h, c.key]))
                  }
                >
                  {c.header}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {rows.length === 0 ? (
        <EmptyState title={emptyTitle} description={emptyDescription} />
      ) : (
        <>
          {mobileCard ? (
            <div className="space-y-3 md:hidden">
              {rows.map((row) => (
                <div
                  key={row.id}
                  onClick={() => onRowClick?.(row)}
                  className={cn("surface-card p-4", onRowClick && "cursor-pointer active:bg-accent")}
                >
                  {mobileCard(row)}
                </div>
              ))}
            </div>
          ) : null}

          <div className={cn("surface-card max-w-full overflow-x-auto overscroll-x-contain", mobileCard && "hidden md:block")}>
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-b bg-surface-muted/60 text-left">
                  {bulkActions ? (
                    <th className="w-10 px-4 py-3">
                      <Checkbox
                        checked={rows.every((r) => selected.includes(r.id)) && rows.length > 0}
                        onCheckedChange={(v) =>
                          setSelected(v ? Array.from(new Set([...selected, ...rows.map((r) => r.id)])) : [])
                        }
                        aria-label="Select all rows"
                      />
                    </th>
                  ) : null}
                  {visibleColumns.map((c) => (
                    <th
                      key={c.key}
                      className={cn(
                        "whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground",
                        c.hideBelow && hideClass[c.hideBelow],
                        c.className,
                      )}
                    >
                      {c.sortable && c.sortValue ? (
                        <button
                          type="button"
                          className="inline-flex items-center gap-1 hover:text-foreground"
                          onClick={() =>
                            setSort((s) =>
                              s?.key === c.key ? { key: c.key, dir: s.dir === "asc" ? "desc" : "asc" } : { key: c.key, dir: "asc" },
                            )
                          }
                        >
                          {c.header}
                          {sort?.key === c.key ? (
                            sort.dir === "asc" ? (
                              <ArrowUp className="size-3" />
                            ) : (
                              <ArrowDown className="size-3" />
                            )
                          ) : null}
                        </button>
                      ) : (
                        c.header
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y">
                {rows.map((row) => (
                  <tr
                    key={row.id}
                    onClick={() => onRowClick?.(row)}
                    className={cn("transition-colors hover:bg-accent/60", onRowClick && "cursor-pointer")}
                  >
                    {bulkActions ? (
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={selected.includes(row.id)}
                          onCheckedChange={(v) =>
                            setSelected((s) => (v ? [...s, row.id] : s.filter((id) => id !== row.id)))
                          }
                          aria-label="Select row"
                        />
                      </td>
                    ) : null}
                    {visibleColumns.map((c) => (
                      <td
                        key={c.key}
                        className={cn("px-4 py-3 align-middle", c.hideBelow && hideClass[c.hideBelow], c.className)}
                      >
                        {c.render(row)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 text-sm text-muted-foreground">
            <span>
              {sorted.length} record{sorted.length === 1 ? "" : "s"}
            </span>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled={current === 0} onClick={() => setPage(current - 1)}>
                <ChevronLeft className="size-4" />
              </Button>
              <span className="text-xs">
                Page {current + 1} of {pageCount}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={current >= pageCount - 1}
                onClick={() => setPage(current + 1)}
              >
                <ChevronRight className="size-4" />
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
