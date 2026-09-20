import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AlertTriangle, Plus } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable, type Column } from "@/components/shared/data-table";
import { FormDrawer } from "@/components/shared/form-drawer";
import { StatusBadge } from "@/components/shared/badges";
import { UserCell, userName } from "@/components/shared/user-avatar";
import { PermissionGuard } from "@/components/shared/permission-guard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { fmtDate } from "@/lib/format";
import { LEAVE_TYPES } from "@/services/store";
import { useCreateLeaveRequest, useLeaveBalance, useLeaveRequests, useUpdateLeaveRequest } from "@/hooks/use-data";
import { useWorkspace } from "@/app/workspace";
import type { LeaveRequest } from "@/lib/types";

export const Route = createFileRoute("/leave")({
  head: () => ({
    meta: [
      { title: "Leave Management — Teamlio" },
      { name: "description", content: "Request time off, track balances and approve team leave." },
      { property: "og:title", content: "Leave Management — Teamlio" },
      { property: "og:description", content: "Leave balances, requests and approvals." },
    ],
  }),
  component: LeavePage,
});

function LeavePage() {
  const { currentUser } = useWorkspace();
  const { data: requests = [], isLoading } = useLeaveRequests();
  const { data: balances = [] } = useLeaveBalance(currentUser.id);
  const update = useUpdateLeaveRequest();

  const columns: Column<LeaveRequest>[] = [
    { key: "user", header: "Person", render: (r) => <UserCell userId={r.user_id} subtitle={r.leave_type} /> },
    { key: "dates", header: "Dates", sortable: true, sortValue: (r) => r.start_date, render: (r) => `${fmtDate(r.start_date)} → ${fmtDate(r.end_date)}` },
    { key: "days", header: "Days", render: (r) => `${r.duration_days}${r.half_day ? " (half)" : ""}` },
    { key: "approver", header: "Approver", hideBelow: "lg", render: (r) => userName(r.approver_id) },
    { key: "status", header: "Status", sortable: true, sortValue: (r) => r.status, render: (r) => <StatusBadge status={r.status} /> },
    {
      key: "actions",
      header: "",
      render: (r) =>
        r.status === "Pending" ? (
          <PermissionGuard permission="leave.approve">
            <div className="flex gap-1">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  update.mutate({ id: r.id, input: { status: "Approved" } });
                  toast.success("Leave approved");
                }}
              >
                Approve
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  update.mutate({ id: r.id, input: { status: "Rejected" } });
                  toast.success("Leave rejected");
                }}
              >
                Reject
              </Button>
            </div>
          </PermissionGuard>
        ) : null,
    },
  ];

  const overlaps = findOverlaps(requests);

  return (
    <PermissionGuard permission="leave.read" mode="page">
      <div className="mx-auto max-w-[1400px]">
        <PageHeader title="Leave management" description="Balances, requests and approvals for planned time off." actions={<RequestLeaveDrawer />} />

        <div className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {balances.map((b) => (
            <div key={b.leave_type} className="surface-card p-4">
              <p className="text-sm font-medium">{b.leave_type}</p>
              <p className="mt-1 text-2xl font-semibold">{b.entitled - b.used - b.pending}</p>
              <p className="text-xs text-muted-foreground">days remaining of {b.entitled}</p>
              <Progress value={((b.used + b.pending) / b.entitled) * 100} className="mt-3 h-1.5" />
              <p className="mt-2 text-[11px] text-muted-foreground">{b.used} used · {b.pending} pending</p>
            </div>
          ))}
        </div>

        {overlaps.length > 0 ? (
          <div className="mb-5 flex items-start gap-3 rounded-xl border border-warning/30 bg-warning/10 p-4 text-sm">
            <AlertTriangle className="mt-0.5 size-4 shrink-0 text-warning-foreground" />
            <div>
              <p className="font-medium">Overlapping leave detected</p>
              <ul className="mt-1 space-y-0.5 text-muted-foreground">
                {overlaps.slice(0, 3).map((o) => (
                  <li key={o}>{o}</li>
                ))}
              </ul>
            </div>
          </div>
        ) : null}

        <DataTable
          data={requests}
          columns={columns}
          loading={isLoading}
          searchable={false}
          pageSize={10}
          mobileCard={(r) => (
            <div className="space-y-1.5">
              <div className="flex items-start justify-between gap-2">
                <UserCell userId={r.user_id} subtitle={r.leave_type} />
                <StatusBadge status={r.status} />
              </div>
              <p className="text-xs text-muted-foreground">{fmtDate(r.start_date)} → {fmtDate(r.end_date)}</p>
            </div>
          )}
        />
      </div>
    </PermissionGuard>
  );
}

function findOverlaps(requests: LeaveRequest[]): string[] {
  const active = requests.filter((r) => r.status === "Approved" || r.status === "Pending");
  const out: string[] = [];
  for (let i = 0; i < active.length; i++) {
    for (let j = i + 1; j < active.length; j++) {
      const a = active[i];
      const b = active[j];
      if (a.user_id !== b.user_id && a.start_date <= b.end_date && b.start_date <= a.end_date) {
        out.push(`${userName(a.user_id)} and ${userName(b.user_id)} are away at the same time (${fmtDate(b.start_date)})`);
      }
    }
  }
  return Array.from(new Set(out));
}

function RequestLeaveDrawer() {
  const create = useCreateLeaveRequest();
  const { currentUser } = useWorkspace();
  const [form, setForm] = useState({ leave_type: LEAVE_TYPES[0], start_date: "", end_date: "", reason: "" });
  const [error, setError] = useState("");

  return (
    <FormDrawer
      trigger={<Button size="sm"><Plus className="size-4" /> Request leave</Button>}
      title="Request leave"
      description="Your approver is notified as soon as the request is submitted."
      submitLabel="Submit request"
      onSubmit={() => {
        if (!form.start_date || !form.end_date) {
          setError("Select both a start and end date.");
          return false;
        }
        if (form.end_date < form.start_date) {
          setError("The end date must be after the start date.");
          return false;
        }
        create.mutate(
          { ...form, user_id: currentUser.id, status: "Pending" },
          { onSuccess: () => toast.success("Leave request submitted") },
        );
        setForm({ leave_type: LEAVE_TYPES[0], start_date: "", end_date: "", reason: "" });
        setError("");
        return true;
      }}
    >
      <div className="space-y-4">
        {error ? <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p> : null}
        <div className="space-y-1.5">
          <Label>Leave type</Label>
          <Select value={form.leave_type} onValueChange={(v) => setForm({ ...form, leave_type: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {LEAVE_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="ls">Start date</Label>
            <Input id="ls" type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="le">End date</Label>
            <Input id="le" type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="lr">Reason</Label>
          <Textarea id="lr" rows={3} value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} />
        </div>
      </div>
    </FormDrawer>
  );
}
