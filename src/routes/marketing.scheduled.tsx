import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable, type Column } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/badges";
import { StatCard } from "@/components/shared/stat-card";
import { FilterBar } from "@/components/shared/filter-bar";
import { PermissionGuard } from "@/components/shared/permission-guard";
import { Button } from "@/components/ui/button";
import { fmtDateTime } from "@/lib/format";
import { useContentItems, useRetrySchedule, useScheduledContent } from "@/hooks/use-data";
import type { ScheduledContent } from "@/lib/types";

export const Route = createFileRoute("/marketing/scheduled")({
  head: () => ({
    meta: [
      { title: "Scheduled Content — Teamlio" },
      { name: "description", content: "Publishing queue with attempts, failures and retries." },
      { property: "og:title", content: "Scheduled Content — Teamlio" },
      { property: "og:description", content: "Publishing queue, failures and retries." },
    ],
  }),
  component: ScheduledPage,
});

function ScheduledPage() {
  const { data: scheduled = [], isLoading } = useScheduledContent();
  const { data: content = [] } = useContentItems();
  const retry = useRetrySchedule();
  const [status, setStatus] = useState("all");

  const rows = scheduled.filter((s) => status === "all" || s.status === status);
  const title = (id: string) => content.find((c) => c.id === id)?.title ?? "—";

  const columns: Column<ScheduledContent>[] = [
    { key: "content", header: "Content", render: (s) => <span className="font-medium">{title(s.content_id)}</span> },
    { key: "platform", header: "Channel", render: (s) => `${s.platform} · ${s.account}` },
    { key: "when", header: "Scheduled for", sortable: true, sortValue: (s) => s.scheduled_at, render: (s) => fmtDateTime(s.scheduled_at) },
    { key: "attempts", header: "Attempts", hideBelow: "md", render: (s) => s.attempts },
    { key: "result", header: "Result", hideBelow: "lg", render: (s) => <span className="text-muted-foreground">{s.result || "—"}</span> },
    { key: "status", header: "Status", render: (s) => <StatusBadge status={s.status} /> },
    {
      key: "actions",
      header: "",
      render: (s) =>
        s.status === "Failed" ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              retry.mutate(s.id);
              toast.success("Publishing retry queued");
            }}
          >
            <RefreshCw className="size-4" /> Retry
          </Button>
        ) : null,
    },
  ];

  return (
    <PermissionGuard permission="marketing.read" mode="page">
      <div className="mx-auto max-w-[1400px]">
        <PageHeader title="Scheduled content" description="The publishing queue and what happened to each attempt." />
        <div className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Waiting" value={scheduled.filter((s) => s.status === "Waiting").length} loading={isLoading} />
          <StatCard label="Published" value={scheduled.filter((s) => s.status === "Published").length} tone="success" loading={isLoading} />
          <StatCard label="Retrying" value={scheduled.filter((s) => s.status === "Retrying").length} tone="warning" loading={isLoading} />
          <StatCard label="Failed" value={scheduled.filter((s) => s.status === "Failed").length} tone="destructive" loading={isLoading} />
        </div>
        <div className="mb-4">
          <FilterBar
            filters={[{ key: "status", label: "Status", options: ["Waiting", "Processing", "Publishing", "Published", "Retrying", "Failed", "Cancelled"], value: status, onChange: setStatus }]}
          />
        </div>
        <DataTable
          data={rows}
          columns={columns}
          loading={isLoading}
          searchable={false}
          mobileCard={(s) => (
            <div className="space-y-1">
              <div className="flex items-center justify-between gap-2">
                <p className="truncate font-medium">{title(s.content_id)}</p>
                <StatusBadge status={s.status} />
              </div>
              <p className="text-xs text-muted-foreground">{s.platform} · {fmtDateTime(s.scheduled_at)}</p>
            </div>
          )}
        />
      </div>
    </PermissionGuard>
  );
}
