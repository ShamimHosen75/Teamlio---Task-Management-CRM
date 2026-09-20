import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { MetricChart } from "@/components/shared/metric-chart";
import { PermissionGuard } from "@/components/shared/permission-guard";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DATE_RANGES } from "@/lib/constants";
import { lineItemsTotal, money, percent } from "@/lib/format";
import { useDeals, useExpenses, useInvoices, useProjects, useTasks } from "@/hooks/use-data";

export const Route = createFileRoute("/analytics")({
  head: () => ({
    meta: [
      { title: "Analytics — Teamlio" },
      { name: "description", content: "Cross-module analytics for delivery, sales and finance." },
      { property: "og:title", content: "Analytics — Teamlio" },
      { property: "og:description", content: "Delivery, sales and finance analytics." },
    ],
  }),
  component: AnalyticsPage,
});

function AnalyticsPage() {
  const [range, setRange] = useState(DATE_RANGES[2]);
  const { data: projects = [], isLoading } = useProjects();
  const { data: tasks = [] } = useTasks();
  const { data: deals = [] } = useDeals();
  const { data: invoices = [] } = useInvoices();
  const { data: expenses = [] } = useExpenses();

  const invoiced = invoices.reduce((s, i) => s + lineItemsTotal(i.items, i.discount, i.tax_rate).total, 0);
  const spent = expenses.reduce((s, e) => s + e.amount, 0);
  const completed = tasks.filter((t) => t.status === "Completed").length;

  const throughput = ["Week 1", "Week 2", "Week 3", "Week 4", "Week 5", "Week 6"].map((name, i) => ({
    name,
    Completed: Math.round(completed / 6) + ((i * 7) % 9) - 3,
    Created: Math.round(tasks.length / 6) + ((i * 5) % 7) - 2,
  }));

  const finance = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"].map((name, i) => ({
    name,
    Revenue: Math.round((invoiced / 6) * (0.8 + ((i * 13) % 5) / 10)),
    Expenses: Math.round((spent / 6) * (0.8 + ((i * 7) % 5) / 10)),
  }));

  return (
    <PermissionGuard permission="report.read" mode="page">
      <div className="mx-auto max-w-[1500px]">
        <PageHeader
          title="Analytics"
          description="One view across delivery, sales and finance."
          actions={
            <Tabs value={range} onValueChange={setRange}>
              <TabsList>
                {DATE_RANGES.map((r) => (
                  <TabsTrigger key={r} value={r}>{r}</TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          }
        />
        <div className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Active projects" value={projects.filter((p) => p.status === "In Progress").length} loading={isLoading} />
          <StatCard label="Task completion" value={percent(tasks.length ? (completed / tasks.length) * 100 : 0)} loading={isLoading} />
          <StatCard label="Invoiced" value={money(invoiced)} tone="success" loading={isLoading} />
          <StatCard label="Net margin" value={percent(invoiced ? ((invoiced - spent) / invoiced) * 100 : 0)} loading={isLoading} />
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="surface-card p-4">
            <h2 className="mb-2 text-sm font-semibold">Task throughput</h2>
            <MetricChart type="area" data={throughput} xKey="name" series={[{ key: "Created", label: "Created" }, { key: "Completed", label: "Completed" }]} />
          </div>
          <div className="surface-card p-4">
            <h2 className="mb-2 text-sm font-semibold">Revenue vs expenses</h2>
            <MetricChart type="line" data={finance} xKey="name" series={[{ key: "Revenue", label: "Revenue" }, { key: "Expenses", label: "Expenses" }]} />
          </div>
          <div className="surface-card p-4 lg:col-span-2">
            <h2 className="mb-2 text-sm font-semibold">Deal value by stage</h2>
            <MetricChart
              type="bar"
              data={Object.entries(
                deals.reduce<Record<string, number>>((acc, d) => {
                  acc[d.stage] = (acc[d.stage] ?? 0) + d.value;
                  return acc;
                }, {}),
              ).map(([name, value]) => ({ name, value }))}
              xKey="name"
              series={[{ key: "value", label: "Value" }]}
            />
          </div>
        </div>
      </div>
    </PermissionGuard>
  );
}
