import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type CloudInvoice = Database["public"]["Tables"]["invoices"]["Row"];
export type CloudInvoiceItem = Database["public"]["Tables"]["invoice_items"]["Row"];
export type CloudPayment = Database["public"]["Tables"]["payments"]["Row"];
export type CloudExpense = Database["public"]["Tables"]["expenses"]["Row"];

export const INVOICE_STATUSES = ["draft", "sent", "partially_paid", "paid", "overdue", "cancelled"] as const;
export const PAYMENT_METHODS = ["bank_transfer", "card", "cash", "cheque", "online", "other"] as const;
export const EXPENSE_STATUSES = ["pending", "approved", "rejected", "reimbursed"] as const;

export type InvoiceStatus = (typeof INVOICE_STATUSES)[number];
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];
export type ExpenseStatus = (typeof EXPENSE_STATUSES)[number];

export type InvoiceDraftItem = { description: string; quantity: number; unit_price: number };

function orgList<T>(table: "invoices" | "invoice_items" | "payments" | "expenses", key: string, organizationId: string | undefined) {
  return {
    queryKey: ["cloud", key, organizationId],
    enabled: !!organizationId,
    queryFn: async () => {
      if (!organizationId) return [] as T[];
      const { data, error } = await supabase
        .from(table)
        .select("*")
        .eq("organization_id", organizationId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as T[];
    },
  };
}

export function useOrgInvoices(organizationId: string | undefined) {
  return useQuery(orgList<CloudInvoice>("invoices", "invoices", organizationId));
}

export function useOrgInvoiceItems(organizationId: string | undefined) {
  return useQuery(orgList<CloudInvoiceItem>("invoice_items", "invoice-items", organizationId));
}

export function useOrgPayments(organizationId: string | undefined) {
  return useQuery(orgList<CloudPayment>("payments", "payments", organizationId));
}

export function useOrgExpenses(organizationId: string | undefined) {
  return useQuery(orgList<CloudExpense>("expenses", "expenses", organizationId));
}

export function invoiceSubtotal(items: CloudInvoiceItem[]) {
  return items.reduce((sum, item) => sum + Number(item.quantity) * Number(item.unit_price), 0);
}

export function invoiceTotal(invoice: CloudInvoice, items: CloudInvoiceItem[]) {
  const subtotal = invoiceSubtotal(items.filter((i) => i.invoice_id === invoice.id));
  return subtotal + (subtotal * Number(invoice.tax_rate)) / 100;
}

export function invoicePaid(invoice: CloudInvoice, payments: CloudPayment[]) {
  return payments.filter((p) => p.invoice_id === invoice.id).reduce((sum, p) => sum + Number(p.amount), 0);
}

/** Next sequential invoice number for the organization, e.g. INV-0007. */
export function nextInvoiceNumber(invoices: CloudInvoice[]) {
  const highest = invoices.reduce((max, invoice) => {
    const match = /(\d+)$/.exec(invoice.invoice_number);
    return match ? Math.max(max, Number(match[1])) : max;
  }, 0);
  return `INV-${String(highest + 1).padStart(4, "0")}`;
}

export function useCreateInvoice(organizationId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      invoice_number: string;
      client_id: string | null;
      project_id: string | null;
      status: InvoiceStatus;
      issue_date: string;
      due_date: string | null;
      currency: string;
      tax_rate: number;
      notes: string;
      items: InvoiceDraftItem[];
    }) => {
      if (!organizationId) throw new Error("Select an organization first");
      const { items, ...invoice } = input;
      const { data, error } = await supabase
        .from("invoices")
        .insert({ organization_id: organizationId, ...invoice })
        .select()
        .single();
      if (error) throw error;

      const rows = items
        .filter((item) => item.description.trim())
        .map((item) => ({
          organization_id: organizationId,
          invoice_id: data.id,
          description: item.description.trim(),
          quantity: item.quantity,
          unit_price: item.unit_price,
        }));
      if (rows.length) {
        const { error: itemError } = await supabase.from("invoice_items").insert(rows);
        if (itemError) throw itemError;
      }
      return data as CloudInvoice;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cloud"] }),
  });
}

export function useUpdateInvoice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { id: string; status?: InvoiceStatus; due_date?: string | null; last_emailed_at?: string | null }) => {
      const { id, ...patch } = input;
      const { error } = await supabase.from("invoices").update(patch).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cloud"] }),
  });
}

export function useDeleteInvoice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("invoices").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cloud"] }),
  });
}

export function useCreatePayment(organizationId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      invoice_id: string | null;
      client_id: string | null;
      amount: number;
      method: PaymentMethod;
      reference: string;
      paid_on: string;
      notes: string;
    }) => {
      if (!organizationId) throw new Error("Select an organization first");
      const { data, error } = await supabase
        .from("payments")
        .insert({ organization_id: organizationId, ...input })
        .select()
        .single();
      if (error) throw error;
      return data as CloudPayment;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cloud"] }),
  });
}

export function useDeletePayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("payments").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cloud"] }),
  });
}

export function useCreateExpense(organizationId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      title: string;
      category: string;
      vendor: string;
      amount: number;
      spent_on: string;
      project_id: string | null;
      billable: boolean;
      status: ExpenseStatus;
      notes: string;
    }) => {
      if (!organizationId) throw new Error("Select an organization first");
      const { data, error } = await supabase
        .from("expenses")
        .insert({ organization_id: organizationId, ...input })
        .select()
        .single();
      if (error) throw error;
      return data as CloudExpense;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cloud"] }),
  });
}

export function useUpdateExpense() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { id: string; status?: ExpenseStatus; billable?: boolean }) => {
      const { id, ...patch } = input;
      const { error } = await supabase.from("expenses").update(patch).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cloud"] }),
  });
}

export function useDeleteExpense() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("expenses").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cloud"] }),
  });
}
