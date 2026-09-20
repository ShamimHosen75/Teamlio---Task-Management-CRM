import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { SkeletonGrid } from "@/components/shared/states";
import { PermissionGuard } from "@/components/shared/permission-guard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useProjectTemplates } from "@/hooks/use-data";

export const Route = createFileRoute("/project-templates")({
  head: () => ({
    meta: [
      { title: "Project Templates — Teamlio" },
      { name: "description", content: "Reusable project blueprints with preset tasks, milestones and stages." },
      { property: "og:title", content: "Project Templates — Teamlio" },
      { property: "og:description", content: "Blueprints that spin up a project in seconds." },
    ],
  }),
  component: TemplatesPage,
});

function TemplatesPage() {
  const { data: templates = [], isLoading } = useProjectTemplates();

  return (
    <PermissionGuard permission="project.read" mode="page">
      <div className="mx-auto max-w-[1600px]">
        <PageHeader title="Project templates" description="Start new work from a proven delivery blueprint." />
        {isLoading ? (
          <SkeletonGrid />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {templates.map((t) => (
              <div key={t.id} className="surface-card flex flex-col p-4">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-sm font-semibold">{t.name}</h3>
                  <Badge variant="secondary">{t.category}</Badge>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">{t.description}</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {t.workflow_stages.map((s) => (
                    <span key={s} className="rounded-md bg-surface-muted px-2 py-0.5 text-[11px] text-muted-foreground">
                      {s}
                    </span>
                  ))}
                </div>
                <p className="mt-3 text-xs text-muted-foreground">
                  {t.task_titles.length} tasks · {t.milestone_titles.length} milestones · {t.default_duration_days} days
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  className="mt-4 self-start"
                  onClick={() => toast.success(`${t.name} applied to a new project draft`)}
                >
                  Use template
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </PermissionGuard>
  );
}
