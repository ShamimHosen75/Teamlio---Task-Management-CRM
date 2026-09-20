import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Building2, Plus, Trash2 } from "lucide-react";
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
  CLIENT_STATUSES,
  useCreateClient,
  useDeleteClient,
  useOrgClients,
  useOrgDeals,
  useUpdateClient,
  type ClientStatus,
} from "@/hooks/use-crm-cloud";

export const Route = createFileRoute("/_authenticated/crm/clients")({
  head: () => ({
    meta: [
      { title: "Clients — Project CRM" },
      { name: "description", content: "Every real client account with its owner, status and deal value." },
      { property: "og:title", content: "Clients — Project CRM" },
      { property: "og:description", content: "Live client accounts stored in your workspace." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ClientsPage,
});

function ClientsPage() {
  const { activeOrgId, members, canManage } = useLiveOrgContext();
  const { data: clients = [], isLoading } = useOrgClients(activeOrgId);
  const { data: deals = [] } = useOrgDeals(activeOrgId);
  const update = useUpdateClient();
  const remove = useDeleteClient();

  const activeClients = clients.filter((c) => c.status === "active").length;
  const wonValue = deals
    .filter((d) => d.stage === "won")
    .reduce((sum, d) => sum + Number(d.value), 0);

  return (
    <LivePage
      title="Clients"
      description="Accounts you deliver for, linked to the deals and invoices they generate."
      actions={canManage ? <NewClientDrawer organizationId={activeOrgId} members={members} /> : null}
    >
      <div className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <StatCard label="Clients" value={clients.length} icon={Building2} loading={isLoading} />
          <StatCard label="Active" value={activeClients} icon={Building2} tone="success" loading={isLoading} />
          <StatCard label="Won deal value" value={money(wonValue)} icon={Building2} loading={isLoading} />
        </div>

        {isLoading ? (
          <SkeletonTable />
        ) : clients.length === 0 ? (
          <EmptyState icon={Building2} title="No clients yet" description="Add a client, or convert a lead to create one automatically." />
        ) : (
          <div className="grid gap-4 xl:grid-cols-2">
            {clients.map((client) => {
              const clientDeals = deals.filter((d) => d.client_id === client.id);
              return (
                <article key={client.id} className="surface-card p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground">{client.industry}</p>
                      <h3 className="truncate text-base font-semibold">{client.company}</h3>
                      <p className="truncate text-xs text-muted-foreground">
                        {client.contact_name || "No contact"} · {client.email || "No email"} · {client.phone || "No phone"}
                      </p>
                    </div>
                    {canManage ? (
                      <ConfirmDialog
                        trigger={
                          <Button size="icon" variant="ghost" aria-label={`Delete ${client.company}`}>
                            <Trash2 className="size-4" />
                          </Button>
                        }
                        title="Delete client?"
                        description="Deals and invoices stay, but they lose their link to this client."
                        confirmLabel="Delete"
                        destructive
                        onConfirm={() => remove.mutate(client.id, { onSuccess: () => toast.success("Client deleted") })}
                      />
                    ) : null}
                  </div>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <Select
                      value={client.status}
                      disabled={!canManage}
                      onValueChange={(value) => update.mutate({ id: client.id, status: value as ClientStatus })}
                    >
                      <SelectTrigger className="h-9" aria-label={`${client.company} status`}><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {CLIENT_STATUSES.map((s) => <SelectItem key={s} value={s}>{prettyStatus(s)}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <Select
                      value={client.owner_id ?? "none"}
                      disabled={!canManage}
                      onValueChange={(value) => update.mutate({ id: client.id, owner_id: value === "none" ? null : value })}
                    >
                      <SelectTrigger className="h-9" aria-label={`${client.company} owner`}><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Unassigned</SelectItem>
                        {members.map((m) => (
                          <SelectItem key={m.id} value={m.user_id}>{memberName(members, m.user_id)}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <p className="mt-3 text-xs text-muted-foreground">
                    {clientDeals.length} deals · {money(clientDeals.reduce((sum, d) => sum + Number(d.value), 0))} total value
                  </p>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </LivePage>
  );
}

function NewClientDrawer({ organizationId, members }: { organizationId: string | undefined; members: CloudMember[] }) {
  const create = useCreateClient(organizationId);
  const [form, setForm] = useState({
    company: "",
    contact_name: "",
    email: "",
    phone: "",
    website: "",
    industry: "General",
    status: "active" as ClientStatus,
    notes: "",
    owner_id: "none",
  });

  return (
    <FormDrawer
      trigger={<Button size="sm" disabled={!organizationId}><Plus className="size-4" /> New client</Button>}
      title="Add client"
      description="Client accounts are shared with everyone in this organization."
      submitLabel="Save client"
      onSubmit={async () => {
        if (!form.company.trim()) {
          toast.error("Company name is required");
          return false;
        }
        try {
          await create.mutateAsync({
            company: form.company.trim(),
            contact_name: form.contact_name.trim(),
            email: form.email.trim(),
            phone: form.phone.trim(),
            website: form.website.trim(),
            industry: form.industry.trim() || "General",
            status: form.status,
            notes: form.notes.trim(),
            owner_id: form.owner_id === "none" ? null : form.owner_id,
          });
          toast.success("Client added");
          setForm({ ...form, company: "", contact_name: "", email: "", phone: "", website: "", notes: "" });
          return true;
        } catch (error) {
          toast.error(error instanceof Error ? error.message : "Could not save client");
          return false;
        }
      }}
    >
      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField label="Company" value={form.company} onChange={(v) => setForm({ ...form, company: v })} />
          <TextField label="Contact person" value={form.contact_name} onChange={(v) => setForm({ ...form, contact_name: v })} />
          <TextField label="Email" type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} />
          <TextField label="Phone" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} />
          <TextField label="Website" value={form.website} onChange={(v) => setForm({ ...form, website: v })} />
          <TextField label="Industry" value={form.industry} onChange={(v) => setForm({ ...form, industry: v })} />
          <div className="space-y-1.5">
            <Label>Status</Label>
            <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as ClientStatus })}>
              <SelectTrigger aria-label="Client status"><SelectValue /></SelectTrigger>
              <SelectContent>
                {CLIENT_STATUSES.map((s) => <SelectItem key={s} value={s}>{prettyStatus(s)}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Account owner</Label>
            <Select value={form.owner_id} onValueChange={(v) => setForm({ ...form, owner_id: v })}>
              <SelectTrigger aria-label="Account owner"><SelectValue /></SelectTrigger>
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
          <Label htmlFor="client-notes">Notes</Label>
          <Textarea id="client-notes" rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
        </div>
      </div>
    </FormDrawer>
  );
}
