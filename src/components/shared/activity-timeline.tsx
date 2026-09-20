import { CheckCircle2, CircleDot, FileUp, MessageSquare, UserPlus2, CalendarClock, Plus } from "lucide-react";
import type { ActivityEvent } from "@/lib/types";
import { fromNow } from "@/lib/format";
import { userName } from "@/components/shared/user-avatar";
import { EmptyState } from "@/components/shared/states";

const iconFor = (action: string) => {
  if (action.includes("Created")) return Plus;
  if (action.includes("status")) return CircleDot;
  if (action.includes("Assigned")) return UserPlus2;
  if (action.includes("comment")) return MessageSquare;
  if (action.includes("file")) return FileUp;
  if (action.includes("Completed")) return CheckCircle2;
  return CalendarClock;
};

export function ActivityTimeline({ events, limit }: { events: ActivityEvent[]; limit?: number }) {
  const rows = limit ? events.slice(0, limit) : events;
  if (rows.length === 0) {
    return <EmptyState title="No activity yet" description="Actions taken on this record will show up here." />;
  }
  return (
    <ol className="relative space-y-5 border-l pl-6">
      {rows.map((event) => {
        const Icon = iconFor(event.action);
        return (
          <li key={event.id} className="relative">
            <span className="absolute -left-[31px] flex size-6 items-center justify-center rounded-full border bg-surface text-muted-foreground">
              <Icon className="size-3" />
            </span>
            <p className="text-sm">
              <span className="font-medium">{userName(event.actor_id)}</span>{" "}
              <span className="text-muted-foreground">{event.action.toLowerCase()}</span>
            </p>
            <p className="text-sm text-muted-foreground">{event.detail}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">{fromNow(event.created_at)}</p>
          </li>
        );
      })}
    </ol>
  );
}
