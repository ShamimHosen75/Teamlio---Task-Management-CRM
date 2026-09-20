import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Plus, Trash2, Wallet } from "lucide-react";
import { toast } from "sonner";
import { StatCard } from "@/components/shared/stat-card";
import { EmptyState, SkeletonTable } from "@/components/shared/states";
import { FormDrawer } from "@/components/shared/form-drawer";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LivePage, TextField, useLiveOrgContext } from "@/components/cloud/crm-ui";
import { prettyStatus } from "@/components/cloud/work-ui";
import { fmtDate, money } from "@/lib/format";
import { useOrgProjects, type CloudProject } from "@/hooks/use-cloud";
import {
  EXPENSE_STATUSES,
  useCreateExpense,
  useDeleteExpense,
  useOrgExpenses,
  useUpdateExpense,
  type ExpenseStatus,
} from "@/hooks/use-billing-cloud";

export const Route = createFileRoute("/_authenticated/business/expenses")({
  head: () => ({
    meta: [
      { title: "Expenses — Project CRM" },
      { name: "description", content: "Track real project and operating costs, approvals and billable spend." },
      { property: "og:title", content: "Expenses — Project CRM" },
      { property: "og:description", content: "Live expense records with approval status." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ExpensesPage,
});

function ExpensesPage() {
  const { activeOrgId, canManage } = useLiveOrgContext();
  const { data: expenses = [], isLoading } = useOrgExpenses(activeOrgId);
  const { data: projects = [] } = useOrgProjects(activeOrgId);
  const update = useUpdateExpense();
  const remove = useDeleteExpense();
  const [status, setStatus] = useState("all");

  const rows = expenses.filter((e) => status === "all" || e.status === status);
  const total = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
  const pending = expenses.filter((e) => e.status === "pending").reduce((sum, e) => sum + Number(e.amount), 0);
  const billable = expenses.filter((e) => e.billable).reduce((sum, e) => sum + Number(e.amount), 0);

  return (
    <LivePage
      title="Expenses"
      description="Costs recorded here persist in your workspace and can be approved or reimbursed."
      actions={canManage ? <NewExpenseDrawer organizationId={activeOrgId} projects={projects} /> : null}
    >
      <div className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Expenses" value={expenses.length} icon={Wallet} loading={isLoading} />
          <StatCard label="Total spend" value={money(total)} icon={Wallet} loading={isLoading} />
          <StatCard label="Awaiting approval" value={money(pending)} icon={Wallet} tone="warning" loading={isLoading} />
          <StatCard label="Billable" value={money(billable)} icon={Wallet} tone="success" loading={isLoading} />
        </div>

        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-full sm:w-[200px]" aria-label="Filter expenses by status"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {EXPENSE_STATUSES.map((s) => <SelectItem key={s} value={s}>{prettyStatus(s)}</SelectItem>)}
          </SelectContent>
        </Select>

        {isLoading ? (
          <SkeletonTable />
        ) : rows.length === 0 ? (
          <EmptyState
            icon={Wallet}
            title={expenses.length ? "No expenses with this status" : "No expenses yet"}
            description={expenses.length ? "Try another status filter." : "Record your first cost to start tracking spend."}
          />
        ) : (
          <ul className="surface-card divide-y">
            {rows.map((expense) => (
              <li key={expense.id} className="grid gap-3 p-4 lg:grid-cols-[1fr_140px_170px_auto] lg:items-center">
                <div className="min-w-0">
                  <p className="truncate font-medium">{expense.title}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {expense.category} · {expense.vendor || "No vendor"} ·{" "}
                    {projects.find((p) => p.id === expense.project_id)?.name ?? "No project"} · {fmtDate(expense.spent_on)}
                    {expense.billable ? " · Billable" : ""}
                  </p>
                </div>
                <p className="text-sm font-semibold">{money(Number(expense.amount))}</p>
                <Select
                  value={expense.status}
                  disabled={!canManage}
                  onValueChange={(value) => update.mutate({ id: expense.id, status: value as ExpenseStatus })}
                >
                  <SelectTrigger className="h-9" aria-label={`${expense.title} status`}><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {EXPENSE_STATUSES.map((s) => <SelectItem key={s} value={s}>{prettyStatus(s)}</SelectItem>)}
                  </SelectContent>
                </Select>
                {canManage ? (
                  <ConfirmDialog
                    trigger={
                      <Button size="icon" variant="ghost" aria-label={`Delete ${expense.title}`}>
                        <Trash2 className="size-4" />
                      </Button>
                    }
                    title="Delete expense?"
                    description="This removes the expense record permanently."
                    confirmLabel="Delete"
                    destructive
                    onConfirm={() => remove.mutate(expense.id, { onSuccess: () => toast.success("Expense deleted") })}
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

function NewExpenseDrawer({ organizationId, projects }: { organizationId: string | undefined; projects: CloudProject[] }) {
  const create = useCreateExpense(organizationId);
  const [form, setForm] = useState({
    title: "",
    category: "General",
    vendor: "",
    amount: "",
    spent_on: new Date().toISOString().slice(0, 10),
    project_id: "none",
    billable: false,
    status: "pending" as ExpenseStatus,
    notes: "",
  });

  return (
    <FormDrawer
      trigger={<Button size="sm" disabled={!organizationId}><Plus className="size-4" /> Record expense</Button>}
      title="Record expense"
      description="Expenses can be tied to a project and marked billable to a client."
      submitLabel="Save expense"
      onSubmit={async () => {
        if (!form.title.trim() || !Number(form.amount)) {
          toast.error("Expense title and amount are required");
          return false;
        }
        try {
          await create.mutateAsync({
            title: form.title.trim(),
            category: form.category.trim() || "General",
            vendor: form.vendor.trim(),
            amount: Number(form.amount),
            spent_on: form.spent_on,
            project_id: form.project_id === "none" ? null : form.project_id,
            billable: form.billable,
            status: form.status,
            notes: form.notes.trim(),
          });
          toast.success("Expense recorded");
          setForm({ ...form, title: "", vendor: "", amount: "", notes: "" });
          return true;
        } catch (error) {
          toast.error(error instanceof Error ? error.message : "Could not record expense");
          return false;
        }
      }}
    >
      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField label="Title" value={form.title} onChange={(v) => setForm({ ...form, title: v })} />
          <TextField label="Category" value={form.category} onChange={(v) => setForm({ ...form, category: v })} />
          <TextField label="Vendor" value={form.vendor} onChange={(v) => setForm({ ...form, vendor: v })} />
          <TextField label="Amount" type="number" value={form.amount} onChange={(v) => setForm({ ...form, amount: v })} />
          <TextField label="Spent on" type="date" value={form.spent_on} onChange={(v) => setForm({ ...form, spent_on: v })} />
          <div className="space-y-1.5">
            <Label>Project</Label>
            <Select value={form.project_id} onValueChange={(v) => setForm({ ...form, project_id: v })}>
              <SelectTrigger aria-label="Expense project"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No project</SelectItem>
                {projects.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Status</Label>
            <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as ExpenseStatus })}>
              <SelectTrigger aria-label="Expense status"><SelectValue /></SelectTrigger>
              <SelectContent>
                {EXPENSE_STATUSES.map((s) => <SelectItem key={s} value={s}>{prettyStatus(s)}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between rounded-lg border px-3 py-2">
            <Label htmlFor="expense-billable">Billable to client</Label>
            <Switch id="expense-billable" checked={form.billable} onCheckedChange={(v) => setForm({ ...form, billable: v })} />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="expense-notes">Notes</Label>
          <Textarea id="expense-notes" rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
        </div>
      </div>
    </FormDrawer>
  );
}
