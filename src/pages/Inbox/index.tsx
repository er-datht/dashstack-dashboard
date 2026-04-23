import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  mockMessages,
  mockEmailRecords,
  inboxLabels,
} from "./mockData";
import type { EmailRecord } from "./mockData";
import type { SentMessage } from "../../types/inbox";
import { useLocalStorage } from "../../hooks/useLocalStorage";
import InboxSidebar from "./InboxSidebar";
import ChatView from "./ChatView";
import MessageList from "./MessageList";
import ComposeView from "./ComposeView";

export default function Inbox(): React.JSX.Element {
  const { t } = useTranslation("inbox");
  const [activeFolder, setActiveFolder] = useState("inbox");
  const [activeLabel, setActiveLabel] = useState("primary");
  const [selectedRecord, setSelectedRecord] = useState<EmailRecord | null>(
    null
  );
  const [toast, setToast] = useState<string | null>(null);
  const [showCompose, setShowCompose] = useState(false);
  const [sentMessages, setSentMessages] = useLocalStorage<SentMessage[]>(
    "inbox-sent-messages",
    []
  );

  // Starred state: keyed by record id, initialized from mock data
  const [starredIds, setStarredIds] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(
      mockEmailRecords.filter((r) => r.isStarred).map((r) => [r.id, true])
    )
  );

  const toggleStar = (id: string) => {
    setStarredIds((prev) => {
      const next = { ...prev };
      if (next[id]) {
        delete next[id];
      } else {
        next[id] = true;
      }
      return next;
    });
  };

  const starredCount = Object.values(starredIds).filter(Boolean).length;

  // Auto-dismiss toast after 2 seconds
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 2000);
    return () => clearTimeout(timer);
  }, [toast]);

  const handleSelectRecord = (record: EmailRecord) => {
    setSelectedRecord(record);
    setActiveLabel(record.labelId);
  };

  const handleCompose = () => {
    setShowCompose(true);
    setSelectedRecord(null);
  };

  const handleComposeClose = () => {
    setShowCompose(false);
  };

  const handleComposeSend = (message: {
    recipientEmail: string;
    subject: string;
    body: string;
  }) => {
    const sentMessage: SentMessage = {
      id: crypto.randomUUID(),
      recipientEmail: message.recipientEmail,
      subject: message.subject,
      body: message.body,
      sentAt: new Date().toISOString(),
    };
    setSentMessages((prev) => [...prev, sentMessage]);
    setToast(t("compose.messageSent"));
    setShowCompose(false);
    setActiveFolder("sent");
  };

  // Convert sent messages to EmailRecord format for the MessageList
  const sentEmailRecords: EmailRecord[] = sentMessages.map((msg) => ({
    id: msg.id,
    senderName: t("compose.me"),
    labelId: "",
    subject: msg.subject,
    time: new Date(msg.sentAt).toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    }),
  }));

  // Determine which records to show based on active folder
  const displayRecords =
    activeFolder === "sent" ? sentEmailRecords : mockEmailRecords;

  // Right panel content
  const renderRightPanel = () => {
    if (showCompose) {
      return (
        <ComposeView onClose={handleComposeClose} onSend={handleComposeSend} />
      );
    }

    if (selectedRecord) {
      const sentMsg = sentMessages.find((m) => m.id === selectedRecord.id);
      const chatMessages = sentMsg
        ? [
            {
              id: sentMsg.id,
              senderId: "user-1" as const,
              senderName: "You",
              recipientId: "recipient" as const,
              subject: sentMsg.subject,
              body: sentMsg.body,
              isRead: true,
              isStarred: false,
              hasAttachments: false,
              createdAt: sentMsg.sentAt,
              folder: "sent" as const,
            },
          ]
        : mockMessages;

      return (
        <ChatView
          messages={chatMessages}
          contactName={
            sentMsg ? sentMsg.recipientEmail : selectedRecord.senderName
          }
          activeLabel={activeLabel}
          labels={inboxLabels}
          onLabelChange={setActiveLabel}
          onShowToast={setToast}
          onBack={() => setSelectedRecord(null)}
        />
      );
    }

    return (
      <MessageList
        records={displayRecords}
        labels={inboxLabels}
        onSelect={handleSelectRecord}
        onShowToast={setToast}
        starredIds={starredIds}
        onToggleStar={toggleStar}
        activeFolder={activeFolder}
      />
    );
  };

  return (
    <div className="p-6">
      {/* Page Title */}
      <h1 className="text-2xl font-bold text-primary mb-6">{t("title")}</h1>

      {/* Two-Panel Layout */}
      <div
        className="flex gap-6"
        style={{ height: "calc(100vh - 180px)" }}
      >
        <InboxSidebar
          activeFolder={activeFolder}
          onFolderChange={setActiveFolder}
          onShowToast={setToast}
          onCompose={handleCompose}
          folderCountOverrides={{
            starred: starredCount,
            sent: sentMessages.length,
          }}
        />

        {renderRightPanel()}
      </div>

      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] px-4 py-2 rounded-lg shadow-lg bg-usermenu-bg text-usermenu-text border border-usermenu-border text-sm">
          {toast}
        </div>
      )}
    </div>
  );
}
