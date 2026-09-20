import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { CheckCheck } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { FilterBar } from "@/components/shared/filter-bar";
import { EmptyState, SkeletonTable } from "@/components/shared/states";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { fromNow } from "@/lib/format";
import { useNotifications } from "@/hooks/use-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/notifications")({
  head: () => ({
    meta: [
      { title: "Notifications — Teamlio" },
      { name: "description", content: "Alerts for tasks, deadlines, approvals, invoices and publishing." },
      { property: "og:title", content: "Notifications — Teamlio" },
      { property: "og:description", content: "All workspace alerts and delivery preferences." },
    ],
  }),
  component: NotificationsPage,
});

const TYPES = [
  "Task Assigned",
  "Project Deadline",
  "Task Overdue",
  "Meeting Reminder",
  "Mention",
  "Daily Update Reminder",
  "Leave Approval",
  "Invoice Alert",
  "Content Approval",
  "Publishing Failure",
  "System Alert",
];

function NotificationsPage() {
  const { data: notifications = [], isLoading } = useNotifications();
  const [type, setType] = useState("all");
  const [prefs, setPrefs] = useState<Record<string, boolean>>(Object.fromEntries(TYPES.map((t) => [t, true])));

  const rows = notifications.filter((n) => type === "all" || n.type === type);

  return (
    <div className="mx-auto max-w-[1100px]">
      <PageHeader
        title="Notifications"
        description="Everything the workspace wants you to know, grouped by type."
        actions={
          <Button variant="outline" size="sm" onClick={() => toast.success("All notifications marked read")}>
            <CheckCheck className="size-4" /> Mark all read
          </Button>
        }
      />

      <Tabs defaultValue="inbox">
        <TabsList>
          <TabsTrigger value="inbox">Inbox</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
        </TabsList>

        <TabsContent value="inbox" className="mt-4 space-y-4">
          <FilterBar filters={[{ key: "type", label: "Type", options: TYPES, value: type, onChange: setType }]} />
          {isLoading ? (
            <SkeletonTable />
          ) : rows.length === 0 ? (
            <EmptyState title="You're all caught up" description="New alerts will appear here." />
          ) : (
            <div className="surface-card divide-y">
              {rows.map((n) => (
                <div key={n.id} className={cn("flex items-start gap-3 px-4 py-3.5", !n.read && "bg-primary-soft/30")}>
                  <span className={cn("mt-1.5 size-2 shrink-0 rounded-full", n.read ? "bg-muted" : "bg-primary")} />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{n.title}</p>
                    <p className="text-sm text-muted-foreground">{n.body}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{n.type} · {fromNow(n.created_at)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="preferences" className="mt-4">
          <div className="surface-card divide-y">
            {TYPES.map((t) => (
              <div key={t} className="flex items-center justify-between px-4 py-3">
                <span className="text-sm">{t}</span>
                <Switch checked={prefs[t]} onCheckedChange={(v) => setPrefs({ ...prefs, [t]: v })} />
              </div>
            ))}
          </div>
          <Button size="sm" className="mt-4" onClick={() => toast.success("Notification preferences saved")}>
            Save preferences
          </Button>
        </TabsContent>
      </Tabs>
    </div>
  );
}
