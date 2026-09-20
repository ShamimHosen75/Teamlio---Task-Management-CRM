import { createFileRoute } from "@tanstack/react-router";
import { ConversationWorkspace } from "@/components/marketing/conversation-workspace";

export const Route = createFileRoute("/marketing/inbox")({
  head: () => ({
    meta: [
      { title: "Unified Lead Inbox — Teamlio" },
      { name: "description", content: "WhatsApp, Instagram and Facebook conversations in one inbox." },
      { property: "og:title", content: "Unified Lead Inbox — Teamlio" },
      { property: "og:description", content: "All channel conversations in one inbox." },
    ],
  }),
  component: InboxPage,
});

function InboxPage() {
  return (
    <ConversationWorkspace
      title="Unified lead inbox"
      description="Every inbound conversation, whichever channel it arrived on."
      channels={["WhatsApp", "Instagram", "Facebook"]}
    />
  );
}
