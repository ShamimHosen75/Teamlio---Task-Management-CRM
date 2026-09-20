import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import {
  CircleDollarSign,
  FolderKanban,
  Handshake,
  ListChecks,
  Receipt,
  Target,
  Users,
} from "lucide-react";
import { StatCard } from "@/components/shared/stat-card";
import { MetricChart } from "@/components/shared/metric-chart";
import { EmptyState } from "@/components/shared/states";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { LivePage, useLiveOrgContext } from "@/components/cloud/crm-ui";
import { prettyStatus } from "@/components/cloud/work-ui";
import { fmtDate, money } from "@/lib/format";
import { useOrgProjects, useOrgTasks } from "@/hooks/use-cloud";
import { useOrgClients, useOrgDeals, useOrgLeads } from "@/hooks/use-crm-cloud";
import {
  invoicePaid,
  invoiceTotal,
  useOrgInvoiceItems,
  useOrgInvoices,
  useOrgPayments,
} from "@/hooks/use-billing-cloud";

export const Route = createFileRoute("/_authenticated/admin/dashboard")({
  component: LiveDashboardPage,
  head: () => ({
    meta: [
      { title: "Live Admin Dashboard | Project CRM" },
      {
        name: "description",
        content:
          "Live counts and charts for leads, deals, projects, tasks and invoices from your own workspace records.",
      },
      { property: "og:title", content: "Live Admin Dashboard | Project CRM" },
      {
        property: "og:description",
        content: "Real-time workspace metrics across sales pipeline, delivery and billing.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

function countBy<T>(rows: T[], key: (row: T) => string) {
  const map = new Map<string, number>();
  for (const row of rows) {
    const k = key(row);
    map.set(k, (map.get(k) ?? 0) + 1);
  }
  return map;
}

function LiveDashboardPage() {
  return (
    <LivePage
      title="Live admin dashboard"
      description="Counts and charts built from your real leads, deals, projects, tasks and invoices."
    >
      <DashboardBody />
    </LivePage>
  );
}

function DashboardBody() {
  const { activeOrgId, members } = useLiveOrgContext();
  const { data: projects = [], isLoading: lp } = useOrgProjects(activeOrgId);
  const { data: tasks = [] } = useOrgTasks(activeOrgId);
  const { data: leads = [] } = useOrgLeads(activeOrgId);
  const { data: deals = [] } = useOrgDeals(activeOrgId);
  const { data: clients = [] } = useOrgClients(activeOrgId);
  const { data: invoices = [] } = useOrgInvoices(activeOrgId);
  const { data: invoiceItems = [] } = useOrgInvoiceItems(activeOrgId);
  const { data: payments = [] } = useOrgPayments(activeOrgId);

  const stats = useMemo(() => {
    const openDeals = deals.filter((d) => d.stage !== "won" && d.stage !== "lost");
    const wonDeals = deals.filter((d) => d.stage === "won");
    const activeProjects = projects.filter((p) => p.status !== "completed");
    const openTasks = tasks.filter((t) => t.status !== "completed");
    const billed = invoices.reduce(
      (sum, inv) => sum + invoiceTotal(inv, invoiceItems.filter((i) => i.invoice_id === inv.id)),
      0,
    );
    const collected = payments.reduce((sum, p) => sum + Number(p.amount), 0);
    return {
      openDeals,
      wonDeals,
      activeProjects,
      openTasks,
      pipelineValue: openDeals.reduce((s, d) => s + Number(d.value), 0),
      weighted: openDeals.reduce((s, d) => s + (Number(d.value) * Number(d.probability)) / 100, 0),
      billed,
      collected,
      outstanding: Math.max(billed - collected, 0),
    };
  }, [deals, projects, tasks, invoices, invoiceItems, payments]);

  const leadsByStatus = useMemo(() => {
    const map = countBy(leads, (l) => l.status);
    return [...map].map(([status, count]) => ({ status: prettyStatus(status), count }));
  }, [leads]);

  const pipelineByStage = useMemo(() => {
    const map = new Map<string, number>();
    for (const d of deals) map.set(d.stage, (map.get(d.stage) ?? 0) + Number(d.value));
    return [...map].map(([stage, value]) => ({ stage: prettyStatus(stage), value }));
  }, [deals]);

  const projectsByStatus = useMemo(() => {
    const map = countBy(projects, (p) => p.status);
    return [...map].map(([status, count]) => ({ status: prettyStatus(status), count }));
  }, [projects]);

  const tasksByStatus = useMemo(() => {
    const map = countBy(tasks, (t) => t.status);
    return [...map].map(([status, count]) => ({ status: prettyStatus(status), count }));
  }, [tasks]);

  const invoiceMix = useMemo(() => {
    const map = new Map<string, number>();
    for (const inv of invoices) {
      const total = invoiceTotal(inv, invoiceItems.filter((i) => i.invoice_id === inv.id));
      map.set(inv.status, (map.get(inv.status) ?? 0) + total);
    }
    return [...map].map(([status, value]) => ({ status: prettyStatus(status), value }));
  }, [invoices, invoiceItems]);

  const recentInvoices = useMemo(() => invoices.slice(0, 5), [invoices]);

  const everythingEmpty =
    !lp &&
    leads.length === 0 &&
    deals.length === 0 &&
    projects.length === 0 &&
    tasks.length === 0 &&
    invoices.length === 0;

  if (everythingEmpty) {
    return (
      <EmptyState
        icon={FolderKanban}
        title="No records yet"
        description="Add your first lead, project or invoice and this dashboard fills in straight away."
      />
    );
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Leads" value={leads.length} icon={Target} hint={`${clients.length} clients`} />
        <StatCard
          label="Open pipeline"
          value={money(stats.pipelineValue)}
          icon={Handshake}
          tone="success"
          hint={`${stats.openDeals.length} open deals · ${money(stats.weighted)} weighted`}
        />
        <StatCard
          label="Active projects"
          value={stats.activeProjects.length}
          icon={FolderKanban}
          hint={`${projects.length} total · ${stats.openTasks.length} open tasks`}
        />
        <StatCard
          label="Outstanding"
          value={money(stats.outstanding)}
          icon={CircleDollarSign}
          tone={stats.outstanding > 0 ? "warning" : "success"}
          hint={`${money(stats.collected)} collected of ${money(stats.billed)}`}
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Tasks" value={tasks.length} icon={ListChecks} hint={`${stats.openTasks.length} still open`} />
        <StatCard label="Invoices" value={invoices.length} icon={Receipt} hint={`${payments.length} payments`} />
        <StatCard label="Won deals" value={stats.wonDeals.length} icon={Handshake} tone="success" />
        <StatCard label="People" value={members.length} icon={Users} hint="Active workspace members" />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <ChartCard title="Pipeline value by stage" subtitle="Deal value grouped by sales stage">
          {pipelineByStage.length ? (
            <MetricChart type="bar" data={pipelineByStage} xKey="stage" series={[{ key: "value", label: "Value" }]} />
          ) : (
            <NoData label="No deals yet" />
          )}
        </ChartCard>
        <ChartCard title="Leads by status" subtitle="Where your leads sit right now">
          {leadsByStatus.length ? (
            <MetricChart type="pie" data={leadsByStatus} xKey="status" series={[{ key: "count", label: "Leads" }]} />
          ) : (
            <NoData label="No leads yet" />
          )}
        </ChartCard>
        <ChartCard title="Projects by status" subtitle="Delivery workload across the workspace">
          {projectsByStatus.length ? (
            <MetricChart
              type="bar"
              data={projectsByStatus}
              xKey="status"
              series={[{ key: "count", label: "Projects" }]}
            />
          ) : (
            <NoData label="No projects yet" />
          )}
        </ChartCard>
        <ChartCard title="Tasks by status" subtitle="Backlog through completed">
          {tasksByStatus.length ? (
            <MetricChart type="bar" data={tasksByStatus} xKey="status" series={[{ key: "count", label: "Tasks" }]} />
          ) : (
            <NoData label="No tasks yet" />
          )}
        </ChartCard>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <ChartCard title="Invoice value by status" subtitle="Billed amounts grouped by invoice status">
          {invoiceMix.length ? (
            <MetricChart type="pie" data={invoiceMix} xKey="status" series={[{ key: "value", label: "Value" }]} />
          ) : (
            <NoData label="No invoices yet" />
          )}
        </ChartCard>
        <div className="surface-card p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold">Recent invoices</h2>
              <p className="text-xs text-muted-foreground">Latest billing activity</p>
            </div>
            <Link to="/business/invoices" className="text-xs font-medium text-primary hover:underline">
              View all
            </Link>
          </div>
          <div className="mt-3 space-y-2">
            {recentInvoices.length === 0 ? (
              <NoData label="No invoices yet" />
            ) : (
              recentInvoices.map((inv) => {
                const total = invoiceTotal(inv, invoiceItems.filter((i) => i.invoice_id === inv.id));
                const paid = invoicePaid(inv, payments);
                return (
                  <div key={inv.id} className="rounded-lg border border-border/70 p-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-sm font-medium">{inv.invoice_number}</span>
                      <Badge variant="secondary">{prettyStatus(inv.status)}</Badge>
                    </div>
                    <div className="mt-1 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
                      <span>Issued {fmtDate(inv.issue_date)}</span>
                      <span>
                        {money(paid, inv.currency)} of {money(total, inv.currency)}
                      </span>
                    </div>
                    <Progress className="mt-2 h-1.5" value={total > 0 ? Math.min((paid / total) * 100, 100) : 0} />
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ChartCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="surface-card p-4">
      <h2 className="text-sm font-semibold">{title}</h2>
      <p className="text-xs text-muted-foreground">{subtitle}</p>
      <div className="mt-3">{children}</div>
    </div>
  );
}

function NoData({ label }: { label: string }) {
  return (
    <div className="flex h-[200px] items-center justify-center rounded-lg border border-dashed border-border text-sm text-muted-foreground">
      {label}
    </div>
  );
}
