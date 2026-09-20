import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { StatCard } from "@/components/shared/stat-card";
import { MetricChart } from "@/components/shared/metric-chart";
import { SkeletonTable } from "@/components/shared/states";
import { LivePage, useLiveOrgContext } from "@/components/cloud/crm-ui";
import { prettyStatus } from "@/components/cloud/work-ui";
import { fmtDate, money, percent } from "@/lib/format";
import { cn } from "@/lib/utils";
import {
  DEAL_STAGES,
  LEAD_STATUSES,
  useOrgClients,
  useOrgDeals,
  useOrgLeads,
  useUpdateDealCloud,
  type DealStage,
} from "@/hooks/use-crm-cloud";

export const Route = createFileRoute("/_authenticated/crm/pipeline")({
  head: () => ({
    meta: [
      { title: "Sales Pipeline — Project CRM" },
      { name: "description", content: "Drag real deals between stages and watch pipeline value and conversion update." },
      { property: "og:title", content: "Sales Pipeline — Project CRM" },
      { property: "og:description", content: "Live pipeline board, pipeline value and conversion charts." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PipelinePage,
});

function PipelinePage() {
  const { activeOrgId, canManage } = useLiveOrgContext();
  const { data: deals = [], isLoading } = useOrgDeals(activeOrgId);
  const { data: leads = [] } = useOrgLeads(activeOrgId);
  const { data: clients = [] } = useOrgClients(activeOrgId);
  const update = useUpdateDealCloud();
  const [dragOver, setDragOver] = useState<DealStage | null>(null);

  const open = deals.filter((d) => d.stage !== "won" && d.stage !== "lost");
  const won = deals.filter((d) => d.stage === "won");
  const lost = deals.filter((d) => d.stage === "lost");
  const openValue = open.reduce((sum, d) => sum + Number(d.value), 0);
  const weighted = open.reduce((sum, d) => sum + (Number(d.value) * d.probability) / 100, 0);
  const winRate = won.length + lost.length ? (won.length / (won.length + lost.length)) * 100 : 0;

  const valueByStage = DEAL_STAGES.map((stage) => ({
    name: prettyStatus(stage),
    Value: deals.filter((d) => d.stage === stage).reduce((sum, d) => sum + Number(d.value), 0),
  }));
  const leadFunnel = LEAD_STATUSES.map((status) => ({
    name: prettyStatus(status),
    Leads: leads.filter((l) => l.status === status).length,
  }));

  return (
    <LivePage title="Sales pipeline" description="Drag a deal card to move it between stages — every change is saved live.">
      <div className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Open pipeline value" value={money(openValue)} loading={isLoading} />
          <StatCard label="Weighted forecast" value={money(weighted)} tone="success" loading={isLoading} />
          <StatCard label="Leads" value={leads.length} hint={`${clients.length} clients`} loading={isLoading} />
          <StatCard label="Win rate" value={percent(winRate)} tone="success" loading={isLoading} />
        </div>

        {isLoading ? (
          <SkeletonTable />
        ) : (
          <div className="scrollbar-thin -mx-3 flex snap-x snap-mandatory gap-3 overflow-x-auto px-3 pb-3 sm:-mx-1 sm:gap-4 sm:px-1">
            {DEAL_STAGES.map((stage) => {
              const stageDeals = deals.filter((d) => d.stage === stage);
              const total = stageDeals.reduce((sum, d) => sum + Number(d.value), 0);
              return (
                <div
                  key={stage}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOver(stage);
                  }}
                  onDragLeave={() => setDragOver(null)}
                  onDrop={(e) => {
                    e.preventDefault();
                    const id = e.dataTransfer.getData("text/plain");
                    setDragOver(null);
                    if (!id || !canManage) return;
                    update.mutate(
                      { id, stage },
                      { onSuccess: () => toast.success(`Deal moved to ${prettyStatus(stage)}`) },
                    );
                  }}
                  className={cn(
                    "w-[calc(100vw-2.5rem)] max-w-[320px] shrink-0 snap-start rounded-xl border bg-surface-muted/50 p-3 sm:w-[280px]",
                    dragOver === stage && "border-primary bg-primary-soft/40",
                  )}
                >
                  <div className="mb-3 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold">{prettyStatus(stage)}</p>
                      <p className="text-xs text-muted-foreground">{money(total)}</p>
                    </div>
                    <span className="rounded-full bg-surface px-2 py-0.5 text-xs text-muted-foreground">{stageDeals.length}</span>
                  </div>
                  <div className="space-y-2.5">
                    {stageDeals.map((deal) => (
                      <div
                        key={deal.id}
                        draggable={canManage}
                        onDragStart={(e) => e.dataTransfer.setData("text/plain", deal.id)}
                        className="surface-card cursor-grab p-3 active:cursor-grabbing"
                      >
                        <p className="text-sm font-medium">{deal.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {clients.find((c) => c.id === deal.client_id)?.company ?? "New business"}
                        </p>
                        <p className="mt-2 text-sm font-semibold">{money(Number(deal.value))}</p>
                        <p className="mt-1 text-[11px] text-muted-foreground">
                          {deal.probability}% · close {fmtDate(deal.expected_close_date)}
                        </p>
                      </div>
                    ))}
                    {stageDeals.length === 0 ? (
                      <p className="rounded-lg border border-dashed px-3 py-6 text-center text-xs text-muted-foreground">
                        Drop a deal here
                      </p>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="surface-card p-4">
            <h2 className="mb-2 text-sm font-semibold">Pipeline value by stage</h2>
            <MetricChart type="bar" data={valueByStage} xKey="name" series={[{ key: "Value", label: "Value" }]} />
          </div>
          <div className="surface-card p-4">
            <h2 className="mb-2 text-sm font-semibold">Lead conversion funnel</h2>
            <MetricChart type="bar" data={leadFunnel} xKey="name" series={[{ key: "Leads", label: "Leads" }]} />
          </div>
        </div>
      </div>
    </LivePage>
  );
}
