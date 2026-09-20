import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { PermissionGuard } from "@/components/shared/permission-guard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/admin/integrations")({
  head: () => ({
    meta: [
      { title: "Integrations — Teamlio" },
      { name: "description", content: "Connect messaging, advertising, payment and storage services." },
      { property: "og:title", content: "Integrations — Teamlio" },
      { property: "og:description", content: "Connect the services your workspace relies on." },
    ],
  }),
  component: IntegrationsPage,
});

const INTEGRATIONS = [
  { key: "meta", name: "Meta Business", category: "Marketing", description: "Facebook and Instagram pages, ads and lead forms." },
  { key: "whatsapp", name: "WhatsApp Business", category: "Marketing", description: "Two-way messaging with leads and clients." },
  { key: "stripe", name: "Payments", category: "Finance", description: "Collect invoice payments online." },
  { key: "email", name: "Transactional email", category: "Operations", description: "Invitations, reminders and alerts." },
  { key: "storage", name: "Cloud storage", category: "Files", description: "Store project files and deliverables." },
  { key: "calendar", name: "Calendar sync", category: "Operations", description: "Two-way sync for meetings and deadlines." },
];

function IntegrationsPage() {
  const [connected, setConnected] = useState<string[]>([]);

  return (
    <PermissionGuard permission="admin.access" mode="page">
      <div className="mx-auto max-w-[1300px]">
        <PageHeader title="Integrations" description="Services this workspace can talk to. Nothing is connected in the demo environment." />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {INTEGRATIONS.map((i) => {
            const isOn = connected.includes(i.key);
            return (
              <article key={i.key} className="surface-card flex flex-col p-5">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-sm font-semibold">{i.name}</h3>
                  <Badge variant={isOn ? "default" : "secondary"}>{isOn ? "Connected" : "Not connected"}</Badge>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{i.category}</p>
                <p className="mt-3 flex-1 text-sm text-muted-foreground">{i.description}</p>
                <Button
                  variant={isOn ? "outline" : "default"}
                  size="sm"
                  className="mt-4"
                  onClick={() => {
                    setConnected((c) => (isOn ? c.filter((k) => k !== i.key) : [...c, i.key]));
                    toast.success(isOn ? `${i.name} disconnected` : `${i.name} connected`);
                  }}
                >
                  {isOn ? "Disconnect" : "Connect"}
                </Button>
              </article>
            );
          })}
        </div>
      </div>
    </PermissionGuard>
  );
}
