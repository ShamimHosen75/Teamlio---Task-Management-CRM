import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { FilterBar } from "@/components/shared/filter-bar";
import { SkeletonTable } from "@/components/shared/states";
import { PermissionGuard } from "@/components/shared/permission-guard";
import { KanbanBoard } from "@/components/tasks/kanban-board";
import { TaskDetailDrawer } from "@/components/tasks/task-detail-drawer";
import { PRIORITIES } from "@/lib/constants";
import { useProjects, useTasks, useUpdateTask } from "@/hooks/use-data";
import type { Task, TaskStatus } from "@/lib/types";

export const Route = createFileRoute("/kanban")({
  head: () => ({
    meta: [
      { title: "Task Board — Teamlio" },
      { name: "description", content: "Drag tasks across stages on a board backed by the same task records." },
      { property: "og:title", content: "Task Board — Teamlio" },
      { property: "og:description", content: "Drag-and-drop board on the shared task model." },
    ],
  }),
  component: KanbanPage,
});

function KanbanPage() {
  const { data: tasks = [], isLoading } = useTasks();
  const { data: projects = [] } = useProjects();
  const update = useUpdateTask();
  const [project, setProject] = useState("all");
  const [priority, setPriority] = useState("all");
  const [openTask, setOpenTask] = useState<Task | null>(null);

  const projectName = (id: string) => projects.find((p) => p.id === id)?.name ?? "—";
  const rows = tasks.filter(
    (t) => (project === "all" || projectName(t.project_id) === project) && (priority === "all" || t.priority === priority),
  );

  return (
    <PermissionGuard permission="task.read" mode="page">
      <div className="mx-auto min-w-0 max-w-[1600px]">
        <PageHeader
          title="Task board"
          description="Swipe horizontally on mobile. Drag cards between columns on desktop."
          actions={
            <FilterBar
              filters={[
                { key: "project", label: "Project", options: projects.map((p) => p.name), value: project, onChange: setProject },
                { key: "priority", label: "Priority", options: PRIORITIES, value: priority, onChange: setPriority },
              ]}
            />
          }
        />
        {isLoading ? (
          <SkeletonTable />
        ) : (
          <KanbanBoard
            tasks={rows}
            projectNameFor={(t) => projectName(t.project_id)}
            onOpenTask={setOpenTask}
            onMove={(taskId, status: TaskStatus) => {
              update.mutate({ id: taskId, input: { status } });
              toast.success(`Moved to ${status}`);
            }}
            onAddTask={(status) => toast.info(`Add a task directly to ${status} from the Tasks page`)}
          />
        )}
        <TaskDetailDrawer task={openTask} open={!!openTask} onOpenChange={(o) => !o && setOpenTask(null)} />
      </div>
    </PermissionGuard>
  );
}
