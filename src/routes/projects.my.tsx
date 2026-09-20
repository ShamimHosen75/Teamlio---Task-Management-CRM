import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/shared/page-header";
import { SkeletonGrid, EmptyState } from "@/components/shared/states";
import { PermissionGuard } from "@/components/shared/permission-guard";
import { ProjectCard } from "@/routes/projects.index";
import { useClients, useProjects } from "@/hooks/use-data";
import { useWorkspace } from "@/app/workspace";

export const Route = createFileRoute("/projects/my")({
  head: () => ({
    meta: [
      { title: "My Projects — Teamlio" },
      { name: "description", content: "Projects you manage or contribute to, in one focused list." },
      { property: "og:title", content: "My Projects — Teamlio" },
      { property: "og:description", content: "Projects you manage or contribute to." },
    ],
  }),
  component: MyProjectsPage,
});

function MyProjectsPage() {
  const { currentUser } = useWorkspace();
  const { data: projects = [], isLoading } = useProjects();
  const { data: clients = [] } = useClients();
  const mine = projects.filter((p) => p.manager_user_id === currentUser.id);

  return (
    <PermissionGuard permission="project.read" mode="page">
      <div className="mx-auto max-w-[1600px]">
        <PageHeader title="My projects" description="Projects where you are the accountable manager." />
        {isLoading ? (
          <SkeletonGrid />
        ) : mine.length === 0 ? (
          <EmptyState title="No projects assigned to you" description="Projects you manage will appear here." />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {mine.map((p) => (
              <ProjectCard key={p.id} project={p} clientName={p.client_name || clients.find((c) => c.id === p.client_id)?.company || "—"} />
            ))}
          </div>
        )}
      </div>
    </PermissionGuard>
  );
}
