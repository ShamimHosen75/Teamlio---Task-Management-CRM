import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { Bot, Send } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LivePage, useLiveOrgContext } from "@/components/cloud/crm-ui";
import { askWorkspaceAssistant } from "@/lib/ai-assistant.functions";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/ai-assistant")({
  head: () => ({
    meta: [
      { title: "Workspace AI Assistant — Project CRM" },
      {
        name: "description",
        content: "Ask live questions about your leads, projects, invoices and team roles.",
      },
      { property: "og:title", content: "Workspace AI Assistant — Project CRM" },
      { property: "og:description", content: "Live answers from your own workspace records." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AiAssistantPage,
});

interface Msg {
  id: string;
  role: "user" | "assistant";
  text: string;
}

const SUGGESTIONS = [
  "Which leads are worth chasing this week?",
  "How are my projects tracking?",
  "What invoices are still unpaid?",
  "Who is on the team and what role do they have?",
];

function AiAssistantPage() {
  return (
    <LivePage
      title="AI assistant"
      description="Ask about your live leads, projects, invoices and team roles."
    >
      <AssistantChat />
    </LivePage>
  );
}

function AssistantChat() {
  const { activeOrgId } = useLiveOrgContext();
  const ask = useServerFn(askWorkspaceAssistant);
  const [messages, setMessages] = useState<Msg[]>([
    {
      id: "welcome",
      role: "assistant",
      text: "Ask me anything about this organization's leads, deals, projects, tasks, invoices, expenses or team roles. I only read your own records.",
    },
  ]);
  const [draft, setDraft] = useState("");
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const mutation = useMutation({
    mutationFn: async (question: string) => {
      if (!activeOrgId) throw new Error("Pick an organization first.");
      return ask({
        data: {
          organizationId: activeOrgId,
          question,
          history: messages.filter((m) => m.id !== "welcome").slice(-8).map((m) => ({ role: m.role, text: m.text })),
        },
      });
    },
    onSuccess: (result) => {
      setMessages((m) => [...m, { id: `a${Date.now()}`, role: "assistant", text: result.answer }]);
    },
    onError: (error: Error) => {
      toast.error(error.message || "The assistant could not answer that.");
    },
    onSettled: () => inputRef.current?.focus(),
  });

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, mutation.isPending]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const send = (question: string) => {
    const text = question.trim();
    if (!text || mutation.isPending) return;
    setMessages((m) => [...m, { id: `u${Date.now()}`, role: "user", text }]);
    setDraft("");
    mutation.mutate(text);
  };

  return (
    <div className="surface-card flex h-[calc(100dvh-12rem)] min-h-[360px] max-h-[760px] min-w-0 flex-col sm:h-[calc(100vh-17rem)] sm:min-h-[420px]">
      <div className="scrollbar-thin flex-1 space-y-4 overflow-y-auto p-3 sm:p-4">
        {messages.map((m) => (
          <div key={m.id} className={cn("flex gap-2.5", m.role === "user" && "flex-row-reverse")}>
            {m.role === "assistant" ? (
              <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary">
                <Bot className="size-3.5" />
              </span>
            ) : null}
            <div
              className={cn(
                "max-w-[88%] break-words whitespace-pre-wrap rounded-2xl px-3.5 py-2 text-sm sm:max-w-[80%]",
                m.role === "user" ? "bg-primary text-primary-foreground" : "bg-surface-muted",
              )}
            >
              {m.text}
            </div>
          </div>
        ))}
        {mutation.isPending ? (
          <p className="animate-pulse text-sm text-muted-foreground">Reading your workspace…</p>
        ) : null}
        <div ref={endRef} />
      </div>

      <div className="scrollbar-thin flex shrink-0 gap-2 overflow-x-auto border-t px-3 py-2.5 sm:flex-wrap sm:px-4 sm:py-3">
        {SUGGESTIONS.map((s) => (
          <Button key={s} className="shrink-0" variant="outline" size="sm" disabled={mutation.isPending} onClick={() => send(s)}>
            {s}
          </Button>
        ))}
      </div>

      <form
        className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 border-t px-3 py-3 sm:px-4"
        onSubmit={(e) => {
          e.preventDefault();
          send(draft);
        }}
      >
        <Input
          ref={inputRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Ask about leads, projects, invoices or your team…"
          aria-label="Ask the assistant"
        />
        <Button type="submit" size="icon" disabled={!draft.trim() || mutation.isPending}>
          <Send className="size-4" />
        </Button>
      </form>
    </div>
  );
}
