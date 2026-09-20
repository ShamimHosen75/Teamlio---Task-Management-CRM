import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/badges";
import { SkeletonGrid } from "@/components/shared/states";
import { PermissionGuard } from "@/components/shared/permission-guard";
import { Progress } from "@/components/ui/progress";
import { fmtDate } from "@/lib/format";
import { useMilestones, useProjects } from "@/hooks/use-data";

export const Route = createFileRoute("/milestones")({
  head: () => ({
    meta: [
      { title: "Milestones — Teamlio" },
      { name: "description", content: "Every delivery milestone with progress, owner project and deliverables." },
      { property: "og:title", content: "Milestones — Teamlio" },
      { property: "og:description", content: "Delivery milestones across all active projects." },
    ],
  }),
  component: MilestonesPage,
});

function MilestonesPage() {
  const { data: milestones = [], isLoading } = useMilestones();
  const { data: projects = [] } = useProjects();

  return (
    <PermissionGuard permission="project.read" mode="page">
      <div className="mx-auto max-w-[1600px]">
        <PageHeader title="Milestones" description="Key delivery checkpoints across every active project." />
        {isLoading ? (
          <SkeletonGrid />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {milestones.map((m) => {
              const project = projects.find((p) => p.id === m.project_id);
              return (
                <div key={m.id} className="surface-card p-4">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm font-semibold">{m.name}</h3>
                    <StatusBadge status={m.status} />
                  </div>
                  {project ? (
                    <Link
                      to="/projects/$projectId"
                      params={{ projectId: project.id }}
                      className="text-xs text-primary hover:underline"
                    >
                      {project.name}
                    </Link>
                  ) : null}
                  <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">{m.description}</p>
                  <div className="mt-3 flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Due {fmtDate(m.due_date)}</span>
                    <span className="font-medium">{m.progress}%</span>
                  </div>
                  <Progress value={m.progress} className="mt-2 h-1.5" />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </PermissionGuard>
  );
}
