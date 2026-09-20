import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { addMonths, eachDayOfInterval, endOfMonth, endOfWeek, format, isSameDay, isSameMonth, parseISO, startOfMonth, startOfWeek } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { FilterBar } from "@/components/shared/filter-bar";
import { PermissionGuard } from "@/components/shared/permission-guard";
import { Button } from "@/components/ui/button";
import { useContentItems } from "@/hooks/use-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/marketing/content-calendar")({
  head: () => ({
    meta: [
      { title: "Content Calendar — Teamlio" },
      { name: "description", content: "Plan social content by date, platform and approval status." },
      { property: "og:title", content: "Content Calendar — Teamlio" },
      { property: "og:description", content: "Social content planned by date and platform." },
    ],
  }),
  component: ContentCalendarPage,
});

function ContentCalendarPage() {
  const { data: content = [] } = useContentItems();
  const [cursor, setCursor] = useState(new Date());
  const [platform, setPlatform] = useState("all");

  const items = content.filter((c) => platform === "all" || c.platform === platform);
  const days = eachDayOfInterval({
    start: startOfWeek(startOfMonth(cursor), { weekStartsOn: 1 }),
    end: endOfWeek(endOfMonth(cursor), { weekStartsOn: 1 }),
  });

  return (
    <PermissionGuard permission="marketing.read" mode="page">
      <div className="mx-auto max-w-[1500px]">
        <PageHeader
          title="Content calendar"
          description="What goes out, where and when."
          actions={
            <div className="grid w-full grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 sm:flex sm:w-auto">
              <FilterBar
                filters={[{ key: "platform", label: "Platform", options: ["Facebook", "Instagram", "LinkedIn", "YouTube", "TikTok"], value: platform, onChange: setPlatform }]}
              />
              <Button variant="outline" size="icon" onClick={() => setCursor(addMonths(cursor, -1))} aria-label="Previous month">
                <ChevronLeft className="size-4" />
              </Button>
              <span className="min-w-0 truncate text-center text-sm font-medium sm:min-w-[8.5rem]">{format(cursor, "MMMM yyyy")}</span>
              <Button variant="outline" size="icon" onClick={() => setCursor(addMonths(cursor, 1))} aria-label="Next month">
                <ChevronRight className="size-4" />
              </Button>
            </div>
          }
        />

        <div className="surface-card max-w-full overflow-x-auto overscroll-x-contain">
          <div className="min-w-[700px]">
            <div className="grid grid-cols-7 border-b bg-surface-muted/60 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
                <div key={d} className="px-2 py-2 text-center">{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7">
              {days.map((day) => {
                const dayItems = items.filter((c) => c.publish_date && isSameDay(parseISO(c.publish_date), day));
                return (
                  <div
                    key={day.toISOString()}
                    className={cn("min-h-[110px] border-b border-r p-1.5 last:border-r-0", !isSameMonth(day, cursor) && "bg-surface-muted/40 text-muted-foreground")}
                  >
                    <p className="mb-1 text-xs font-medium">{format(day, "d")}</p>
                    <div className="space-y-1">
                      {dayItems.slice(0, 3).map((c) => (
                        <p key={c.id} className="truncate rounded bg-primary-soft px-1.5 py-0.5 text-[11px] text-primary">
                          {c.publish_time} {c.title}
                        </p>
                      ))}
                      {dayItems.length > 3 ? <p className="text-[11px] text-muted-foreground">+{dayItems.length - 3} more</p> : null}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </PermissionGuard>
  );
}
