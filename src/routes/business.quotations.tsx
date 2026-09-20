import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { Download } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable, type Column } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/badges";
import { StatCard } from "@/components/shared/stat-card";
import { PermissionGuard } from "@/components/shared/permission-guard";
import { Button } from "@/components/ui/button";
import { fmtDate, lineItemsTotal, money } from "@/lib/format";
import { useClients, useQuotations } from "@/hooks/use-data";
import type { Quotation } from "@/lib/types";

export const Route = createFileRoute("/business/quotations")({
  head: () => ({
    meta: [
      { title: "Quotations — Teamlio" },
      { name: "description", content: "Build, send and track client quotations with line items and tax." },
      { property: "og:title", content: "Quotations — Teamlio" },
      { property: "og:description", content: "Client quotations with line items, discount and tax." },
    ],
  }),
  component: QuotationsPage,
});

function QuotationsPage() {
  const { data: quotations = [], isLoading } = useQuotations();
  const { data: clients = [] } = useClients();
  const clientName = (id: string) => clients.find((c) => c.id === id)?.name ?? "—";
  const total = (q: Quotation) => lineItemsTotal(q.items, q.discount, q.tax_rate).total;

  const columns: Column<Quotation>[] = [
    { key: "number", header: "Quotation", sortable: true, sortValue: (q) => q.number, render: (q) => <span className="font-medium">{q.number}</span> },
    { key: "client", header: "Client", render: (q) => clientName(q.client_id) },
    { key: "expiry", header: "Valid until", hideBelow: "md", sortable: true, sortValue: (q) => q.expiry_date, render: (q) => fmtDate(q.expiry_date) },
    { key: "total", header: "Total", sortable: true, sortValue: total, render: (q) => money(total(q)) },
    { key: "status", header: "Status", render: (q) => <StatusBadge status={q.status} /> },
    {
      key: "actions",
      header: "",
      render: () => (
        <Button variant="ghost" size="sm" onClick={() => toast.success("Quotation PDF prepared")}>
          <Download className="size-4" />
        </Button>
      ),
    },
  ];

  const accepted = quotations.filter((q) => q.status === "Accepted");

  return (
    <PermissionGuard permission="quotation.create" mode="page">
      <div className="mx-auto max-w-[1400px]">
        <PageHeader title="Quotations" description="Proposals sent to clients, with acceptance tracking." />
        <div className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Total quotations" value={quotations.length} loading={isLoading} />
          <StatCard label="Sent" value={quotations.filter((q) => q.status === "Sent").length} loading={isLoading} />
          <StatCard label="Accepted" value={accepted.length} tone="success" loading={isLoading} />
          <StatCard label="Accepted value" value={money(accepted.reduce((s, q) => s + total(q), 0))} loading={isLoading} />
        </div>
        <DataTable
          data={quotations}
          columns={columns}
          loading={isLoading}
          searchKeys={["number"]}
          searchPlaceholder="Search quotations…"
          mobileCard={(q) => (
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <p className="font-medium">{q.number}</p>
                <StatusBadge status={q.status} />
              </div>
              <p className="text-xs text-muted-foreground">{clientName(q.client_id)} · {money(total(q))}</p>
            </div>
          )}
        />
      </div>
    </PermissionGuard>
  );
}
