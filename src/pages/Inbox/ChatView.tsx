import { useTranslation } from "react-i18next";
import type { Message } from "../../types/inbox";
import type { InboxLabel } from "./mockData";
import ChatHeader from "./ChatHeader";
import ChatBubble from "./ChatBubble";
import ChatInput from "./ChatInput";

type ChatViewProps = {
  messages: Message[];
  contactName: string;
  activeLabel: string;
  labels: InboxLabel[];
  onLabelChange: (labelId: string) => void;
  onShowToast: (message: string) => void;
  onBack: () => void;
  onArchive?: () => void;
};

function formatTime(createdAt: string, locale: string): string {
  const date = new Date(createdAt);
  return date.toLocaleTimeString(locale, { hour: "numeric", minute: "2-digit" });
}

export default function ChatView({
  messages,
  contactName,
  activeLabel,
  labels,
  onLabelChange,
  onShowToast,
  onBack,
  onArchive,
}: ChatViewProps): React.JSX.Element {
  const { i18n } = useTranslation();
  return (
    <div className="card flex-1 flex flex-col overflow-hidden">
      <ChatHeader
        contactName={contactName}
        activeLabel={activeLabel}
        labels={labels}
        onLabelChange={onLabelChange}
        onShowToast={onShowToast}
        onBack={onBack}
        onArchive={onArchive}
      />

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-5">
        {messages.map((message) => (
          <ChatBubble
            key={message.id}
            body={message.body}
            time={formatTime(message.createdAt, i18n.language)}
            isSent={message.folder === "sent"}
            avatarUrl={message.senderAvatar}
          />
        ))}
      </div>

      <ChatInput onShowToast={onShowToast} />
    </div>
  );
}
