import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable, type Column } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/badges";
import { StatCard } from "@/components/shared/stat-card";
import { FilterBar } from "@/components/shared/filter-bar";
import { PermissionGuard } from "@/components/shared/permission-guard";
import { fmtDateTime } from "@/lib/format";
import { useExecutionLogs, useWorkflows } from "@/hooks/use-data";
import type { ExecutionLog } from "@/lib/types";

export const Route = createFileRoute("/automation/logs")({
  head: () => ({
    meta: [
      { title: "Execution Logs — Teamlio" },
      { name: "description", content: "Every automation run with outcome, message and duration." },
      { property: "og:title", content: "Execution Logs — Teamlio" },
      { property: "og:description", content: "Automation run history and outcomes." },
    ],
  }),
  component: LogsPage,
});

function LogsPage() {
  const { data: logs = [], isLoading } = useExecutionLogs();
  const { data: workflows = [] } = useWorkflows();
  const [status, setStatus] = useState("all");
  const rows = logs.filter((l) => status === "all" || l.status === status);

  const columns: Column<ExecutionLog>[] = [
    { key: "workflow", header: "Workflow", render: (l) => <span className="font-medium">{workflows.find((w) => w.id === l.workflow_id)?.name ?? "—"}</span> },
    { key: "message", header: "Message", hideBelow: "md", render: (l) => <span className="text-muted-foreground">{l.message}</span> },
    { key: "duration", header: "Duration", hideBelow: "lg", render: (l) => `${l.duration_ms} ms` },
    { key: "ran", header: "Ran at", sortable: true, sortValue: (l) => l.ran_at, render: (l) => fmtDateTime(l.ran_at) },
    { key: "status", header: "Status", render: (l) => <StatusBadge status={l.status} /> },
  ];

  return (
    <PermissionGuard permission="automation.manage" mode="page">
      <div className="mx-auto max-w-[1400px]">
        <PageHeader title="Execution logs" description="What each automation did, and whether it worked." />
        <div className="mb-5 grid gap-4 sm:grid-cols-3">
          <StatCard label="Runs" value={logs.length} loading={isLoading} />
          <StatCard label="Successful" value={logs.filter((l) => l.status === "Success").length} tone="success" loading={isLoading} />
          <StatCard label="Failed" value={logs.filter((l) => l.status === "Failed").length} tone="destructive" loading={isLoading} />
        </div>
        <div className="mb-4">
          <FilterBar filters={[{ key: "status", label: "Status", options: ["Success", "Failed", "Skipped"], value: status, onChange: setStatus }]} />
        </div>
        <DataTable
          data={rows}
          columns={columns}
          loading={isLoading}
          searchable={false}
          mobileCard={(l) => (
            <div className="space-y-1">
              <div className="flex items-center justify-between gap-2">
                <p className="truncate font-medium">{workflows.find((w) => w.id === l.workflow_id)?.name ?? "—"}</p>
                <StatusBadge status={l.status} />
              </div>
              <p className="text-xs text-muted-foreground">{fmtDateTime(l.ran_at)} · {l.duration_ms} ms</p>
            </div>
          )}
        />
      </div>
    </PermissionGuard>
  );
}
