import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { MetricChart } from "@/components/shared/metric-chart";
import { PermissionGuard } from "@/components/shared/permission-guard";
import { compactNumber, money, percent } from "@/lib/format";
import { useCampaigns, useContentItems, useMetaLeads } from "@/hooks/use-data";

export const Route = createFileRoute("/marketing/reports")({
  head: () => ({
    meta: [
      { title: "Marketing Reports — Teamlio" },
      { name: "description", content: "Channel performance, content output and lead conversion." },
      { property: "og:title", content: "Marketing Reports — Teamlio" },
      { property: "og:description", content: "Channel performance and lead conversion." },
    ],
  }),
  component: MarketingReports,
});

function MarketingReports() {
  const { data: campaigns = [], isLoading } = useCampaigns();
  const { data: content = [] } = useContentItems();
  const { data: metaLeads = [] } = useMetaLeads();

  const spend = campaigns.reduce((s, c) => s + c.spend, 0);
  const revenue = campaigns.reduce((s, c) => s + c.revenue, 0);
  const leads = campaigns.reduce((s, c) => s + c.leads, 0);
  const converted = metaLeads.filter((l) => l.crm_status === "Converted").length;

  const byPlatform = Object.entries(
    content.reduce<Record<string, number>>((acc, c) => {
      acc[c.platform] = (acc[c.platform] ?? 0) + 1;
      return acc;
    }, {}),
  ).map(([name, value]) => ({ name, value }));

  const roas = campaigns.map((c) => ({ name: c.name.slice(0, 12), ROAS: c.spend ? Number((c.revenue / c.spend).toFixed(2)) : 0 }));

  return (
    <PermissionGuard permission="marketing.read" mode="page">
      <div className="mx-auto max-w-[1500px]">
        <PageHeader title="Marketing reports" description="Where the marketing budget went and what it returned." />
        <div className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Spend" value={money(spend)} loading={isLoading} />
          <StatCard label="Revenue" value={money(revenue)} tone="success" loading={isLoading} />
          <StatCard label="Leads" value={compactNumber(leads)} loading={isLoading} />
          <StatCard label="Lead conversion" value={percent(metaLeads.length ? (converted / metaLeads.length) * 100 : 0)} loading={isLoading} />
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="surface-card p-4">
            <h2 className="mb-2 text-sm font-semibold">Return on ad spend</h2>
            <MetricChart type="bar" data={roas} xKey="name" series={[{ key: "ROAS", label: "ROAS" }]} />
          </div>
          <div className="surface-card p-4">
            <h2 className="mb-2 text-sm font-semibold">Content output by platform</h2>
            <MetricChart type="pie" data={byPlatform} xKey="name" series={[{ key: "value", label: "Posts" }]} />
          </div>
        </div>
      </div>
    </PermissionGuard>
  );
}
