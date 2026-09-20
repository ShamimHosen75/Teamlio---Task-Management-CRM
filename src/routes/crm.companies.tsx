import { createFileRoute, Link } from "@tanstack/react-router";
import { Building2, Globe, Mail } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/badges";
import { SkeletonGrid } from "@/components/shared/states";
import { PermissionGuard } from "@/components/shared/permission-guard";
import { useClients, useContacts, useProjects } from "@/hooks/use-data";

export const Route = createFileRoute("/crm/companies")({
  head: () => ({
    meta: [
      { title: "Companies — Teamlio" },
      { name: "description", content: "Company accounts with industry, contacts and engagement volume." },
      { property: "og:title", content: "Companies — Teamlio" },
      { property: "og:description", content: "Company accounts and their engagement volume." },
    ],
  }),
  component: CompaniesPage,
});

function CompaniesPage() {
  const { data: clients = [], isLoading } = useClients();
  const { data: contacts = [] } = useContacts();
  const { data: projects = [] } = useProjects();

  return (
    <PermissionGuard permission="client.read" mode="page">
      <div className="mx-auto max-w-[1600px]">
        <PageHeader title="Companies" description="The organisations behind your client accounts." />
        {isLoading ? (
          <SkeletonGrid />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {clients.map((c) => (
              <Link key={c.id} to="/crm/clients" className="surface-card p-4 hover:shadow-raised">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="flex size-10 items-center justify-center rounded-lg bg-primary-soft text-primary">
                      <Building2 className="size-5" />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">{c.company}</p>
                      <p className="text-xs text-muted-foreground">{c.industry}</p>
                    </div>
                  </div>
                  <StatusBadge status={c.status} />
                </div>
                <div className="mt-4 space-y-1.5 text-xs text-muted-foreground">
                  <p className="flex items-center gap-1.5"><Mail className="size-3.5" /> {c.email}</p>
                  <p className="flex items-center gap-1.5"><Globe className="size-3.5" /> {c.website}</p>
                </div>
                <p className="mt-3 text-xs text-muted-foreground">
                  {projects.filter((p) => p.client_id === c.id).length} projects · {contacts.filter((ct) => ct.client_id === c.id).length} contacts
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </PermissionGuard>
  );
}
