import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Search } from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { store } from "@/services/store";

interface Result {
  group: string;
  label: string;
  hint: string;
  to: string;
}

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const results: Result[] = [
    ...store.projects.map((p) => ({ group: "Projects", label: p.name, hint: p.code, to: `/projects/${p.id}` })),
    ...store.tasks.slice(0, 40).map((t) => ({ group: "Tasks", label: t.title, hint: t.code, to: "/tasks" })),
    ...store.clients.map((c) => ({ group: "Clients", label: c.name, hint: c.industry, to: "/crm/clients" })),
    ...store.leads.map((l) => ({ group: "Leads", label: l.name, hint: l.company, to: "/crm/leads" })),
    ...store.deals.map((d) => ({ group: "Deals", label: d.title, hint: d.stage, to: "/crm/deals" })),
    ...store.users.map((u) => ({ group: "Users", label: u.full_name, hint: u.job_title, to: "/users" })),
    ...store.teams.map((t) => ({ group: "Teams", label: t.name, hint: "Team", to: "/teams" })),
    ...store.files.slice(0, 15).map((f) => ({ group: "Files", label: f.name, hint: f.folder, to: "/files" })),
    ...store.meetings.map((m) => ({ group: "Meetings", label: m.title, hint: m.type, to: "/meetings" })),
    ...store.invoices.map((i) => ({ group: "Invoices", label: i.number, hint: i.status, to: "/business/invoices" })),
    ...store.contentItems.slice(0, 15).map((c) => ({
      group: "Content",
      label: c.title,
      hint: c.platform,
      to: "/marketing/content-calendar",
    })),
  ];

  const groups = Array.from(new Set(results.map((r) => r.group)));

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex h-9 w-full items-center gap-2 rounded-lg border bg-surface-muted/70 px-3 text-sm text-muted-foreground transition-colors hover:bg-accent lg:w-72"
      >
        <Search className="size-4" />
        <span className="flex-1 text-left">Search everything…</span>
        <kbd className="hidden rounded border bg-surface px-1.5 text-[10px] font-medium lg:inline">⌘K</kbd>
      </button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Search projects, tasks, clients, leads…" />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          {groups.map((group) => (
            <CommandGroup key={group} heading={group}>
              {results
                .filter((r) => r.group === group)
                .slice(0, 6)
                .map((r) => (
                  <CommandItem
                    key={`${r.group}-${r.label}-${r.to}`}
                    value={`${r.label} ${r.hint} ${r.group}`}
                    onSelect={() => {
                      setOpen(false);
                      navigate({ to: r.to });
                    }}
                  >
                    <span>{r.label}</span>
                    <span className="ml-auto text-xs text-muted-foreground">{r.hint}</span>
                  </CommandItem>
                ))}
            </CommandGroup>
          ))}
        </CommandList>
      </CommandDialog>
    </>
  );
}
