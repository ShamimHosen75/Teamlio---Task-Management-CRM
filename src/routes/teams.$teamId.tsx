import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { EmptyState, SkeletonCard } from "@/components/shared/states";
import { PermissionGuard } from "@/components/shared/permission-guard";
import { UserCell, userName } from "@/components/shared/user-avatar";
import { StatusBadge } from "@/components/shared/badges";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { fmtDate } from "@/lib/format";
import { useLeaveRequests, useTasks, useTeamMembers, useTeams } from "@/hooks/use-data";

export const Route = createFileRoute("/teams/$teamId")({
  head: () => ({
    meta: [
      { title: "Team detail — Teamlio" },
      { name: "description", content: "Members, workload and availability for a single delivery team." },
      { property: "og:title", content: "Team detail — Teamlio" },
      { property: "og:description", content: "Team members, workload and availability." },
    ],
  }),
  component: TeamDetailPage,
});

function TeamDetailPage() {
  const { teamId } = Route.useParams();
  const { data: teams = [], isLoading } = useTeams();
  const { data: members = [] } = useTeamMembers(teamId);
  const { data: tasks = [] } = useTasks();
  const { data: leave = [] } = useLeaveRequests();

  if (isLoading) return <SkeletonCard lines={5} />;
  const team = teams.find((t) => t.id === teamId);
  if (!team) return <EmptyState title="Team not found" description="This team may have been disbanded." />;

  const teamTasks = tasks.filter((t) => t.team_id === team.id);
  const open = teamTasks.filter((t) => t.status !== "Completed");

  return (
    <PermissionGuard permission="team.read" mode="page">
      <div className="mx-auto max-w-[1400px]">
        <Link to="/teams" className="mb-3 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" /> All teams
        </Link>
        <PageHeader title={team.name} description={`${team.description} · Led by ${userName(team.lead_user_id)}`} actions={<StatusBadge status={team.status} />} />

        <div className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Members" value={members.length} />
          <StatCard label="Open tasks" value={open.length} />
          <StatCard label="Completed tasks" value={teamTasks.length - open.length} tone="success" />
          <StatCard label="On leave" value={leave.filter((l) => l.status === "Approved").length} tone="warning" />
        </div>

        <Tabs defaultValue="members">
          <TabsList>
            <TabsTrigger value="members">Members</TabsTrigger>
            <TabsTrigger value="workload">Workload</TabsTrigger>
            <TabsTrigger value="availability">Availability</TabsTrigger>
          </TabsList>

          <TabsContent value="members" className="mt-4 surface-card divide-y">
            {members.map((m) => (
              <div key={m.user.id} className="flex items-center justify-between px-4 py-3">
                <UserCell userId={m.user.id} subtitle={m.role_in_team} />
                <StatusBadge status={m.user.status} />
              </div>
            ))}
          </TabsContent>

          <TabsContent value="workload" className="mt-4 surface-card space-y-4 p-4">
            {members.map((m) => {
              const count = tasks.filter((t) => t.assignee_ids.includes(m.user.id) && t.status !== "Completed").length;
              return (
                <div key={m.user.id} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <UserCell userId={m.user.id} />
                    <span className="text-sm font-medium">{count} open</span>
                  </div>
                  <Progress value={Math.min(100, count * 12)} className="h-1.5" />
                </div>
              );
            })}
          </TabsContent>

          <TabsContent value="availability" className="mt-4 surface-card divide-y">
            {leave.slice(0, 8).map((l) => (
              <div key={l.id} className="flex items-center justify-between px-4 py-3 text-sm">
                <div>
                  <p className="font-medium">{userName(l.user_id)}</p>
                  <p className="text-xs text-muted-foreground">
                    {l.leave_type} · {fmtDate(l.start_date)} → {fmtDate(l.end_date)}
                  </p>
                </div>
                <StatusBadge status={l.status} />
              </div>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </PermissionGuard>
  );
}
