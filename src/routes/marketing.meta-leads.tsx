import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable, type Column } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/badges";
import { StatCard } from "@/components/shared/stat-card";
import { FilterBar } from "@/components/shared/filter-bar";
import { PermissionGuard } from "@/components/shared/permission-guard";
import { userName } from "@/components/shared/user-avatar";
import { Button } from "@/components/ui/button";
import { useCampaigns, useMetaLeads } from "@/hooks/use-data";
import type { MetaLead } from "@/lib/types";

export const Route = createFileRoute("/marketing/meta-leads")({
  head: () => ({
    meta: [
      { title: "Meta Leads — Teamlio" },
      { name: "description", content: "Lead form submissions routed into the CRM pipeline." },
      { property: "og:title", content: "Meta Leads — Teamlio" },
      { property: "og:description", content: "Lead form submissions routed into CRM." },
    ],
  }),
  component: MetaLeadsPage,
});

function MetaLeadsPage() {
  const { data: leads = [], isLoading } = useMetaLeads();
  const { data: campaigns = [] } = useCampaigns();
  const [status, setStatus] = useState("all");
  const rows = leads.filter((l) => status === "all" || l.crm_status === status);

  const columns: Column<MetaLead>[] = [
    { key: "name", header: "Name", render: (l) => <span className="font-medium">{l.full_name}</span> },
    { key: "contact", header: "Contact", hideBelow: "md", render: (l) => <span className="text-muted-foreground">{l.email}<br />{l.phone}</span> },
    { key: "campaign", header: "Campaign", hideBelow: "lg", render: (l) => campaigns.find((c) => c.id === l.campaign_id)?.name ?? "—" },
    { key: "form", header: "Lead form", hideBelow: "xl", render: (l) => l.lead_form },
    { key: "owner", header: "Owner", render: (l) => (l.assigned_user_id ? userName(l.assigned_user_id) : "Unassigned") },
    { key: "status", header: "Status", render: (l) => <StatusBadge status={l.crm_status} /> },
    {
      key: "actions",
      header: "",
      render: (l) =>
        l.crm_status !== "Converted" ? (
          <Button variant="ghost" size="sm" onClick={() => toast.success(`${l.full_name} pushed to the CRM pipeline`)}>
            Push to CRM
          </Button>
        ) : null,
    },
  ];

  return (
    <PermissionGuard permission="marketing.read" mode="page">
      <div className="mx-auto max-w-[1500px]">
        <PageHeader title="Meta leads" description="Form submissions captured from Facebook and Instagram ads." />
        <div className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Total leads" value={leads.length} loading={isLoading} />
          <StatCard label="New" value={leads.filter((l) => l.crm_status === "New").length} loading={isLoading} />
          <StatCard label="Assigned" value={leads.filter((l) => l.crm_status === "Assigned").length} tone="warning" loading={isLoading} />
          <StatCard label="Converted" value={leads.filter((l) => l.crm_status === "Converted").length} tone="success" loading={isLoading} />
        </div>
        <div className="mb-4">
          <FilterBar filters={[{ key: "status", label: "Status", options: ["New", "Assigned", "Converted", "Rejected"], value: status, onChange: setStatus }]} />
        </div>
        <DataTable
          data={rows}
          columns={columns}
          loading={isLoading}
          searchKeys={["full_name", "email"]}
          mobileCard={(l) => (
            <div className="space-y-1">
              <div className="flex items-center justify-between gap-2">
                <p className="font-medium">{l.full_name}</p>
                <StatusBadge status={l.crm_status} />
              </div>
              <p className="text-xs text-muted-foreground">{l.email} · {l.lead_form}</p>
            </div>
          )}
        />
      </div>
    </PermissionGuard>
  );
}
