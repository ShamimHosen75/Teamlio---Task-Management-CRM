import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable, type Column } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/badges";
import { FilterBar } from "@/components/shared/filter-bar";
import { PermissionGuard } from "@/components/shared/permission-guard";
import { UserCell } from "@/components/shared/user-avatar";
import { fmtDateTime } from "@/lib/format";
import { useAuditLogs } from "@/hooks/use-data";
import type { AuditLog } from "@/lib/types";

export const Route = createFileRoute("/admin/audit")({
  head: () => ({
    meta: [
      { title: "Audit Logs — Teamlio" },
      { name: "description", content: "A record of who changed what, and when." },
      { property: "og:title", content: "Audit Logs — Teamlio" },
      { property: "og:description", content: "Who changed what, and when." },
    ],
  }),
  component: AuditPage,
});

function AuditPage() {
  const { data: logs = [], isLoading } = useAuditLogs();
  const [status, setStatus] = useState("all");
  const rows = logs.filter((l) => status === "all" || l.status === status);

  const columns: Column<AuditLog>[] = [
    { key: "user", header: "Person", render: (l) => <UserCell userId={l.user_id} subtitle={l.ip} /> },
    { key: "action", header: "Action", render: (l) => <span className="font-medium">{l.action}</span> },
    { key: "entity", header: "Record", hideBelow: "md", render: (l) => `${l.entity_type} · ${l.entity_label}` },
    { key: "change", header: "Change", hideBelow: "xl", render: (l) => <span className="text-muted-foreground">{l.old_value} → {l.new_value}</span> },
    { key: "when", header: "When", sortable: true, sortValue: (l) => l.created_at, render: (l) => fmtDateTime(l.created_at) },
    { key: "status", header: "Result", render: (l) => <StatusBadge status={l.status} /> },
  ];

  return (
    <PermissionGuard permission="audit.read" mode="page">
      <div className="mx-auto max-w-[1500px]">
        <PageHeader title="Audit logs" description="An immutable history of workspace changes." />
        <div className="mb-4">
          <FilterBar filters={[{ key: "status", label: "Result", options: ["Success", "Failed"], value: status, onChange: setStatus }]} />
        </div>
        <DataTable
          data={rows}
          columns={columns}
          loading={isLoading}
          searchKeys={["action", "entity_label"]}
          mobileCard={(l) => (
            <div className="space-y-1">
              <div className="flex items-center justify-between gap-2">
                <p className="truncate font-medium">{l.action}</p>
                <StatusBadge status={l.status} />
              </div>
              <p className="text-xs text-muted-foreground">{l.entity_label} · {fmtDateTime(l.created_at)}</p>
            </div>
          )}
        />
      </div>
    </PermissionGuard>
  );
}
