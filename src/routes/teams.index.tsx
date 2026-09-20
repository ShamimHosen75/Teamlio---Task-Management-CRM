import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/shared/page-header";
import { SkeletonGrid } from "@/components/shared/states";
import { PermissionGuard } from "@/components/shared/permission-guard";
import { UserAvatarGroup, userName } from "@/components/shared/user-avatar";
import { StatusBadge } from "@/components/shared/badges";
import { Progress } from "@/components/ui/progress";
import { useTasks, useTeams, useUsers } from "@/hooks/use-data";

export const Route = createFileRoute("/teams/")({
  head: () => ({
    meta: [
      { title: "Teams — Teamlio" },
      { name: "description", content: "Team structure, leads, capacity and current workload." },
      { property: "og:title", content: "Teams — Teamlio" },
      { property: "og:description", content: "Team structure, capacity and workload." },
    ],
  }),
  component: TeamsPage,
});

function TeamsPage() {
  const { data: teams = [], isLoading } = useTeams();
  const { data: tasks = [] } = useTasks();
  const { data: users = [] } = useUsers();

  return (
    <PermissionGuard permission="team.read" mode="page">
      <div className="mx-auto max-w-[1600px]">
        <PageHeader title="Teams" description="How delivery capacity is organised across the organisation." />
        {isLoading ? (
          <SkeletonGrid />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {teams.map((t) => {
              const teamTasks = tasks.filter((task) => task.team_id === t.id);
              const openTasks = teamTasks.filter((task) => task.status !== "Completed").length;
              const load = teamTasks.length ? Math.round(((teamTasks.length - openTasks) / teamTasks.length) * 100) : 0;
              return (
                <Link key={t.id} to="/teams/$teamId" params={{ teamId: t.id }} className="surface-card p-4 hover:shadow-raised">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-sm font-semibold">{t.name}</h3>
                      <p className="text-xs text-muted-foreground">Lead · {userName(t.lead_user_id)}</p>
                    </div>
                    <StatusBadge status={t.status} />
                  </div>
                  <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">{t.description}</p>
                  <div className="mt-4 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Completion</span>
                      <span className="font-medium">{load}%</span>
                    </div>
                    <Progress value={load} className="h-1.5" />
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{openTasks} open tasks</span>
                    <UserAvatarGroup userIds={users.slice(0, 4).map((u) => u.id)} />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </PermissionGuard>
  );
}
