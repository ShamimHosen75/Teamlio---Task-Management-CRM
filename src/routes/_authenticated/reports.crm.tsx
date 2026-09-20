import { createFileRoute } from "@tanstack/react-router";
import { StatCard } from "@/components/shared/stat-card";
import { MetricChart } from "@/components/shared/metric-chart";
import { LivePage, useLiveOrgContext } from "@/components/cloud/crm-ui";
import { prettyStatus } from "@/components/cloud/work-ui";
import { money, percent } from "@/lib/format";
import { DEAL_STAGES, LEAD_SOURCES, useOrgClients, useOrgDeals, useOrgLeads } from "@/hooks/use-crm-cloud";

export const Route = createFileRoute("/_authenticated/reports/crm")({
  head: () => ({
    meta: [
      { title: "CRM Reports — Project CRM" },
      { name: "description", content: "Where your real business comes from: lead sources, pipeline value and win rate." },
      { property: "og:title", content: "CRM Reports — Project CRM" },
      { property: "og:description", content: "Live lead sources, pipeline value and conversion." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CrmReports,
});

function CrmReports() {
  const { activeOrgId } = useLiveOrgContext();
  const { data: leads = [], isLoading } = useOrgLeads(activeOrgId);
  const { data: deals = [] } = useOrgDeals(activeOrgId);
  const { data: clients = [] } = useOrgClients(activeOrgId);

  const won = deals.filter((d) => d.stage === "won");
  const lost = deals.filter((d) => d.stage === "lost");
  const open = deals.filter((d) => d.stage !== "won" && d.stage !== "lost");
  const convertedLeads = leads.filter((l) => l.converted_client_id || l.status === "won").length;

  const bySource = LEAD_SOURCES.map((source) => ({
    name: source,
    value: leads.filter((l) => l.source === source).length,
  })).filter((row) => row.value > 0);

  const byStage = DEAL_STAGES.map((stage) => ({
    name: prettyStatus(stage),
    Value: deals.filter((d) => d.stage === stage).reduce((sum, d) => sum + Number(d.value), 0),
  }));

  return (
    <LivePage title="CRM reports" description="How your real new business arrives and how much of it closes.">
      <div className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Leads" value={leads.length} hint={`${clients.length} clients`} loading={isLoading} />
          <StatCard label="Open pipeline" value={money(open.reduce((s, d) => s + Number(d.value), 0))} loading={isLoading} />
          <StatCard label="Won value" value={money(won.reduce((s, d) => s + Number(d.value), 0))} tone="success" loading={isLoading} />
          <StatCard
            label="Win rate"
            value={percent(won.length + lost.length ? (won.length / (won.length + lost.length)) * 100 : 0)}
            loading={isLoading}
          />
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="surface-card p-4">
            <h2 className="mb-2 text-sm font-semibold">Pipeline value by stage</h2>
            <MetricChart type="bar" data={byStage} xKey="name" series={[{ key: "Value", label: "Value" }]} />
          </div>
          <div className="surface-card p-4">
            <h2 className="mb-2 text-sm font-semibold">Leads by source</h2>
            {bySource.length ? (
              <MetricChart type="pie" data={bySource} xKey="name" series={[{ key: "value", label: "Leads" }]} />
            ) : (
              <p className="py-10 text-center text-sm text-muted-foreground">Add leads to see where they come from.</p>
            )}
          </div>
        </div>

        <div className="surface-card p-4">
          <h2 className="text-sm font-semibold">Lead to client conversion</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {convertedLeads} of {leads.length || 0} leads became clients
            {leads.length ? ` — ${percent((convertedLeads / leads.length) * 100)} conversion` : ""}.
          </p>
        </div>
      </div>
    </LivePage>
  );
}
