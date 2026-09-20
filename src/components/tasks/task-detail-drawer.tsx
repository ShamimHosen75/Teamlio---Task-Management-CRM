import { useState } from "react";
import { toast } from "sonner";
import type { Task, TaskStatus } from "@/lib/types";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { PriorityBadge, StatusBadge } from "@/components/shared/badges";
import { UserAvatarGroup, UserCell } from "@/components/shared/user-avatar";
import { ActivityTimeline } from "@/components/shared/activity-timeline";
import { fmtDate } from "@/lib/format";
import { useActivities, useProjects, useUpdateTask } from "@/hooks/use-data";
import { TASK_STATUSES } from "@/lib/constants";
import { useIsMobile } from "@/hooks/use-mobile";

export function TaskDetailDrawer({
  task,
  open,
  onOpenChange,
}: {
  task: Task | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const update = useUpdateTask();
  const { data: projects = [] } = useProjects();
  const { data: activities = [] } = useActivities();
  const [comment, setComment] = useState("");
  const isMobile = useIsMobile();

  if (!task) return null;
  const project = projects.find((p) => p.id === task.project_id);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side={isMobile ? "bottom" : "right"} className="h-[94dvh] w-full max-w-none gap-0 overflow-y-auto rounded-t-xl p-0 sm:h-full sm:max-w-2xl sm:rounded-none">
        <SheetHeader className="border-b px-4 py-4 pr-12 sm:px-5">
          <p className="text-xs font-medium text-muted-foreground">{task.code}</p>
          <SheetTitle className="text-left text-lg">{task.title}</SheetTitle>
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <StatusBadge status={task.status} />
            <PriorityBadge priority={task.priority} />
            <span className="text-xs text-muted-foreground">{project?.name}</span>
          </div>
        </SheetHeader>

        <Tabs defaultValue="details" className="min-w-0 px-4 py-4 sm:px-5">
          <TabsList className="w-full">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="checklist">Checklist</TabsTrigger>
            <TabsTrigger value="comments">Comments</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-5 pt-4">
            <p className="text-sm text-muted-foreground">{task.description}</p>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Status">
                <Select
                  value={task.status}
                  onValueChange={(value) => {
                    update.mutate({ id: task.id, input: { status: value as TaskStatus } });
                    toast.success("Task status updated");
                  }}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TASK_STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Assignees">
                <UserAvatarGroup userIds={task.assignee_ids} />
              </Field>
              <Field label="Reporter">
                <UserCell userId={task.reporter_id} />
              </Field>
              <Field label="Dates">
                <p className="text-sm">
                  {fmtDate(task.start_date)} → {fmtDate(task.due_date)}
                </p>
              </Field>
            </div>

            <div>
              <div className="mb-1.5 flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-medium">{task.progress}%</span>
              </div>
              <Progress value={task.progress} />
            </div>

            <div className="flex flex-wrap gap-1.5">
              {task.labels.map((l) => (
                <span key={l} className="rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                  #{l}
                </span>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="checklist" className="space-y-3 pt-4">
            {task.checklist.length === 0 ? (
              <p className="text-sm text-muted-foreground">No checklist items.</p>
            ) : (
              task.checklist.map((item) => (
                <label key={item.id} className="flex items-center gap-3 rounded-lg border p-3 text-sm">
                  <Checkbox
                    checked={item.done}
                    onCheckedChange={(v) =>
                      update.mutate({
                        id: task.id,
                        input: {
                          checklist: task.checklist.map((c) =>
                            c.id === item.id ? { ...c, done: Boolean(v) } : c,
                          ),
                        },
                      })
                    }
                  />
                  <span className={item.done ? "text-muted-foreground line-through" : ""}>{item.title}</span>
                </label>
              ))
            )}
          </TabsContent>

          <TabsContent value="comments" className="space-y-4 pt-4">
            <div className="space-y-4">
              <div className="flex gap-3">
                <UserCell userId={task.reporter_id} subtitle="2 days ago" />
              </div>
              <p className="rounded-lg bg-muted/60 p-3 text-sm">
                Please make sure this is reviewed before the client call on Thursday.
              </p>
            </div>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Write a comment…"
              rows={3}
            />
            <Button
              size="sm"
              disabled={!comment.trim()}
              onClick={() => {
                toast.success("Comment added");
                setComment("");
              }}
            >
              Comment
            </Button>
          </TabsContent>

          <TabsContent value="activity" className="pt-4">
            <ActivityTimeline events={activities} limit={8} />
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      {children}
    </div>
  );
}
