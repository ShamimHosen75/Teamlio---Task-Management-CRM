import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StatCard } from "@/components/shared/stat-card";
import { LivePage, TextField, useLiveOrgContext } from "@/components/cloud/crm-ui";
import {
  CURRENCY_OPTIONS,
  TIMEZONE_OPTIONS,
  useOrgSettings,
  useSaveOrgSettings,
} from "@/hooks/use-cloud";
import { money } from "@/lib/format";
import { CircleDollarSign, Clock, Mail } from "lucide-react";

export const Route = createFileRoute("/_authenticated/settings/workspace")({
  head: () => ({
    meta: [
      { title: "Workspace Settings — Project CRM" },
      {
        name: "description",
        content: "Set the default currency, timezone and admin email used across your live workspace.",
      },
      { property: "og:title", content: "Workspace Settings — Project CRM" },
      { property: "og:description", content: "Real defaults for currency, timezone and admin contact." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: WorkspaceSettingsPage,
});

function WorkspaceSettingsPage() {
  const { activeOrgId, activeOrg, canManage } = useLiveOrgContext();
  const { data: settings, isLoading } = useOrgSettings(activeOrgId);
  const save = useSaveOrgSettings(activeOrgId);

  const [currency, setCurrency] = useState("USD");
  const [timezone, setTimezone] = useState("UTC");
  const [adminEmail, setAdminEmail] = useState("");

  useEffect(() => {
    setCurrency(settings?.currency ?? "USD");
    setTimezone(settings?.timezone ?? "UTC");
    setAdminEmail(settings?.admin_email ?? "");
  }, [settings?.currency, settings?.timezone, settings?.admin_email, activeOrgId]);

  const localTime = new Date().toLocaleTimeString("en-GB", {
    timeZone: timezone,
    hour: "2-digit",
    minute: "2-digit",
  });

  function onSave() {
    if (adminEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(adminEmail)) {
      toast.error("Enter a valid admin email address");
      return;
    }
    save.mutate(
      { currency, timezone, admin_email: adminEmail.trim() },
      {
        onSuccess: () => toast.success("Workspace defaults saved"),
        onError: (error) =>
          toast.error(error instanceof Error ? error.message : "Could not save workspace settings"),
      },
    );
  }

  return (
    <LivePage
      title="Workspace Settings"
      description="Defaults your reports, charts and the AI assistant use for this organization."
    >
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Default currency" value={money(1000, currency)} icon={CircleDollarSign} loading={isLoading} />
        <StatCard label="Timezone" value={`${timezone} · ${localTime}`} icon={Clock} loading={isLoading} />
        <StatCard label="Admin email" value={adminEmail || "Not set"} icon={Mail} loading={isLoading} />
      </div>

      <div className="surface-card mt-4 max-w-[720px] space-y-4 p-5">
        <div className="space-y-1.5">
          <Label>Default currency</Label>
          <Select value={currency} onValueChange={setCurrency} disabled={!canManage}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CURRENCY_OPTIONS.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Used for pipeline value, invoices without their own currency, expenses and every money chart.
          </p>
        </div>

        <div className="space-y-1.5">
          <Label>Timezone</Label>
          <Select value={timezone} onValueChange={setTimezone} disabled={!canManage}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TIMEZONE_OPTIONS.map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <TextField
          label="Admin email"
          value={adminEmail}
          onChange={setAdminEmail}
          type="email"
          placeholder="admin@company.com"
        />

        <div className="flex items-center gap-3">
          <Button size="sm" onClick={onSave} disabled={!canManage || save.isPending}>
            {save.isPending ? "Saving…" : "Save defaults"}
          </Button>
          {!canManage ? (
            <p className="text-xs text-muted-foreground">
              Only owners, admins and managers of {activeOrg?.name} can change these defaults.
            </p>
          ) : null}
        </div>
      </div>
    </LivePage>
  );
}
