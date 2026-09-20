import { differenceInCalendarDays, parseISO } from "date-fns";
import type { Milestone, Task } from "@/lib/types";
import { fmtDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import { UserAvatarGroup } from "@/components/shared/user-avatar";

interface TimelineViewProps {
  tasks: Task[];
  milestones?: Milestone[];
  zoom: "Daily" | "Weekly" | "Monthly";
}

const DAY_WIDTH = { Daily: 34, Weekly: 12, Monthly: 5 };

export function TimelineView({ tasks, milestones = [], zoom }: TimelineViewProps) {
  if (tasks.length === 0) {
    return (
      <p className="surface-card px-6 py-12 text-center text-sm text-muted-foreground">
        No scheduled work to display on the timeline.
      </p>
    );
  }

  const dates = tasks.flatMap((t) => [parseISO(t.start_date), parseISO(t.due_date)]);
  const min = new Date(Math.min(...dates.map((d) => d.getTime())));
  const max = new Date(Math.max(...dates.map((d) => d.getTime())));
  const totalDays = Math.max(1, differenceInCalendarDays(max, min) + 2);
  const dayWidth = DAY_WIDTH[zoom];
  const width = totalDays * dayWidth;
  const today = new Date();
  const todayOffset = differenceInCalendarDays(today, min) * dayWidth;

  const ticks = Array.from({ length: totalDays }).filter((_, i) =>
    zoom === "Daily" ? i % 2 === 0 : zoom === "Weekly" ? i % 7 === 0 : i % 30 === 0,
  );

  return (
    <div className="surface-card overflow-hidden">
      <div className="scrollbar-thin overflow-x-auto">
        <div style={{ width: width + 260 }} className="min-w-full">
          <div className="flex border-b bg-surface-muted/60 text-xs text-muted-foreground">
            <div className="w-40 shrink-0 px-3 py-2 font-medium sm:w-[260px] sm:px-4">Task</div>
            <div className="relative h-8 flex-1">
              {ticks.map((_, i) => {
                const index = zoom === "Daily" ? i * 2 : zoom === "Weekly" ? i * 7 : i * 30;
                const d = new Date(min);
                d.setDate(d.getDate() + index);
                return (
                  <span
                    key={i}
                    className="absolute top-2 whitespace-nowrap border-l pl-1"
                    style={{ left: index * dayWidth }}
                  >
                    {fmtDate(d, zoom === "Monthly" ? "MMM yy" : "dd MMM")}
                  </span>
                );
              })}
            </div>
          </div>

          <div className="relative divide-y">
            <div
              className="pointer-events-none absolute bottom-0 top-0 left-40 z-10 w-px bg-destructive/60 sm:left-[260px]"
              style={{ transform: `translateX(${todayOffset}px)` }}
            />
            {tasks.map((task) => {
              const start = differenceInCalendarDays(parseISO(task.start_date), min) * dayWidth;
              const span =
                Math.max(1, differenceInCalendarDays(parseISO(task.due_date), parseISO(task.start_date)) + 1) *
                dayWidth;
              const overdue = parseISO(task.due_date) < today && task.status !== "Completed";
              return (
                <div key={task.id} className="flex items-center hover:bg-accent/40">
                  <div className="w-40 shrink-0 px-3 py-2.5 sm:w-[260px] sm:px-4">
                    <p className="truncate text-sm font-medium">{task.title}</p>
                    <p className="text-xs text-muted-foreground">{task.code}</p>
                  </div>
                  <div className="relative h-12 flex-1">
                    <div
                      className={cn(
                        "absolute top-3 flex h-6 items-center gap-2 rounded-md px-2 text-[11px] font-medium text-primary-foreground",
                        task.status === "Completed" ? "bg-success" : overdue ? "bg-destructive" : "bg-primary",
                      )}
                      style={{ left: start, width: Math.max(span, 44) }}
                      title={`${task.title} — ${task.progress}%`}
                    >
                      <span className="truncate">{task.progress}%</span>
                      <span className="ml-auto hidden xl:block">
                        <UserAvatarGroup userIds={task.assignee_ids} max={2} />
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}

            {milestones.map((ms) => {
              const left = differenceInCalendarDays(parseISO(ms.due_date), min) * dayWidth;
              return (
                <div key={ms.id} className="flex items-center bg-surface-muted/40">
                  <div className="w-40 shrink-0 px-3 py-2.5 sm:w-[260px] sm:px-4">
                    <p className="truncate text-sm font-medium">◆ {ms.name}</p>
                    <p className="text-xs text-muted-foreground">Milestone</p>
                  </div>
                  <div className="relative h-10 flex-1">
                    <span
                      className="absolute top-3 size-4 rotate-45 rounded-sm bg-chart-5"
                      style={{ left }}
                      title={`${ms.name} — ${fmtDate(ms.due_date)}`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
