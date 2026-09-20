import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Plus, Target, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { StatCard } from "@/components/shared/stat-card";
import { EmptyState, SkeletonTable } from "@/components/shared/states";
import { FormDrawer } from "@/components/shared/form-drawer";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LivePage, TextField, memberName, useLiveOrgContext } from "@/components/cloud/crm-ui";
import { prettyStatus } from "@/components/cloud/work-ui";
import { money } from "@/lib/format";
import type { CloudMember } from "@/hooks/use-cloud";
import {
  LEAD_SOURCES,
  LEAD_STATUSES,
  useConvertLead,
  useCreateLead,
  useDeleteLead,
  useOrgLeads,
  useUpdateLead,
  type LeadStatus,
} from "@/hooks/use-crm-cloud";

export const Route = createFileRoute("/_authenticated/crm/leads")({
  head: () => ({
    meta: [
      { title: "Leads — Project CRM" },
      { name: "description", content: "Capture, qualify and convert your real leads into clients and deals." },
      { property: "og:title", content: "Leads — Project CRM" },
      { property: "og:description", content: "Live lead pipeline stored in your workspace." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LeadsPage,
});

function LeadsPage() {
  const { activeOrgId, members, canManage } = useLiveOrgContext();
  const { data: leads = [], isLoading } = useOrgLeads(activeOrgId);
  const update = useUpdateLead();
  const remove = useDeleteLead();
  const convert = useConvertLead(activeOrgId);
  const [status, setStatus] = useState("all");

  const rows = leads.filter((l) => status === "all" || l.status === status);
  const pipelineValue = leads.reduce((sum, l) => sum + Number(l.estimated_value), 0);
  const qualified = leads.filter((l) => ["qualified", "proposal", "negotiation"].includes(l.status)).length;
  const won = leads.filter((l) => l.status === "won").length;

  return (
    <LivePage
      title="Leads"
      description="Your real leads — qualify them and convert winners into clients and deals."
      actions={canManage ? <NewLeadDrawer organizationId={activeOrgId} members={members} /> : null}
    >
      <div className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Leads" value={leads.length} icon={Target} loading={isLoading} />
          <StatCard label="Qualified or later" value={qualified} icon={Target} tone="success" loading={isLoading} />
          <StatCard label="Converted" value={won} icon={Target} tone="success" loading={isLoading} />
          <StatCard label="Estimated value" value={money(pipelineValue)} icon={Target} loading={isLoading} />
        </div>

        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-full sm:w-[200px]" aria-label="Filter leads by status"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {LEAD_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>{prettyStatus(s)}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {isLoading ? (
          <SkeletonTable />
        ) : rows.length === 0 ? (
          <EmptyState
            icon={Target}
            title={leads.length ? "No leads with this status" : "No leads yet"}
            description={leads.length ? "Try another status filter." : "Add your first lead to start the pipeline."}
          />
        ) : (
          <ul className="surface-card divide-y">
            {rows.map((lead) => (
              <li key={lead.id} className="grid gap-3 p-4 lg:grid-cols-[1fr_170px_190px_auto] lg:items-center">
                <div className="min-w-0">
                  <p className="truncate font-medium">{lead.name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {lead.company || "No company"} · {lead.source} · {money(Number(lead.estimated_value))} · Owner{" "}
                    {memberName(members, lead.assigned_to)}
                  </p>
                </div>
                <Select
                  value={lead.status}
                  disabled={!canManage}
                  onValueChange={(value) => update.mutate({ id: lead.id, status: value as LeadStatus })}
                >
                  <SelectTrigger className="h-9" aria-label={`${lead.name} status`}><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {LEAD_STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>{prettyStatus(s)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={lead.assigned_to ?? "none"}
                  disabled={!canManage}
                  onValueChange={(value) => update.mutate({ id: lead.id, assigned_to: value === "none" ? null : value })}
                >
                  <SelectTrigger className="h-9" aria-label={`${lead.name} owner`}><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Unassigned</SelectItem>
                    {members.map((m) => (
                      <SelectItem key={m.id} value={m.user_id}>{memberName(members, m.user_id)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {canManage ? (
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={!!lead.converted_client_id}
                      onClick={async () => {
                        try {
                          await convert.mutateAsync(lead);
                          toast.success("Lead converted to a client and deal");
                        } catch (error) {
                          toast.error(error instanceof Error ? error.message : "Could not convert lead");
                        }
                      }}
                    >
                      {lead.converted_client_id ? "Converted" : "Convert"}
                    </Button>
                    <ConfirmDialog
                      trigger={
                        <Button size="icon" variant="ghost" aria-label={`Delete ${lead.name}`}>
                          <Trash2 className="size-4" />
                        </Button>
                      }
                      title="Delete lead?"
                      description="This removes the lead from your workspace permanently."
                      confirmLabel="Delete"
                      destructive
                      onConfirm={() => remove.mutate(lead.id, { onSuccess: () => toast.success("Lead deleted") })}
                    />
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </div>
    </LivePage>
  );
}

function NewLeadDrawer({ organizationId, members }: { organizationId: string | undefined; members: CloudMember[] }) {
  const create = useCreateLead(organizationId);
  const [form, setForm] = useState({
    name: "",
    company: "",
    email: "",
    phone: "",
    source: "Manual",
    status: "new" as LeadStatus,
    estimated_value: "",
    notes: "",
    assigned_to: "none",
  });

  return (
    <FormDrawer
      trigger={<Button size="sm" disabled={!organizationId}><Plus className="size-4" /> New lead</Button>}
      title="Add lead"
      description="Leads are saved to your workspace and feed the pipeline charts."
      submitLabel="Save lead"
      onSubmit={async () => {
        if (!form.name.trim()) {
          toast.error("Lead name is required");
          return false;
        }
        try {
          await create.mutateAsync({
            name: form.name.trim(),
            company: form.company.trim(),
            email: form.email.trim(),
            phone: form.phone.trim(),
            source: form.source,
            status: form.status,
            estimated_value: Number(form.estimated_value) || 0,
            notes: form.notes.trim(),
            assigned_to: form.assigned_to === "none" ? null : form.assigned_to,
          });
          toast.success("Lead added");
          setForm({ ...form, name: "", company: "", email: "", phone: "", estimated_value: "", notes: "" });
          return true;
        } catch (error) {
          toast.error(error instanceof Error ? error.message : "Could not save lead");
          return false;
        }
      }}
    >
      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField label="Full name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
          <TextField label="Company" value={form.company} onChange={(v) => setForm({ ...form, company: v })} />
          <TextField label="Email" type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} />
          <TextField label="Phone" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} />
          <div className="space-y-1.5">
            <Label>Source</Label>
            <Select value={form.source} onValueChange={(v) => setForm({ ...form, source: v })}>
              <SelectTrigger aria-label="Lead source"><SelectValue /></SelectTrigger>
              <SelectContent>
                {LEAD_SOURCES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Status</Label>
            <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as LeadStatus })}>
              <SelectTrigger aria-label="Lead status"><SelectValue /></SelectTrigger>
              <SelectContent>
                {LEAD_STATUSES.map((s) => <SelectItem key={s} value={s}>{prettyStatus(s)}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <TextField
            label="Estimated value"
            type="number"
            value={form.estimated_value}
            onChange={(v) => setForm({ ...form, estimated_value: v })}
          />
          <div className="space-y-1.5">
            <Label>Owner</Label>
            <Select value={form.assigned_to} onValueChange={(v) => setForm({ ...form, assigned_to: v })}>
              <SelectTrigger aria-label="Lead owner"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Unassigned</SelectItem>
                {members.map((m) => (
                  <SelectItem key={m.id} value={m.user_id}>{memberName(members, m.user_id)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="lead-notes">Notes</Label>
          <Textarea id="lead-notes" rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
        </div>
      </div>
    </FormDrawer>
  );
}
