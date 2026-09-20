import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { MetricChart } from "@/components/shared/metric-chart";
import { StatusBadge } from "@/components/shared/badges";
import { PermissionGuard } from "@/components/shared/permission-guard";
import { compactNumber, money, percent } from "@/lib/format";
import { useCampaigns, useContentItems, useMetaLeads, useScheduledContent } from "@/hooks/use-data";

export const Route = createFileRoute("/marketing/")({
  head: () => ({
    meta: [
      { title: "Social Marketing Overview — Teamlio" },
      { name: "description", content: "Campaign reach, spend, leads and content pipeline in one view." },
      { property: "og:title", content: "Social Marketing Overview — Teamlio" },
      { property: "og:description", content: "Campaign performance and content pipeline." },
    ],
  }),
  component: MarketingOverview,
});

function MarketingOverview() {
  const { data: campaigns = [], isLoading } = useCampaigns();
  const { data: content = [] } = useContentItems();
  const { data: scheduled = [] } = useScheduledContent();
  const { data: metaLeads = [] } = useMetaLeads();

  const spend = campaigns.reduce((s, c) => s + c.spend, 0);
  const revenue = campaigns.reduce((s, c) => s + c.revenue, 0);
  const leads = campaigns.reduce((s, c) => s + c.leads, 0);
  const clicks = campaigns.reduce((s, c) => s + c.clicks, 0);
  const impressions = campaigns.reduce((s, c) => s + c.impressions, 0);

  const perf = campaigns.map((c) => ({ name: c.name.slice(0, 14), Spend: c.spend, Revenue: c.revenue }));
  const statusMix = Object.entries(
    content.reduce<Record<string, number>>((acc, c) => {
      acc[c.status] = (acc[c.status] ?? 0) + 1;
      return acc;
    }, {}),
  ).map(([name, value]) => ({ name, value }));

  return (
    <PermissionGuard permission="marketing.read" mode="page">
      <div className="mx-auto max-w-[1500px]">
        <PageHeader title="Social marketing" description="Paid and organic performance across connected channels." />

        <div className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Ad spend" value={money(spend)} loading={isLoading} />
          <StatCard label="Attributed revenue" value={money(revenue)} tone="success" loading={isLoading} />
          <StatCard label="Leads generated" value={leads} loading={isLoading} />
          <StatCard label="Click-through rate" value={percent(impressions ? (clicks / impressions) * 100 : 0)} loading={isLoading} />
        </div>

        <div className="mb-5 grid gap-4 lg:grid-cols-3">
          <div className="surface-card p-4 lg:col-span-2">
            <h2 className="mb-2 text-sm font-semibold">Spend vs revenue by campaign</h2>
            <MetricChart type="bar" data={perf} xKey="name" series={[{ key: "Spend", label: "Spend" }, { key: "Revenue", label: "Revenue" }]} />
          </div>
          <div className="surface-card p-4">
            <h2 className="mb-2 text-sm font-semibold">Content pipeline</h2>
            <MetricChart type="pie" data={statusMix} xKey="name" series={[{ key: "value", label: "Items" }]} />
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="surface-card p-4">
            <h2 className="mb-3 text-sm font-semibold">Upcoming publishes</h2>
            <ul className="space-y-2.5">
              {scheduled.slice(0, 6).map((s) => (
                <li key={s.id} className="flex items-center justify-between gap-3 text-sm">
                  <span className="truncate">{s.platform} · {s.account}</span>
                  <StatusBadge status={s.status} />
                </li>
              ))}
            </ul>
          </div>
          <div className="surface-card p-4">
            <h2 className="mb-3 text-sm font-semibold">Recent lead form submissions</h2>
            <ul className="space-y-2.5">
              {metaLeads.slice(0, 6).map((l) => (
                <li key={l.id} className="flex items-center justify-between gap-3 text-sm">
                  <span className="truncate">{l.full_name} · {l.lead_form}</span>
                  <StatusBadge status={l.crm_status} />
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-muted-foreground">{compactNumber(impressions)} impressions across all campaigns.</p>
          </div>
        </div>
      </div>
    </PermissionGuard>
  );
}
