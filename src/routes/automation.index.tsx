import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight, Plus } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { FormDrawer } from "@/components/shared/form-drawer";
import { EmptyState, SkeletonGrid } from "@/components/shared/states";
import { PermissionGuard } from "@/components/shared/permission-guard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AUTOMATION_ACTIONS, AUTOMATION_CONDITIONS, AUTOMATION_TRIGGERS } from "@/lib/constants";
import { fromNow } from "@/lib/format";
import { useToggleWorkflow, useWorkflows } from "@/hooks/use-data";

export const Route = createFileRoute("/automation/")({
  head: () => ({
    meta: [
      { title: "Automation Workflows — Teamlio" },
      { name: "description", content: "Trigger, condition and action rules that run the busywork." },
      { property: "og:title", content: "Automation Workflows — Teamlio" },
      { property: "og:description", content: "Trigger → condition → action workflow rules." },
    ],
  }),
  component: AutomationPage,
});

function AutomationPage() {
  const { data: workflows = [], isLoading } = useWorkflows();
  const toggle = useToggleWorkflow();

  return (
    <PermissionGuard permission="automation.manage" mode="page">
      <div className="mx-auto max-w-[1400px]">
        <PageHeader
          title="Workflows"
          description="Each rule listens for a trigger, checks conditions, then acts."
          actions={<WorkflowBuilder />}
        />
        {isLoading ? (
          <SkeletonGrid />
        ) : workflows.length === 0 ? (
          <EmptyState title="No workflows yet" description="Create your first rule to automate routine work." />
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {workflows.map((w) => (
              <article key={w.id} className="surface-card p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-semibold">{w.name}</h3>
                    <p className="text-xs text-muted-foreground">{w.description}</p>
                  </div>
                  <Switch
                    checked={w.enabled}
                    onCheckedChange={() => {
                      toggle.mutate({ id: w.id, enabled: !w.enabled });
                      toast.success(w.enabled ? "Workflow paused" : "Workflow enabled");
                    }}
                    aria-label={`Toggle ${w.name}`}
                  />
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
                  <Badge variant="secondary">Trigger · {w.trigger}</Badge>
                  <ArrowRight className="size-3 text-muted-foreground" />
                  <Badge variant="secondary">{w.conditions.length} condition{w.conditions.length === 1 ? "" : "s"}</Badge>
                  <ArrowRight className="size-3 text-muted-foreground" />
                  <Badge variant="secondary">{w.actions.length} action{w.actions.length === 1 ? "" : "s"}</Badge>
                </div>
                <p className="mt-4 text-xs text-muted-foreground">
                  {w.runs} runs · last run {w.last_run_at ? fromNow(w.last_run_at) : "never"}
                </p>
              </article>
            ))}
          </div>
        )}
      </div>
    </PermissionGuard>
  );
}

function WorkflowBuilder() {
  const [form, setForm] = useState({
    name: "",
    trigger: AUTOMATION_TRIGGERS[0],
    condition: AUTOMATION_CONDITIONS[0],
    conditionValue: "",
    action: AUTOMATION_ACTIONS[0],
  });
  const [error, setError] = useState("");

  return (
    <FormDrawer
      trigger={<Button size="sm"><Plus className="size-4" /> New workflow</Button>}
      title="Build a workflow"
      description="Choose what starts it, what must be true, and what happens."
      submitLabel="Create workflow"
      onSubmit={() => {
        if (!form.name.trim()) {
          setError("Give the workflow a name.");
          return false;
        }
        toast.success(`${form.name} created`);
        setForm({ ...form, name: "", conditionValue: "" });
        setError("");
        return true;
      }}
    >
      <div className="space-y-5">
        {error ? <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p> : null}
        <div className="space-y-1.5">
          <Label htmlFor="wf-name">Workflow name</Label>
          <Input id="wf-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </div>
        <Step step="1" label="Trigger">
          <Select value={form.trigger} onValueChange={(v) => setForm({ ...form, trigger: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{AUTOMATION_TRIGGERS.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
          </Select>
        </Step>
        <Step step="2" label="Condition">
          <div className="space-y-2">
            <Select value={form.condition} onValueChange={(v) => setForm({ ...form, condition: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{AUTOMATION_CONDITIONS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
            </Select>
            <Input placeholder="Value" value={form.conditionValue} onChange={(e) => setForm({ ...form, conditionValue: e.target.value })} aria-label="Condition value" />
          </div>
        </Step>
        <Step step="3" label="Action">
          <Select value={form.action} onValueChange={(v) => setForm({ ...form, action: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{AUTOMATION_ACTIONS.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}</SelectContent>
          </Select>
        </Step>
      </div>
    </FormDrawer>
  );
}

function Step({ step, label, children }: { step: string; label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border p-4">
      <div className="mb-3 flex items-center gap-2">
        <span className="flex size-6 items-center justify-center rounded-full bg-primary-soft text-xs font-semibold text-primary">{step}</span>
        <p className="text-sm font-medium">{label}</p>
      </div>
      {children}
    </div>
  );
}
