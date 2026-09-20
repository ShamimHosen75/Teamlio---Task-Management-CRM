import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { CircleDollarSign, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { StatCard } from "@/components/shared/stat-card";
import { EmptyState, SkeletonTable } from "@/components/shared/states";
import { FormDrawer } from "@/components/shared/form-drawer";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LivePage, TextField, useLiveOrgContext } from "@/components/cloud/crm-ui";
import { prettyStatus } from "@/components/cloud/work-ui";
import { fmtDate, money } from "@/lib/format";
import { useOrgClients, type CloudClient } from "@/hooks/use-crm-cloud";
import {
  PAYMENT_METHODS,
  invoicePaid,
  invoiceTotal,
  useCreatePayment,
  useDeletePayment,
  useOrgInvoiceItems,
  useOrgInvoices,
  useOrgPayments,
  useUpdateInvoice,
  type CloudInvoice,
  type CloudInvoiceItem,
  type CloudPayment,
  type PaymentMethod,
} from "@/hooks/use-billing-cloud";

export const Route = createFileRoute("/_authenticated/business/payments")({
  head: () => ({
    meta: [
      { title: "Payments — Project CRM" },
      { name: "description", content: "Record real payments against invoices and see what is still outstanding." },
      { property: "og:title", content: "Payments — Project CRM" },
      { property: "og:description", content: "Live payment records tied to your invoices." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PaymentsPage,
});

function PaymentsPage() {
  const { activeOrgId, canManage } = useLiveOrgContext();
  const { data: payments = [], isLoading } = useOrgPayments(activeOrgId);
  const { data: invoices = [] } = useOrgInvoices(activeOrgId);
  const { data: items = [] } = useOrgInvoiceItems(activeOrgId);
  const { data: clients = [] } = useOrgClients(activeOrgId);
  const remove = useDeletePayment();

  const received = payments.reduce((sum, p) => sum + Number(p.amount), 0);
  const billed = invoices.reduce((sum, invoice) => sum + invoiceTotal(invoice, items), 0);
  const thisMonth = payments
    .filter((p) => p.paid_on.slice(0, 7) === new Date().toISOString().slice(0, 7))
    .reduce((sum, p) => sum + Number(p.amount), 0);

  return (
    <LivePage
      title="Payments"
      description="Every payment you record updates the invoice balances instantly."
      actions={
        canManage ? (
          <NewPaymentDrawer organizationId={activeOrgId} invoices={invoices} items={items} payments={payments} clients={clients} />
        ) : null
      }
    >
      <div className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Payments" value={payments.length} icon={CircleDollarSign} loading={isLoading} />
          <StatCard label="Received" value={money(received)} icon={CircleDollarSign} tone="success" loading={isLoading} />
          <StatCard label="This month" value={money(thisMonth)} icon={CircleDollarSign} loading={isLoading} />
          <StatCard label="Outstanding" value={money(Math.max(0, billed - received))} icon={CircleDollarSign} tone="warning" loading={isLoading} />
        </div>

        {isLoading ? (
          <SkeletonTable />
        ) : payments.length === 0 ? (
          <EmptyState icon={CircleDollarSign} title="No payments yet" description="Record a payment once a client settles an invoice." />
        ) : (
          <ul className="surface-card divide-y">
            {payments.map((payment) => {
              const invoice = invoices.find((i) => i.id === payment.invoice_id);
              return (
                <li key={payment.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
                  <div className="min-w-0">
                    <p className="truncate font-medium">
                      {money(Number(payment.amount))} · {prettyStatus(payment.method)}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {invoice ? invoice.invoice_number : "No invoice"} ·{" "}
                      {clients.find((c) => c.id === payment.client_id)?.company ?? "No client"} · Paid {fmtDate(payment.paid_on)}
                      {payment.reference ? ` · Ref ${payment.reference}` : ""}
                    </p>
                  </div>
                  {canManage ? (
                    <ConfirmDialog
                      trigger={
                        <Button size="icon" variant="ghost" aria-label="Delete payment">
                          <Trash2 className="size-4" />
                        </Button>
                      }
                      title="Delete payment?"
                      description="The invoice balance will go back up by this amount."
                      confirmLabel="Delete"
                      destructive
                      onConfirm={() => remove.mutate(payment.id, { onSuccess: () => toast.success("Payment deleted") })}
                    />
                  ) : null}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </LivePage>
  );
}

function NewPaymentDrawer({
  organizationId,
  invoices,
  items,
  payments,
  clients,
}: {
  organizationId: string | undefined;
  invoices: CloudInvoice[];
  items: CloudInvoiceItem[];
  payments: CloudPayment[];
  clients: CloudClient[];
}) {
  const create = useCreatePayment(organizationId);
  const updateInvoice = useUpdateInvoice();
  const [invoiceId, setInvoiceId] = useState("none");
  const [clientId, setClientId] = useState("none");
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<PaymentMethod>("bank_transfer");
  const [reference, setReference] = useState("");
  const [paidOn, setPaidOn] = useState(() => new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState("");

  return (
    <FormDrawer
      trigger={<Button size="sm" disabled={!organizationId}><Plus className="size-4" /> Record payment</Button>}
      title="Record payment"
      description="Link the payment to an invoice so its balance updates."
      submitLabel="Save payment"
      onSubmit={async () => {
        const value = Number(amount);
        if (!value || value <= 0) {
          toast.error("Enter a payment amount");
          return false;
        }
        try {
          const invoice = invoices.find((i) => i.id === invoiceId);
          await create.mutateAsync({
            invoice_id: invoiceId === "none" ? null : invoiceId,
            client_id: clientId === "none" ? (invoice?.client_id ?? null) : clientId,
            amount: value,
            method,
            reference: reference.trim(),
            paid_on: paidOn,
            notes: notes.trim(),
          });
          if (invoice) {
            const total = invoiceTotal(invoice, items);
            const paid = invoicePaid(invoice, payments) + value;
            await updateInvoice.mutateAsync({ id: invoice.id, status: paid >= total ? "paid" : "partially_paid" });
          }
          toast.success("Payment recorded");
          setAmount("");
          setReference("");
          setNotes("");
          return true;
        } catch (error) {
          toast.error(error instanceof Error ? error.message : "Could not record payment");
          return false;
        }
      }}
    >
      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label>Invoice</Label>
          <Select value={invoiceId} onValueChange={setInvoiceId}>
            <SelectTrigger aria-label="Payment invoice"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No invoice</SelectItem>
              {invoices.map((invoice) => (
                <SelectItem key={invoice.id} value={invoice.id}>
                  {invoice.invoice_number} · {money(invoiceTotal(invoice, items), invoice.currency)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Client</Label>
            <Select value={clientId} onValueChange={setClientId}>
              <SelectTrigger aria-label="Payment client"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">From invoice</SelectItem>
                {clients.map((c) => <SelectItem key={c.id} value={c.id}>{c.company}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <TextField label="Amount" type="number" value={amount} onChange={setAmount} />
          <div className="space-y-1.5">
            <Label>Method</Label>
            <Select value={method} onValueChange={(v) => setMethod(v as PaymentMethod)}>
              <SelectTrigger aria-label="Payment method"><SelectValue /></SelectTrigger>
              <SelectContent>
                {PAYMENT_METHODS.map((m) => <SelectItem key={m} value={m}>{prettyStatus(m)}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <TextField label="Paid on" type="date" value={paidOn} onChange={setPaidOn} />
          <TextField label="Reference" value={reference} onChange={setReference} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="payment-notes">Notes</Label>
          <Textarea id="payment-notes" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>
      </div>
    </FormDrawer>
  );
}
