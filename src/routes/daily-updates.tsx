import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { StatusBadge } from "@/components/shared/badges";
import { UserCell } from "@/components/shared/user-avatar";
import { FormDrawer } from "@/components/shared/form-drawer";
import { EmptyState, SkeletonTable } from "@/components/shared/states";
import { PermissionGuard } from "@/components/shared/permission-guard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { fmtDate } from "@/lib/format";
import { useCreateDailyUpdate, useDailyUpdates, useProjects } from "@/hooks/use-data";
import { useWorkspace } from "@/app/workspace";

export const Route = createFileRoute("/daily-updates")({
  head: () => ({
    meta: [
      { title: "Daily Work Updates — Teamlio" },
      { name: "description", content: "Submit and review structured daily work updates across the team." },
      { property: "og:title", content: "Daily Work Updates — Teamlio" },
      { property: "og:description", content: "Structured daily updates, reminders and review." },
    ],
  }),
  component: DailyUpdatesPage,
});

function DailyUpdatesPage() {
  const { data: updates = [], isLoading } = useDailyUpdates();
  const { currentUser } = useWorkspace();
  const today = new Date().toISOString().slice(0, 10);
  const todays = updates.filter((u) => u.date === today);

  return (
    <PermissionGuard permission="daily_update.read" mode="page">
      <div className="mx-auto max-w-[1400px]">
        <PageHeader
          title="Daily work updates"
          description="A short structured update replaces status meetings — no time tracking involved."
          actions={<SubmitUpdateDrawer />}
        />

        <div className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Submitted today" value={todays.filter((u) => u.status === "Submitted").length} tone="success" loading={isLoading} />
          <StatCard label="Late" value={todays.filter((u) => u.status === "Late").length} tone="warning" loading={isLoading} />
          <StatCard label="Missing" value={todays.filter((u) => u.status === "Missing").length} tone="destructive" loading={isLoading} />
          <StatCard label="Reviewed" value={updates.filter((u) => u.status === "Reviewed").length} loading={isLoading} />
        </div>

        <Tabs defaultValue="team">
          <TabsList>
            <TabsTrigger value="team">Team updates</TabsTrigger>
            <TabsTrigger value="mine">My updates</TabsTrigger>
            <TabsTrigger value="settings">Reminder settings</TabsTrigger>
          </TabsList>

          <TabsContent value="team" className="mt-4 space-y-3">
            {isLoading ? <SkeletonTable /> : updates.length === 0 ? <EmptyState title="No updates yet" /> : updates.slice(0, 20).map((u) => (
              <article key={u.id} className="surface-card p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <UserCell userId={u.user_id} subtitle={fmtDate(u.date)} />
                  <StatusBadge status={u.status} />
                </div>
                <dl className="mt-3 grid gap-3 sm:grid-cols-2">
                  <UpdateField label="Completed today" value={u.completed_today} />
                  <UpdateField label="Currently working on" value={u.working_on} />
                  <UpdateField label="Plan for tomorrow" value={u.next_plan} />
                  <UpdateField label="Blockers" value={u.blockers || "None reported"} />
                </dl>
                <PermissionGuard permission="daily_update.review">
                  <Button variant="ghost" size="sm" className="mt-3" onClick={() => toast.success("Update marked reviewed")}>
                    Mark reviewed
                  </Button>
                </PermissionGuard>
              </article>
            ))}
          </TabsContent>

          <TabsContent value="mine" className="mt-4 space-y-3">
            {updates.filter((u) => u.user_id === currentUser.id).map((u) => (
              <article key={u.id} className="surface-card p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">{fmtDate(u.date)}</p>
                  <StatusBadge status={u.status} />
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{u.completed_today}</p>
              </article>
            ))}
          </TabsContent>

          <TabsContent value="settings" className="mt-4">
            <ReminderSettings />
          </TabsContent>
        </Tabs>
      </div>
    </PermissionGuard>
  );
}

function UpdateField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-medium text-muted-foreground">{label}</dt>
      <dd className="text-sm">{value}</dd>
    </div>
  );
}

function SubmitUpdateDrawer() {
  const create = useCreateDailyUpdate();
  const { data: projects = [] } = useProjects();
  const { currentUser } = useWorkspace();
  const [form, setForm] = useState({ completed_today: "", working_on: "", next_plan: "", blockers: "", project_id: "" });
  const [error, setError] = useState("");

  return (
    <FormDrawer
      trigger={<Button size="sm"><Plus className="size-4" /> Submit update</Button>}
      title="Submit daily work update"
      description="Four short answers keep everyone aligned without status meetings."
      submitLabel="Submit"
      onSubmit={() => {
        if (!form.completed_today.trim()) {
          setError("Tell the team what you completed today.");
          return false;
        }
        create.mutate(
          { ...form, user_id: currentUser.id, date: new Date().toISOString().slice(0, 10), status: "Submitted" },
          { onSuccess: () => toast.success("Daily update submitted") },
        );
        setForm({ completed_today: "", working_on: "", next_plan: "", blockers: "", project_id: "" });
        setError("");
        return true;
      }}
    >
      <div className="space-y-4">
        {error ? <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p> : null}
        <div className="space-y-1.5">
          <Label>Project</Label>
          <Select value={form.project_id} onValueChange={(v) => setForm({ ...form, project_id: v })}>
            <SelectTrigger><SelectValue placeholder="Optional" /></SelectTrigger>
            <SelectContent>
              {projects.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        {[
          { key: "completed_today", label: "What did you complete today?" },
          { key: "working_on", label: "What are you working on?" },
          { key: "next_plan", label: "What's next tomorrow?" },
          { key: "blockers", label: "Any blockers?" },
        ].map((f) => (
          <div key={f.key} className="space-y-1.5">
            <Label htmlFor={f.key}>{f.label}</Label>
            <Textarea
              id={f.key}
              rows={3}
              value={form[f.key as keyof typeof form]}
              onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
            />
          </div>
        ))}
      </div>
    </FormDrawer>
  );
}

function ReminderSettings() {
  const [settings, setSettings] = useState({ enabled: true, reminderTime: "17:30", cutoff: "20:00", escalate: true, weekends: false });

  return (
    <div className="surface-card max-w-2xl space-y-5 p-5">
      <p className="text-sm text-muted-foreground">
        These preferences describe how reminders will behave once background jobs are connected.
      </p>
      <Toggle label="Send daily reminder" description="Nudge everyone who hasn't submitted." checked={settings.enabled} onChange={(v) => setSettings({ ...settings, enabled: v })} />
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="rt">Reminder time</Label>
          <Input id="rt" type="time" value={settings.reminderTime} onChange={(e) => setSettings({ ...settings, reminderTime: e.target.value })} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="co">Late cutoff</Label>
          <Input id="co" type="time" value={settings.cutoff} onChange={(e) => setSettings({ ...settings, cutoff: e.target.value })} />
        </div>
      </div>
      <Toggle label="Escalate to team lead" description="Notify the lead when an update is missing." checked={settings.escalate} onChange={(v) => setSettings({ ...settings, escalate: v })} />
      <Toggle label="Include weekends" description="Ask for updates on Saturday and Sunday." checked={settings.weekends} onChange={(v) => setSettings({ ...settings, weekends: v })} />
      <Button size="sm" onClick={() => toast.success("Reminder preferences saved")}>Save preferences</Button>
    </div>
  );
}

function Toggle({ label, description, checked, onChange }: { label: string; description: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}
