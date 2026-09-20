import { useState } from "react";
import { Plus } from "lucide-react";
import type { Task, TaskStatus } from "@/lib/types";
import { TASK_STATUSES } from "@/lib/constants";
import { PriorityBadge } from "@/components/shared/badges";
import { UserAvatarGroup } from "@/components/shared/user-avatar";
import { fmtDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface KanbanBoardProps {
  tasks: Task[];
  projectNameFor?: (task: Task) => string;
  onMove: (taskId: string, status: TaskStatus) => void;
  onOpenTask?: (task: Task) => void;
  onAddTask?: (status: TaskStatus) => void;
}

export function KanbanBoard({ tasks, projectNameFor, onMove, onOpenTask, onAddTask }: KanbanBoardProps) {
  const [dragOver, setDragOver] = useState<TaskStatus | null>(null);

  return (
    <div className="scrollbar-thin flex w-full max-w-full snap-x snap-mandatory gap-3 overflow-x-auto px-0 pb-3 sm:gap-4 sm:px-1">
      {TASK_STATUSES.map((status) => {
        const columnTasks = tasks.filter((t) => t.status === status);
        return (
          <section
            key={status}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(status);
            }}
            onDragLeave={() => setDragOver((s) => (s === status ? null : s))}
            onDrop={(e) => {
              e.preventDefault();
              const id = e.dataTransfer.getData("text/task-id");
              if (id) onMove(id, status);
              setDragOver(null);
            }}
            className={cn(
              "flex w-[calc(100vw-2.5rem)] max-w-[320px] shrink-0 snap-start flex-col rounded-xl border bg-surface-muted/70 transition-colors sm:w-[280px]",
              dragOver === status && "border-primary bg-primary-soft/50",
            )}
          >
            <header className="flex items-center justify-between gap-2 px-3 py-2.5">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold">{status}</h3>
                <span className="rounded-full bg-surface px-2 py-0.5 text-xs text-muted-foreground">
                  {columnTasks.length}
                </span>
              </div>
              {onAddTask ? (
                <Button variant="ghost" size="icon" className="size-7" onClick={() => onAddTask(status)}>
                  <Plus className="size-4" />
                  <span className="sr-only">Add task to {status}</span>
                </Button>
              ) : null}
            </header>

            <div className="scrollbar-thin flex max-h-[62vh] flex-col gap-2 overflow-y-auto px-2 pb-3">
              {columnTasks.length === 0 ? (
                <p className="rounded-lg border border-dashed px-3 py-6 text-center text-xs text-muted-foreground">
                  Drop tasks here
                </p>
              ) : (
                columnTasks.map((task) => (
                  <article
                    key={task.id}
                    draggable
                    onDragStart={(e) => e.dataTransfer.setData("text/task-id", task.id)}
                    onClick={() => onOpenTask?.(task)}
                    className="cursor-pointer rounded-lg border bg-surface p-3 shadow-card transition-shadow hover:shadow-raised"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium leading-snug">{task.title}</p>
                      <PriorityBadge priority={task.priority} />
                    </div>
                    {projectNameFor ? (
                      <p className="mt-1 truncate text-xs text-muted-foreground">{projectNameFor(task)}</p>
                    ) : null}
                    <div className="mt-3 flex items-center justify-between">
                      <UserAvatarGroup userIds={task.assignee_ids} max={3} />
                      <span className="text-xs text-muted-foreground">{fmtDate(task.due_date, "dd MMM")}</span>
                    </div>
                    {task.labels.length > 0 ? (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {task.labels.map((l) => (
                          <span key={l} className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                            #{l}
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </article>
                ))
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}
