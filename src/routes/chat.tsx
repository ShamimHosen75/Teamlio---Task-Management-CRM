import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Send } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { PermissionGuard } from "@/components/shared/permission-guard";
import { UserAvatar, userName } from "@/components/shared/user-avatar";
import { SkeletonTable } from "@/components/shared/states";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { fmtDateTime, fromNow } from "@/lib/format";
import { useChatMessages, useChatRooms, useSendChatMessage } from "@/hooks/use-data";
import { useWorkspace } from "@/app/workspace";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/chat")({
  head: () => ({
    meta: [
      { title: "Team Chat — Teamlio" },
      { name: "description", content: "Project, team and direct conversations in one place." },
      { property: "og:title", content: "Team Chat — Teamlio" },
      { property: "og:description", content: "Project, team and direct conversations." },
    ],
  }),
  component: ChatPage,
});

function ChatPage() {
  const { data: rooms = [], isLoading } = useChatRooms();
  const { currentUser } = useWorkspace();
  const [roomId, setRoomId] = useState<string | null>(null);
  const activeId = roomId ?? rooms[0]?.id ?? "";
  const { data: messages = [] } = useChatMessages(activeId);
  const send = useSendChatMessage();
  const [draft, setDraft] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, activeId]);

  const activeRoom = rooms.find((r) => r.id === activeId);

  if (isLoading) return <SkeletonTable />;

  return (
    <PermissionGuard permission="chat.access" mode="page">
      <div className="mx-auto max-w-[1600px]">
        <PageHeader title="Team chat" description="Conversations stay attached to the project or client they belong to." />
        <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
          <aside className={cn("surface-card overflow-hidden", roomId && "hidden lg:block")}>
            <ul className="divide-y">
              {rooms.map((r) => (
                <li key={r.id}>
                  <button
                    onClick={() => setRoomId(r.id)}
                    className={cn(
                      "flex w-full items-start gap-3 px-4 py-3 text-left hover:bg-accent/60",
                      r.id === activeId && "bg-primary-soft/50",
                    )}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate text-sm font-medium">{r.name}</p>
                        {r.unread_count > 0 ? <Badge variant="secondary">{r.unread_count}</Badge> : null}
                      </div>
                      <p className="text-xs text-muted-foreground">{r.type} · {fromNow(r.last_message_at)}</p>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          </aside>

          <section className={cn("surface-card flex h-[calc(100dvh-12rem)] min-h-[420px] flex-col sm:h-[calc(100vh-15rem)]", !roomId && "hidden lg:flex")}>
            <header className="flex items-center gap-3 border-b px-4 py-3">
              <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setRoomId(null)} aria-label="Back to conversations">
                <ArrowLeft className="size-4" />
              </Button>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{activeRoom?.name ?? "Select a conversation"}</p>
                <p className="text-xs text-muted-foreground">{activeRoom?.member_ids.length ?? 0} members</p>
              </div>
            </header>

            <div className="scrollbar-thin flex-1 space-y-4 overflow-y-auto px-4 py-4">
              {messages.map((m) => {
                const mine = m.author_id === currentUser.id;
                return (
                  <div key={m.id} className={cn("flex gap-2.5", mine && "flex-row-reverse")}>
                    <UserAvatar userId={m.author_id} size="xs" />
                    <div className={cn("max-w-[84%] min-w-0 space-y-1 sm:max-w-[75%]", mine && "items-end text-right")}>
                      <p className="text-[11px] text-muted-foreground">
                        {userName(m.author_id)} · {fmtDateTime(m.created_at)}
                      </p>
                      <div className={cn("break-words rounded-2xl px-3.5 py-2 text-sm", mine ? "bg-primary text-primary-foreground" : "bg-surface-muted")}>
                        {m.body}
                      </div>
                      {m.reactions.length > 0 ? (
                        <div className="flex gap-1">
                          {m.reactions.map((r) => (
                            <span key={r.emoji} className="rounded-full border px-1.5 text-[11px]">
                              {r.emoji} {r.user_ids.length}
                            </span>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  </div>
                );
              })}
              <div ref={endRef} />
            </div>

            <form
              className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 border-t px-3 py-3 sm:px-4"
              onSubmit={(e) => {
                e.preventDefault();
                if (!draft.trim() || !activeId) return;
                send.mutate({ roomId: activeId, body: draft.trim() });
                setDraft("");
              }}
            >
              <Input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Write a message…" aria-label="Message" />
              <Button type="submit" size="icon" disabled={!draft.trim()}>
                <Send className="size-4" />
              </Button>
            </form>
          </section>
        </div>
      </div>
    </PermissionGuard>
  );
}
