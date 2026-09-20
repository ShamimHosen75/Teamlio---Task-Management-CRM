import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const AskInput = z.object({
  organizationId: z.string().uuid(),
  question: z.string().min(1).max(2000),
  history: z
    .array(z.object({ role: z.enum(["user", "assistant"]), text: z.string().max(4000) }))
    .max(12)
    .default([]),
});

const SYSTEM_PROMPT = `You are the workspace assistant for a project management CRM.
Answer questions about leads, deals, clients, projects, tasks, invoices, payments, expenses and team roles
using ONLY the workspace snapshot provided in the context message. Be concise and specific: cite counts,
names and amounts from the data. If the snapshot has no relevant records, say so plainly and suggest what
the admin could add. Never invent records, numbers or people. Format money as it appears in the data.`;

type Row = Record<string, unknown>;

function compact(rows: Row[] | null, fields: string[], limit = 40) {
  return (rows ?? []).slice(0, limit).map((row) => {
    const out: Row = {};
    for (const f of fields) if (row[f] !== null && row[f] !== undefined && row[f] !== "") out[f] = row[f];
    return out;
  });
}

export const askWorkspaceAssistant = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => AskInput.parse(input))
  .handler(async ({ data, context }) => {
    const apiKey = process.env["LOVABLE_API_KEY"];
    if (!apiKey) throw new Error("The assistant is not configured yet.");

    const supabase = context.supabase;
    const org = data.organizationId;
    const q = <T,>(p: PromiseLike<{ data: T | null }>) => p;

    const [
      orgRow,
      settingsRow,
      members,
      profiles,
      projects,
      tasks,
      leads,
      clients,
      deals,
      invoices,
      payments,
      expenses,
    ] = await Promise.all([
      q(supabase.from("organizations").select("name, slug").eq("id", org).maybeSingle()),
      q(
        supabase
          .from("organization_settings")
          .select("currency, timezone, admin_email")
          .eq("organization_id", org)
          .maybeSingle(),
      ),
      q(supabase.from("organization_members").select("user_id, role, status").eq("organization_id", org)),
      q(supabase.from("profiles").select("id, full_name, email, job_title")),
      q(
        supabase
          .from("projects")
          .select("name, category, status, priority, progress, due_date, manager_id")
          .eq("organization_id", org),
      ),
      q(
        supabase
          .from("project_tasks")
          .select("title, status, priority, category, due_date, assignee_id")
          .eq("organization_id", org),
      ),
      q(
        supabase
          .from("crm_leads")
          .select("name, company, status, source, estimated_value, assigned_to")
          .eq("organization_id", org),
      ),
      q(supabase.from("crm_clients").select("company, status, industry, owner_id").eq("organization_id", org)),
      q(
        supabase
          .from("crm_deals")
          .select("title, stage, value, probability, expected_close_date")
          .eq("organization_id", org),
      ),
      q(
        supabase
          .from("invoices")
          .select("invoice_number, status, issue_date, due_date, currency, tax_rate")
          .eq("organization_id", org),
      ),
      q(supabase.from("payments").select("amount, method, paid_on").eq("organization_id", org)),
      q(
        supabase
          .from("expenses")
          .select("title, category, amount, status, billable, spent_on")
          .eq("organization_id", org),
      ),
    ]);

    const profileById = new Map(
      ((profiles.data ?? []) as Row[]).map((p) => [p["id"] as string, p]),
    );
    const team = ((members.data ?? []) as Row[]).map((m) => {
      const p = profileById.get(m["user_id"] as string);
      return {
        name: (p?.["full_name"] as string) ?? (p?.["email"] as string) ?? "Unknown",
        role: m["role"],
        status: m["status"],
        job_title: p?.["job_title"] ?? undefined,
      };
    });
    const nameOf = (id: unknown) =>
      (profileById.get(id as string)?.["full_name"] as string) ?? undefined;

    const snapshot = {
      organization: orgRow.data ?? { name: "Workspace" },
      workspace_defaults: settingsRow.data ?? { currency: "USD", timezone: "UTC", admin_email: "" },
      today: new Date().toISOString().slice(0, 10),
      current_user: (() => {
        const me = profileById.get(context.userId as string);
        const myMembership = ((members.data ?? []) as Row[]).find((m) => m["user_id"] === context.userId);
        return {
          name: (me?.["full_name"] as string) ?? (me?.["email"] as string) ?? "Unknown",
          email: me?.["email"] ?? undefined,
          job_title: me?.["job_title"] ?? undefined,
          role: myMembership?.["role"] ?? undefined,
        };
      })(),
      team,
      projects: compact(projects.data as Row[], [
        "name",
        "category",
        "status",
        "priority",
        "progress",
        "due_date",
      ]).map((p, i) => ({ ...p, manager: nameOf((projects.data as Row[])?.[i]?.["manager_id"]) })),
      tasks: compact(tasks.data as Row[], ["title", "status", "priority", "category", "due_date"], 60).map(
        (t, i) => ({ ...t, assignee: nameOf((tasks.data as Row[])?.[i]?.["assignee_id"]) }),
      ),
      leads: compact(leads.data as Row[], ["name", "company", "status", "source", "estimated_value"]),
      clients: compact(clients.data as Row[], ["company", "status", "industry"]),
      deals: compact(deals.data as Row[], ["title", "stage", "value", "probability", "expected_close_date"]),
      invoices: compact(invoices.data as Row[], [
        "invoice_number",
        "status",
        "issue_date",
        "due_date",
        "currency",
      ]),
      payments: compact(payments.data as Row[], ["amount", "method", "paid_on"]),
      expenses: compact(expenses.data as Row[], ["title", "category", "amount", "status", "billable"]),
    };

    const input = [
      { role: "system", content: [{ type: "input_text", text: SYSTEM_PROMPT }] },
      {
        role: "user",
        content: [
          {
            type: "input_text",
            text: `Workspace snapshot (JSON):\n${JSON.stringify(snapshot)}`,
          },
        ],
      },
      ...data.history.map((m) => ({
        role: m.role,
        content: [{ type: m.role === "user" ? "input_text" : "output_text", text: m.text }],
      })),
      { role: "user", content: [{ type: "input_text", text: data.question }] },
    ];

    const response = await fetch("https://ai.gateway.lovable.dev/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Lovable-API-Key": apiKey,
        "X-Lovable-AIG-SDK": "fetch",
      },
      body: JSON.stringify({
        model: "openai/gpt-6-astra",
        input,
        stream: true,
        store: false,
        reasoning: { effort: "low", summary: "auto" },
      }),
    });

    if (!response.ok || !response.body) {
      const detail = await response.text().catch(() => "");
      if (response.status === 429) throw new Error("The assistant is busy right now. Try again in a moment.");
      if (response.status === 402)
        throw new Error("The workspace is out of AI credits. Add credits in Lovable to keep asking.");
      if (response.status === 403)
        throw new Error("AI access is blocked for this workspace by an admin setting.");
      throw new Error(`The assistant could not answer (${response.status}). ${detail.slice(0, 200)}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let answer = "";
    let reasoning = "";

    while (true) {
      const chunk = await reader.read();
      if (chunk.done) break;
      buffer += decoder.decode(chunk.value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";
      for (const line of lines) {
        if (!line.startsWith("data:")) continue;
        const payload = line.slice(5).trim();
        if (!payload || payload === "[DONE]") continue;
        try {
          const event = JSON.parse(payload) as { type?: string; delta?: string };
          if (event.type === "response.output_text.delta" && event.delta) answer += event.delta;
          else if (event.type === "response.reasoning_summary_text.delta" && event.delta)
            reasoning += event.delta;
        } catch {
          // ignore keep-alive / non-JSON frames
        }
      }
    }

    const text = answer.trim() || reasoning.trim();
    return { answer: text || "I could not find an answer for that in your workspace data." };
  });
