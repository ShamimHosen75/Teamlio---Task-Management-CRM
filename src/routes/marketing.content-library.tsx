import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { FilterBar } from "@/components/shared/filter-bar";
import { StatusBadge } from "@/components/shared/badges";
import { EmptyState, SkeletonGrid } from "@/components/shared/states";
import { PermissionGuard } from "@/components/shared/permission-guard";
import { UserCell } from "@/components/shared/user-avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CONTENT_STATUSES, CONTENT_WORKFLOW } from "@/lib/constants";
import { fmtDate } from "@/lib/format";
import { useContentItems } from "@/hooks/use-data";

export const Route = createFileRoute("/marketing/content-library")({
  head: () => ({
    meta: [
      { title: "Content Library — Teamlio" },
      { name: "description", content: "Every social post, caption and asset with its approval stage." },
      { property: "og:title", content: "Content Library — Teamlio" },
      { property: "og:description", content: "Social content assets and approval stages." },
    ],
  }),
  component: ContentLibraryPage,
});

function ContentLibraryPage() {
  const { data: content = [], isLoading } = useContentItems();
  const [status, setStatus] = useState("all");
  const [platform, setPlatform] = useState("all");

  const rows = content.filter(
    (c) => (status === "all" || c.status === status) && (platform === "all" || c.platform === platform),
  );

  return (
    <PermissionGuard permission="marketing.read" mode="page">
      <div className="mx-auto max-w-[1500px]">
        <PageHeader title="Content library" description="Drafts, designs and approved posts across every channel." />

        <div className="mb-5 surface-card p-4">
          <h2 className="mb-3 text-sm font-semibold">Creation workflow</h2>
          <ol className="flex flex-wrap items-center gap-2 text-xs">
            {CONTENT_WORKFLOW.map((stage, i) => (
              <li key={stage} className="flex items-center gap-2">
                <span className="rounded-full bg-surface-muted px-2.5 py-1 font-medium">{stage}</span>
                {i < CONTENT_WORKFLOW.length - 1 ? <span className="text-muted-foreground">→</span> : null}
              </li>
            ))}
          </ol>
        </div>

        <div className="mb-4">
          <FilterBar
            filters={[
              { key: "status", label: "Status", options: [...CONTENT_STATUSES], value: status, onChange: setStatus },
              { key: "platform", label: "Platform", options: ["Facebook", "Instagram", "LinkedIn", "YouTube", "TikTok"], value: platform, onChange: setPlatform },
            ]}
          />
        </div>

        {isLoading ? (
          <SkeletonGrid />
        ) : rows.length === 0 ? (
          <EmptyState title="No content matches these filters" />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {rows.map((c) => (
              <article key={c.id} className="surface-card p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-semibold">{c.title}</h3>
                    <p className="text-xs text-muted-foreground">{c.platform} · {c.content_type}</p>
                  </div>
                  <StatusBadge status={c.status} />
                </div>
                <p className="mt-3 line-clamp-3 text-sm text-muted-foreground">{c.caption}</p>
                <div className="mt-3 flex flex-wrap gap-1">
                  {c.hashtags.slice(0, 3).map((h) => (
                    <Badge key={h} variant="secondary">#{h}</Badge>
                  ))}
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <UserCell userId={c.writer_id} subtitle={fmtDate(c.publish_date)} />
                  <Button variant="ghost" size="sm" onClick={() => toast.success(`${c.title} approved`)}>
                    Approve
                  </Button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </PermissionGuard>
  );
}
