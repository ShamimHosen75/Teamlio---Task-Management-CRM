import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { FilterBar } from "@/components/shared/filter-bar";
import { SkeletonTable } from "@/components/shared/states";
import { PermissionGuard } from "@/components/shared/permission-guard";
import { TimelineView } from "@/components/tasks/timeline-view";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMilestones, useProjects, useTasks } from "@/hooks/use-data";

export const Route = createFileRoute("/timeline")({
  head: () => ({
    meta: [
      { title: "Timeline — Teamlio" },
      { name: "description", content: "Gantt-style delivery timeline with daily, weekly and monthly zoom." },
      { property: "og:title", content: "Timeline — Teamlio" },
      { property: "og:description", content: "Gantt-style schedule across projects and milestones." },
    ],
  }),
  component: TimelinePage,
});

function TimelinePage() {
  const { data: tasks = [], isLoading } = useTasks();
  const { data: milestones = [] } = useMilestones();
  const { data: projects = [] } = useProjects();
  const [zoom, setZoom] = useState<"Daily" | "Weekly" | "Monthly">("Weekly");
  const [project, setProject] = useState("all");

  const projectName = (id: string) => projects.find((p) => p.id === id)?.name ?? "—";
  const rows = tasks.filter((t) => project === "all" || projectName(t.project_id) === project);

  return (
    <PermissionGuard permission="task.read" mode="page">
      <div className="mx-auto max-w-[1600px]">
        <PageHeader
          title="Delivery timeline"
          description="Scroll horizontally to explore scheduled work and milestones."
          actions={
            <>
              <FilterBar
                filters={[{ key: "project", label: "Project", options: projects.map((p) => p.name), value: project, onChange: setProject }]}
              />
              <Tabs value={zoom} onValueChange={(v) => setZoom(v as typeof zoom)}>
                <TabsList>
                  {["Daily", "Weekly", "Monthly"].map((z) => (
                    <TabsTrigger key={z} value={z}>{z}</TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </>
          }
        />
        {isLoading ? <SkeletonTable /> : <TimelineView tasks={rows} milestones={milestones} zoom={zoom} />}
      </div>
    </PermissionGuard>
  );
}
