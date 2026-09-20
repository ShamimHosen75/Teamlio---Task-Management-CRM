import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { FormDrawer } from "@/components/shared/form-drawer";
import { PermissionGuard } from "@/components/shared/permission-guard";
import { SkeletonGrid } from "@/components/shared/states";
import { UserAvatarGroup, userName } from "@/components/shared/user-avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTeamMembers, useTeams, useUsers } from "@/hooks/use-data";

export const Route = createFileRoute("/admin/teams")({
  head: () => ({
    meta: [
      { title: "Teams Management — Teamlio" },
      { name: "description", content: "Create teams, set leads and manage membership." },
      { property: "og:title", content: "Teams Management — Teamlio" },
      { property: "og:description", content: "Team structure, leads and membership." },
    ],
  }),
  component: AdminTeamsPage,
});

function AdminTeamsPage() {
  const { data: teams = [], isLoading } = useTeams();


  return (
    <PermissionGuard permission="team.manage" mode="page">
      <div className="mx-auto max-w-[1400px]">
        <PageHeader title="Teams management" description="How the organisation is grouped for delivery." actions={<NewTeamDrawer />} />
        {isLoading ? (
          <SkeletonGrid />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {teams.map((t) => (
              <TeamCard key={t.id} teamId={t.id} name={t.name} description={t.description} leadId={t.lead_user_id} />
            ))}
          </div>
        )}
      </div>
    </PermissionGuard>
  );
}

function TeamCard({
  teamId,
  name,
  description,
  leadId,
}: {
  teamId: string;
  name: string;
  description: string;
  leadId: string;
}) {
  const { data: members = [] } = useTeamMembers(teamId);
  return (
    <article className="surface-card p-5">
      <h3 className="text-sm font-semibold">{name}</h3>
      <p className="mt-1 text-xs text-muted-foreground">{description}</p>
      <p className="mt-3 text-xs text-muted-foreground">Lead · {userName(leadId)}</p>
      <div className="mt-4 flex items-center justify-between">
        <UserAvatarGroup userIds={members.map((m) => m.user.id)} max={5} />
        <Button variant="ghost" size="sm" asChild>
          <Link to="/teams/$teamId" params={{ teamId }}>Open</Link>
        </Button>
      </div>
    </article>
  );
}

function NewTeamDrawer() {
  const { data: users = [] } = useUsers();
  const [form, setForm] = useState({ name: "", description: "", lead: "" });
  const [error, setError] = useState("");

  return (
    <FormDrawer
      trigger={<Button size="sm"><Plus className="size-4" /> New team</Button>}
      title="Create a team"
      submitLabel="Create team"
      onSubmit={() => {
        if (!form.name.trim()) {
          setError("Give the team a name.");
          return false;
        }
        toast.success(`${form.name} created`);
        setForm({ name: "", description: "", lead: "" });
        setError("");
        return true;
      }}
    >
      <div className="space-y-4">
        {error ? <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p> : null}
        <div className="space-y-1.5">
          <Label htmlFor="team-name">Team name</Label>
          <Input id="team-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="team-desc">Description</Label>
          <Textarea id="team-desc" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </div>
        <div className="space-y-1.5">
          <Label>Team lead</Label>
          <Select value={form.lead} onValueChange={(v) => setForm({ ...form, lead: v })}>
            <SelectTrigger><SelectValue placeholder="Select a lead" /></SelectTrigger>
            <SelectContent>
              {users.map((u) => <SelectItem key={u.id} value={u.id}>{u.full_name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>
    </FormDrawer>
  );
}
