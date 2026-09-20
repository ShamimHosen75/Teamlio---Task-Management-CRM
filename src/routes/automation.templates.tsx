import { createFileRoute } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { PermissionGuard } from "@/components/shared/permission-guard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/automation/templates")({
  head: () => ({
    meta: [
      { title: "Automation Templates — Teamlio" },
      { name: "description", content: "Ready-made automation recipes for common team routines." },
      { property: "og:title", content: "Automation Templates — Teamlio" },
      { property: "og:description", content: "Ready-made automation recipes." },
    ],
  }),
  component: AutomationTemplates,
});

const TEMPLATES = [
  { name: "Welcome new leads", trigger: "Lead created", condition: "Source is Website", action: "Send welcome message", category: "CRM" },
  { name: "Escalate overdue tasks", trigger: "Task overdue", condition: "Priority is Urgent", action: "Notify project manager", category: "Delivery" },
  { name: "Chase unpaid invoices", trigger: "Invoice due date passed", condition: "Status is not Paid", action: "Send reminder", category: "Finance" },
  { name: "Assign inbound WhatsApp", trigger: "Conversation received", condition: "Owner is empty", action: "Assign to sales rota", category: "Marketing" },
  { name: "Daily update nudge", trigger: "Daily cutoff reached", condition: "Update is missing", action: "Notify the person", category: "Operations" },
  { name: "Deal won handover", trigger: "Deal moved to Won", condition: "Value above 10,000", action: "Create project from template", category: "CRM" },
];

function AutomationTemplates() {
  return (
    <PermissionGuard permission="automation.manage" mode="page">
      <div className="mx-auto max-w-[1400px]">
        <PageHeader title="Automation templates" description="Start from a proven recipe instead of a blank rule." />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {TEMPLATES.map((t) => (
            <article key={t.name} className="surface-card flex flex-col p-5">
              <Badge variant="secondary" className="w-fit">{t.category}</Badge>
              <h3 className="mt-3 text-sm font-semibold">{t.name}</h3>
              <ol className="mt-3 flex-1 space-y-2 text-xs text-muted-foreground">
                <li className="flex items-start gap-2"><ArrowRight className="mt-0.5 size-3" /> {t.trigger}</li>
                <li className="flex items-start gap-2"><ArrowRight className="mt-0.5 size-3" /> {t.condition}</li>
                <li className="flex items-start gap-2"><ArrowRight className="mt-0.5 size-3" /> {t.action}</li>
              </ol>
              <Button variant="outline" size="sm" className="mt-4" onClick={() => toast.success(`${t.name} added to your workflows`)}>
                Use template
              </Button>
            </article>
          ))}
        </div>
      </div>
    </PermissionGuard>
  );
}
