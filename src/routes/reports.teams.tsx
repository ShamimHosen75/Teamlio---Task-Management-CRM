import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { MetricChart } from "@/components/shared/metric-chart";
import { PermissionGuard } from "@/components/shared/permission-guard";
import { UserCell } from "@/components/shared/user-avatar";
import { Progress } from "@/components/ui/progress";
import { percent } from "@/lib/format";
import { useTasks, useTeams, useUsers } from "@/hooks/use-data";

export const Route = createFileRoute("/reports/teams")({
  head: () => ({
    meta: [
      { title: "Team Reports — Teamlio" },
      { name: "description", content: "Workload distribution and completion rate across teams." },
      { property: "og:title", content: "Team Reports — Teamlio" },
      { property: "og:description", content: "Workload and throughput by team and person." },
    ],
  }),
  component: TeamReports,
});

function TeamReports() {
  const { data: teams = [], isLoading } = useTeams();
  const { data: users = [] } = useUsers();
  const { data: tasks = [] } = useTasks();

  const perUser = users
    .map((u) => {
      const assigned = tasks.filter((t) => t.assignee_ids.includes(u.id));
      const done = assigned.filter((t) => t.status === "Completed").length;
      return { user: u, open: assigned.length - done, done, total: assigned.length };
    })
    .filter((r) => r.total > 0)
    .sort((a, b) => b.open - a.open);

  const chart = perUser.slice(0, 10).map((r) => ({ name: r.user.full_name.split(" ")[0], Open: r.open, Completed: r.done }));
  const completed = tasks.filter((t) => t.status === "Completed").length;

  return (
    <PermissionGuard permission="report.read" mode="page">
      <div className="mx-auto max-w-[1400px]">
        <PageHeader title="Team reports" description="Who is carrying what, and how much is getting finished." />
        <div className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Teams" value={teams.length} loading={isLoading} />
          <StatCard label="People with work" value={perUser.length} loading={isLoading} />
          <StatCard label="Tasks completed" value={completed} tone="success" loading={isLoading} />
          <StatCard label="Completion rate" value={percent(tasks.length ? (completed / tasks.length) * 100 : 0)} loading={isLoading} />
        </div>
        <div className="mb-5 surface-card p-4">
          <h2 className="mb-2 text-sm font-semibold">Workload distribution</h2>
          <MetricChart type="bar" data={chart} xKey="name" series={[{ key: "Open", label: "Open" }, { key: "Completed", label: "Completed" }]} />
        </div>
        <div className="surface-card overflow-hidden">
          <h2 className="border-b px-4 py-3 text-sm font-semibold">Per person</h2>
          <ul className="divide-y">
            {perUser.map((r) => (
              <li key={r.user.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
                <UserCell userId={r.user.id} subtitle={r.user.job_title} />
                <div className="flex min-w-0 flex-1 items-center gap-3 sm:min-w-[200px]">
                  <Progress value={r.total ? (r.done / r.total) * 100 : 0} className="h-1.5" />
                  <span className="text-xs text-muted-foreground">{r.done}/{r.total}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </PermissionGuard>
  );
}
