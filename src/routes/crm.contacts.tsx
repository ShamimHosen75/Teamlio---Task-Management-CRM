import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable, type Column } from "@/components/shared/data-table";
import { PermissionGuard } from "@/components/shared/permission-guard";
import { Badge } from "@/components/ui/badge";
import { useClients, useContacts } from "@/hooks/use-data";
import type { Contact } from "@/lib/types";

export const Route = createFileRoute("/crm/contacts")({
  head: () => ({
    meta: [
      { title: "Contacts — Teamlio" },
      { name: "description", content: "Every named contact across your client accounts." },
      { property: "og:title", content: "Contacts — Teamlio" },
      { property: "og:description", content: "Named contacts across all client accounts." },
    ],
  }),
  component: ContactsPage,
});

function ContactsPage() {
  const { data: contacts = [], isLoading } = useContacts();
  const { data: clients = [] } = useClients();

  const columns: Column<Contact>[] = [
    {
      key: "name",
      header: "Contact",
      sortable: true,
      sortValue: (r) => r.full_name,
      render: (r) => (
        <div>
          <p className="font-medium">{r.full_name}</p>
          <p className="text-xs text-muted-foreground">{r.designation}</p>
        </div>
      ),
    },
    {
      key: "client",
      header: "Client",
      hideBelow: "md",
      render: (r) => {
        const client = clients.find((c) => c.id === r.client_id);
        return client ? (
          <Link to="/crm/clients" className="hover:text-primary">
            {client.company}
          </Link>
        ) : (
          "—"
        );
      },
    },
    { key: "email", header: "Email", hideBelow: "lg", render: (r) => r.email },
    { key: "phone", header: "Phone", hideBelow: "xl", render: (r) => r.phone },
    { key: "primary", header: "Role", render: (r) => (r.is_primary ? <Badge variant="secondary">Primary</Badge> : <span className="text-xs text-muted-foreground">Secondary</span>) },
  ];

  return (
    <PermissionGuard permission="client.read" mode="page">
      <div className="mx-auto max-w-[1600px]">
        <PageHeader title="Contacts" description="People you work with inside each client organisation." />
        <DataTable
          data={contacts}
          columns={columns}
          loading={isLoading}
          searchKeys={["full_name", "email", "designation"]}
          searchPlaceholder="Search contacts…"
          pageSize={12}
          mobileCard={(r) => (
            <div className="space-y-1">
              <p className="font-medium">{r.full_name}</p>
              <p className="text-xs text-muted-foreground">{r.designation}</p>
              <p className="text-xs">{r.email}</p>
            </div>
          )}
        />
      </div>
    </PermissionGuard>
  );
}
