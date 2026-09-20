import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Copy, Plus } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { FormDrawer } from "@/components/shared/form-drawer";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { PermissionGuard } from "@/components/shared/permission-guard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/admin/api")({
  head: () => ({
    meta: [
      { title: "API & Webhooks — Teamlio" },
      { name: "description", content: "Issue API keys and register webhook endpoints." },
      { property: "og:title", content: "API & Webhooks — Teamlio" },
      { property: "og:description", content: "API keys and webhook endpoints." },
    ],
  }),
  component: ApiPage,
});

const KEYS = [
  { id: "k1", label: "Production", prefix: "nw_live_9f2c", created: "12 Jan 2026", lastUsed: "2 hours ago" },
  { id: "k2", label: "Staging", prefix: "nw_test_4ab1", created: "03 Feb 2026", lastUsed: "Yesterday" },
];

const HOOKS = [
  { id: "h1", event: "project.completed", url: "https://hooks.teamlio.io/projects", status: "Active" },
  { id: "h2", event: "invoice.paid", url: "https://hooks.teamlio.io/billing", status: "Active" },
  { id: "h3", event: "lead.created", url: "https://hooks.teamlio.io/crm", status: "Paused" },
];

function ApiPage() {
  return (
    <PermissionGuard permission="admin.access" mode="page">
      <div className="mx-auto max-w-[1100px]">
        <PageHeader title="API & webhooks" description="Let other systems read from and react to this workspace." />
        <Tabs defaultValue="keys">
          <TabsList>
            <TabsTrigger value="keys">API keys</TabsTrigger>
            <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
          </TabsList>

          <TabsContent value="keys" className="mt-4 space-y-4">
            <NewKeyDrawer />
            <div className="surface-card divide-y">
              {KEYS.map((k) => (
                <div key={k.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3.5">
                  <div>
                    <p className="text-sm font-medium">{k.label}</p>
                    <p className="font-mono text-xs text-muted-foreground">{k.prefix}••••••••</p>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>Created {k.created}</span>
                    <span>· Used {k.lastUsed}</span>
                    <Button variant="ghost" size="icon" onClick={() => toast.success("Key prefix copied")} aria-label="Copy key">
                      <Copy className="size-4" />
                    </Button>
                    <ConfirmDialog
                      trigger={<Button variant="ghost" size="sm">Revoke</Button>}
                      title={`Revoke the ${k.label} key?`}
                      description="Any system using this key stops working immediately."
                      confirmLabel="Revoke"
                      destructive
                      onConfirm={() => toast.success("API key revoked")}
                    />
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="webhooks" className="mt-4">
            <div className="surface-card divide-y">
              {HOOKS.map((h) => (
                <div key={h.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3.5">
                  <div>
                    <p className="font-mono text-sm">{h.event}</p>
                    <p className="text-xs text-muted-foreground">{h.url}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={h.status === "Active" ? "default" : "secondary"}>{h.status}</Badge>
                    <Button variant="ghost" size="sm" onClick={() => toast.success("Test event sent")}>Send test</Button>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </PermissionGuard>
  );
}

function NewKeyDrawer() {
  const [label, setLabel] = useState("");
  const [error, setError] = useState("");

  return (
    <FormDrawer
      trigger={<Button size="sm"><Plus className="size-4" /> Create API key</Button>}
      title="Create an API key"
      description="Copy the key once — it is not shown again."
      submitLabel="Create key"
      onSubmit={() => {
        if (!label.trim()) {
          setError("Name the key so you know where it is used.");
          return false;
        }
        toast.success(`${label} key created`);
        setLabel("");
        setError("");
        return true;
      }}
    >
      <div className="space-y-4">
        {error ? <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p> : null}
        <div className="space-y-1.5">
          <Label htmlFor="key-label">Key name</Label>
          <Input id="key-label" value={label} onChange={(e) => setLabel(e.target.value)} />
        </div>
      </div>
    </FormDrawer>
  );
}
