import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable, type Column } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/badges";
import { FilterBar } from "@/components/shared/filter-bar";
import { PermissionGuard } from "@/components/shared/permission-guard";
import { compactNumber, fmtDate, money } from "@/lib/format";
import { useCampaigns, useClients } from "@/hooks/use-data";
import type { Campaign } from "@/lib/types";

export const Route = createFileRoute("/marketing/campaigns")({
  head: () => ({
    meta: [
      { title: "Campaigns — Teamlio" },
      { name: "description", content: "Campaign objectives, spend, reach and conversions." },
      { property: "og:title", content: "Campaigns — Teamlio" },
      { property: "og:description", content: "Campaign spend, reach and conversions." },
    ],
  }),
  component: CampaignsPage,
});

function CampaignsPage() {
  const { data: campaigns = [], isLoading } = useCampaigns();
  const { data: clients = [] } = useClients();
  const [status, setStatus] = useState("all");
  const rows = campaigns.filter((c) => status === "all" || c.status === status);

  const columns: Column<Campaign>[] = [
    { key: "name", header: "Campaign", sortable: true, sortValue: (c) => c.name, render: (c) => <span className="font-medium">{c.name}</span> },
    { key: "client", header: "Client", hideBelow: "lg", render: (c) => clients.find((cl) => cl.id === c.client_id)?.name ?? "Internal" },
    { key: "objective", header: "Objective", hideBelow: "xl", render: (c) => c.objective },
    { key: "window", header: "Window", hideBelow: "xl", render: (c) => `${fmtDate(c.start_date)} → ${fmtDate(c.end_date)}` },
    { key: "spend", header: "Spend", sortable: true, sortValue: (c) => c.spend, render: (c) => money(c.spend) },
    { key: "reach", header: "Reach", hideBelow: "md", render: (c) => compactNumber(c.reach) },
    { key: "leads", header: "Leads", sortable: true, sortValue: (c) => c.leads, render: (c) => c.leads },
    { key: "roas", header: "ROAS", render: (c) => (c.spend ? `${(c.revenue / c.spend).toFixed(1)}×` : "—") },
    { key: "status", header: "Status", render: (c) => <StatusBadge status={c.status} /> },
  ];

  return (
    <PermissionGuard permission="marketing.read" mode="page">
      <div className="mx-auto max-w-[1500px]">
        <PageHeader title="Campaigns" description="Every paid campaign with its return on ad spend." />
        <div className="mb-4">
          <FilterBar filters={[{ key: "status", label: "Status", options: ["Active", "Paused", "Completed", "Draft"], value: status, onChange: setStatus }]} />
        </div>
        <DataTable
          data={rows}
          columns={columns}
          loading={isLoading}
          searchKeys={["name"]}
          mobileCard={(c) => (
            <div className="space-y-1">
              <div className="flex items-center justify-between gap-2">
                <p className="truncate font-medium">{c.name}</p>
                <StatusBadge status={c.status} />
              </div>
              <p className="text-xs text-muted-foreground">{money(c.spend)} spend · {c.leads} leads</p>
            </div>
          )}
        />
      </div>
    </PermissionGuard>
  );
}
