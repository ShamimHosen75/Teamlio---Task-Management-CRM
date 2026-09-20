import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { MetricChart } from "@/components/shared/metric-chart";
import { StatusBadge } from "@/components/shared/badges";
import { PermissionGuard } from "@/components/shared/permission-guard";
import { Progress } from "@/components/ui/progress";
import { percent } from "@/lib/format";
import { useProjects, useTasks } from "@/hooks/use-data";

export const Route = createFileRoute("/reports/projects")({
  head: () => ({
    meta: [
      { title: "Project Reports — Teamlio" },
      { name: "description", content: "Delivery health, completion rate and overdue work by project." },
      { property: "og:title", content: "Project Reports — Teamlio" },
      { property: "og:description", content: "Delivery health and completion by project." },
    ],
  }),
  component: ProjectReports,
});

function ProjectReports() {
  const { data: projects = [], isLoading } = useProjects();
  const { data: tasks = [] } = useTasks();
  const today = new Date().toISOString().slice(0, 10);

  const rows = projects.map((p) => {
    const pt = tasks.filter((t) => t.project_id === p.id);
    const done = pt.filter((t) => t.status === "Completed").length;
    const overdue = pt.filter((t) => t.due_date && t.due_date < today && t.status !== "Completed").length;
    return { project: p, total: pt.length, done, overdue, progress: pt.length ? (done / pt.length) * 100 : 0 };
  });

  const statusMix = Object.entries(
    projects.reduce<Record<string, number>>((acc, p) => {
      acc[p.status] = (acc[p.status] ?? 0) + 1;
      return acc;
    }, {}),
  ).map(([name, value]) => ({ name, value }));

  return (
    <PermissionGuard permission="report.read" mode="page">
      <div className="mx-auto max-w-[1400px]">
        <PageHeader title="Project reports" description="How delivery is tracking across the portfolio." />
        <div className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Projects" value={projects.length} loading={isLoading} />
          <StatCard label="On track" value={projects.filter((p) => p.health === "On Track").length} tone="success" loading={isLoading} />
          <StatCard label="At risk" value={projects.filter((p) => p.health === "At Risk").length} tone="warning" loading={isLoading} />
          <StatCard label="Off track" value={projects.filter((p) => p.health === "Off Track").length} tone="destructive" loading={isLoading} />
        </div>
        <div className="mb-5 surface-card p-4">
          <h2 className="mb-2 text-sm font-semibold">Projects by status</h2>
          <MetricChart type="bar" data={statusMix} xKey="name" series={[{ key: "value", label: "Projects" }]} height={220} />
        </div>
        <div className="surface-card overflow-hidden">
          <h2 className="border-b px-4 py-3 text-sm font-semibold">Completion by project</h2>
          <ul className="divide-y">
            {rows.map((r) => (
              <li key={r.project.id} className="px-4 py-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-medium">{r.project.name}</p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span>{r.done}/{r.total} tasks</span>
                    {r.overdue > 0 ? <span className="text-destructive">{r.overdue} overdue</span> : null}
                    <StatusBadge status={r.project.health} />
                  </div>
                </div>
                <div className="mt-2 flex items-center gap-3">
                  <Progress value={r.progress} className="h-1.5" />
                  <span className="w-12 text-right text-xs text-muted-foreground">{percent(r.progress)}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </PermissionGuard>
  );
}
