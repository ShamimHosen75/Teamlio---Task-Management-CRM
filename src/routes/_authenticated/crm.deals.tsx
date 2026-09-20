import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Handshake, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { StatCard } from "@/components/shared/stat-card";
import { EmptyState, SkeletonTable } from "@/components/shared/states";
import { FormDrawer } from "@/components/shared/form-drawer";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LivePage, TextField, memberName, useLiveOrgContext } from "@/components/cloud/crm-ui";
import { prettyStatus } from "@/components/cloud/work-ui";
import { fmtDate, money } from "@/lib/format";
import type { CloudMember } from "@/hooks/use-cloud";
import {
  DEAL_STAGES,
  useCreateDeal,
  useDeleteDeal,
  useOrgClients,
  useOrgDeals,
  useUpdateDealCloud,
  type CloudClient,
  type DealStage,
} from "@/hooks/use-crm-cloud";

export const Route = createFileRoute("/_authenticated/crm/deals")({
  head: () => ({
    meta: [
      { title: "Deals — Project CRM" },
      { name: "description", content: "Real deal value, probability and expected close dates across your pipeline." },
      { property: "og:title", content: "Deals — Project CRM" },
      { property: "og:description", content: "Live deals and weighted forecast from your workspace." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DealsPage,
});

function DealsPage() {
  const { activeOrgId, members, canManage } = useLiveOrgContext();
  const { data: deals = [], isLoading } = useOrgDeals(activeOrgId);
  const { data: clients = [] } = useOrgClients(activeOrgId);
  const update = useUpdateDealCloud();
  const remove = useDeleteDeal();
  const [stage, setStage] = useState("all");

  const rows = deals.filter((d) => stage === "all" || d.stage === stage);
  const open = deals.filter((d) => d.stage !== "won" && d.stage !== "lost");
  const weighted = open.reduce((sum, d) => sum + (Number(d.value) * d.probability) / 100, 0);
  const wonCount = deals.filter((d) => d.stage === "won").length;

  return (
    <LivePage
      title="Deals"
      description="Revenue opportunities in flight, stored live in your workspace."
      actions={
        <>
          {canManage ? <NewDealDrawer organizationId={activeOrgId} members={members} clients={clients} /> : null}
          <Button asChild variant="ghost" size="sm"><Link to="/crm/pipeline">Pipeline board</Link></Button>
        </>
      }
    >
      <div className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Open deals" value={open.length} icon={Handshake} loading={isLoading} />
          <StatCard label="Open value" value={money(open.reduce((s, d) => s + Number(d.value), 0))} icon={Handshake} loading={isLoading} />
          <StatCard label="Weighted forecast" value={money(weighted)} icon={Handshake} tone="success" loading={isLoading} />
          <StatCard label="Won deals" value={wonCount} icon={Handshake} tone="success" loading={isLoading} />
        </div>

        <Select value={stage} onValueChange={setStage}>
          <SelectTrigger className="w-full sm:w-[210px]" aria-label="Filter deals by stage"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All stages</SelectItem>
            {DEAL_STAGES.map((s) => <SelectItem key={s} value={s}>{prettyStatus(s)}</SelectItem>)}
          </SelectContent>
        </Select>

        {isLoading ? (
          <SkeletonTable />
        ) : rows.length === 0 ? (
          <EmptyState
            icon={Handshake}
            title={deals.length ? "No deals in this stage" : "No deals yet"}
            description={deals.length ? "Try another stage filter." : "Create a deal or convert a qualified lead."}
          />
        ) : (
          <ul className="surface-card divide-y">
            {rows.map((deal) => (
              <li key={deal.id} className="grid gap-3 p-4 lg:grid-cols-[1fr_160px_200px_190px_auto] lg:items-center">
                <div className="min-w-0">
                  <p className="truncate font-medium">{deal.title}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {clients.find((c) => c.id === deal.client_id)?.company ?? "New business"} · {money(Number(deal.value))} ·
                    close {fmtDate(deal.expected_close_date)}
                  </p>
                </div>
                <div>
                  <Progress value={deal.probability} className="h-1.5" />
                  <p className="mt-1 text-xs text-muted-foreground">{deal.probability}% likely</p>
                </div>
                <Select
                  value={deal.stage}
                  disabled={!canManage}
                  onValueChange={(value) => update.mutate({ id: deal.id, stage: value as DealStage })}
                >
                  <SelectTrigger className="h-9" aria-label={`${deal.title} stage`}><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {DEAL_STAGES.map((s) => <SelectItem key={s} value={s}>{prettyStatus(s)}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Select
                  value={deal.owner_id ?? "none"}
                  disabled={!canManage}
                  onValueChange={(value) => update.mutate({ id: deal.id, owner_id: value === "none" ? null : value })}
                >
                  <SelectTrigger className="h-9" aria-label={`${deal.title} owner`}><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Unassigned</SelectItem>
                    {members.map((m) => (
                      <SelectItem key={m.id} value={m.user_id}>{memberName(members, m.user_id)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {canManage ? (
                  <ConfirmDialog
                    trigger={
                      <Button size="icon" variant="ghost" aria-label={`Delete ${deal.title}`}>
                        <Trash2 className="size-4" />
                      </Button>
                    }
                    title="Delete deal?"
                    description="This removes the deal from your pipeline permanently."
                    confirmLabel="Delete"
                    destructive
                    onConfirm={() => remove.mutate(deal.id, { onSuccess: () => toast.success("Deal deleted") })}
                  />
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </div>
    </LivePage>
  );
}

function NewDealDrawer({
  organizationId,
  members,
  clients,
}: {
  organizationId: string | undefined;
  members: CloudMember[];
  clients: CloudClient[];
}) {
  const create = useCreateDeal(organizationId);
  const [form, setForm] = useState({
    title: "",
    client_id: "none",
    value: "",
    probability: "50",
    stage: "new_opportunity" as DealStage,
    expected_close_date: "",
    notes: "",
    owner_id: "none",
  });

  return (
    <FormDrawer
      trigger={<Button size="sm" disabled={!organizationId}><Plus className="size-4" /> New deal</Button>}
      title="Add deal"
      description="Deals drive the pipeline board, forecast and conversion charts."
      submitLabel="Save deal"
      onSubmit={async () => {
        if (!form.title.trim()) {
          toast.error("Deal title is required");
          return false;
        }
        try {
          await create.mutateAsync({
            title: form.title.trim(),
            client_id: form.client_id === "none" ? null : form.client_id,
            value: Number(form.value) || 0,
            probability: Math.min(100, Math.max(0, Number(form.probability) || 0)),
            stage: form.stage,
            expected_close_date: form.expected_close_date || null,
            notes: form.notes.trim(),
            owner_id: form.owner_id === "none" ? null : form.owner_id,
          });
          toast.success("Deal added");
          setForm({ ...form, title: "", value: "", expected_close_date: "", notes: "" });
          return true;
        } catch (error) {
          toast.error(error instanceof Error ? error.message : "Could not save deal");
          return false;
        }
      }}
    >
      <div className="space-y-4">
        <TextField label="Deal title" value={form.title} onChange={(v) => setForm({ ...form, title: v })} />
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Client</Label>
            <Select value={form.client_id} onValueChange={(v) => setForm({ ...form, client_id: v })}>
              <SelectTrigger aria-label="Deal client"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">New business</SelectItem>
                {clients.map((c) => <SelectItem key={c.id} value={c.id}>{c.company}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <TextField label="Value" type="number" value={form.value} onChange={(v) => setForm({ ...form, value: v })} />
          <TextField label="Probability" type="number" value={form.probability} onChange={(v) => setForm({ ...form, probability: v })} />
          <TextField
            label="Expected close"
            type="date"
            value={form.expected_close_date}
            onChange={(v) => setForm({ ...form, expected_close_date: v })}
          />
          <div className="space-y-1.5">
            <Label>Stage</Label>
            <Select value={form.stage} onValueChange={(v) => setForm({ ...form, stage: v as DealStage })}>
              <SelectTrigger aria-label="Deal stage"><SelectValue /></SelectTrigger>
              <SelectContent>
                {DEAL_STAGES.map((s) => <SelectItem key={s} value={s}>{prettyStatus(s)}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Owner</Label>
            <Select value={form.owner_id} onValueChange={(v) => setForm({ ...form, owner_id: v })}>
              <SelectTrigger aria-label="Deal owner"><SelectValue /></SelectTrigger>
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
          <Label htmlFor="deal-notes">Notes</Label>
          <Textarea id="deal-notes" rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
        </div>
      </div>
    </FormDrawer>
  );
}
