import { createFileRoute } from "@tanstack/react-router";
import { ConversationWorkspace } from "@/components/marketing/conversation-workspace";

export const Route = createFileRoute("/marketing/whatsapp")({
  head: () => ({
    meta: [
      { title: "WhatsApp Inbox — Teamlio" },
      { name: "description", content: "WhatsApp conversations with lead context beside every chat." },
      { property: "og:title", content: "WhatsApp Inbox — Teamlio" },
      { property: "og:description", content: "WhatsApp conversations with lead context." },
    ],
  }),
  component: WhatsAppPage,
});

function WhatsAppPage() {
  return (
    <ConversationWorkspace
      title="WhatsApp"
      description="Conversations from the connected business number, with lead context."
      channels={["WhatsApp"]}
    />
  );
}
