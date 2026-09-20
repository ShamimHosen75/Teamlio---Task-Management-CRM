import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { MetricChart } from "@/components/shared/metric-chart";
import { PermissionGuard } from "@/components/shared/permission-guard";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { compactNumber } from "@/lib/format";

export const Route = createFileRoute("/automation/ai-usage")({
  head: () => ({
    meta: [
      { title: "AI Usage — Teamlio" },
      { name: "description", content: "Assistant usage by feature, with quota tracking." },
      { property: "og:title", content: "AI Usage — Teamlio" },
      { property: "og:description", content: "Assistant usage and quota tracking." },
    ],
  }),
  component: AiUsagePage,
});

const FEATURES = [
  { name: "Task summaries", requests: 412, share: 32 },
  { name: "Content drafting", requests: 338, share: 26 },
  { name: "Lead qualification", requests: 244, share: 19 },
  { name: "Meeting notes", requests: 176, share: 14 },
  { name: "Report narration", requests: 118, share: 9 },
];

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"].map((name, i) => ({
  name,
  Requests: 640 + i * 145 + ((i * 37) % 90),
}));

function AiUsagePage() {
  const total = FEATURES.reduce((s, f) => s + f.requests, 0);

  return (
    <PermissionGuard permission="automation.manage" mode="page">
      <div className="mx-auto max-w-[1300px]">
        <PageHeader
          title="AI usage"
          description="How much the assistant is being used across the workspace."
          actions={<Badge variant="secondary">Demo usage data</Badge>}
        />
        <div className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Requests this month" value={compactNumber(total)} />
          <StatCard label="Monthly quota" value="5,000" />
          <StatCard label="Quota used" value={`${Math.round((total / 5000) * 100)}%`} tone="warning" />
          <StatCard label="Average response" value="1.4 s" tone="success" />
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="surface-card p-4">
            <h2 className="mb-2 text-sm font-semibold">Requests over time</h2>
            <MetricChart type="area" data={MONTHS} xKey="name" series={[{ key: "Requests", label: "Requests" }]} />
          </div>
          <div className="surface-card p-4">
            <h2 className="mb-3 text-sm font-semibold">Usage by feature</h2>
            <ul className="space-y-3">
              {FEATURES.map((f) => (
                <li key={f.name}>
                  <div className="flex items-center justify-between text-sm">
                    <span>{f.name}</span>
                    <span className="text-muted-foreground">{f.requests}</span>
                  </div>
                  <Progress value={f.share} className="mt-1.5 h-1.5" />
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </PermissionGuard>
  );
}
