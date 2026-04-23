import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  mockMessages,
  mockEmailRecords,
  inboxLabels,
} from "./mockData";
import type { EmailRecord } from "./mockData";
import type { SentMessage, DraftMessage } from "../../types/inbox";
import { useLocalStorage } from "../../hooks/useLocalStorage";
import InboxSidebar from "./InboxSidebar";
import ChatView from "./ChatView";
import MessageList from "./MessageList";
import ComposeView from "./ComposeView";

export default function Inbox(): React.JSX.Element {
  const { t } = useTranslation("inbox");
  const [activeFolder, setActiveFolderRaw] = useState("inbox");
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
  const [draftMessages, setDraftMessages] = useLocalStorage<DraftMessage[]>(
    "inbox-draft-messages",
    []
  );
  const [editingDraftId, setEditingDraftId] = useState<string | null>(null);
  const [draftInitialData, setDraftInitialData] = useState<{
    recipientEmail: string;
    subject: string;
    body: string;
  } | null>(null);

  const setActiveFolder = (folder: string) => {
    setActiveFolderRaw(folder);
    setShowCompose(false);
    setSelectedRecord(null);
    setEditingDraftId(null);
    setDraftInitialData(null);
  };

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

  const handleDraftClick = (record: EmailRecord) => {
    const draft = draftMessages.find((d) => d.id === record.id);
    if (draft) {
      setDraftInitialData({
        recipientEmail: draft.recipientEmail,
        subject: draft.subject,
        body: draft.body,
      });
      setEditingDraftId(draft.id);
      setShowCompose(true);
      setSelectedRecord(null);
    }
  };

  const handleSelectRecord = (record: EmailRecord) => {
    if (draftMessages.some((d) => d.id === record.id)) {
      handleDraftClick(record);
      return;
    }
    setSelectedRecord(record);
    setActiveLabel(record.labelId);
  };

  const handleCompose = () => {
    setEditingDraftId(null);
    setDraftInitialData(null);
    setShowCompose(true);
    setSelectedRecord(null);
  };

  const handleComposeClose = () => {
    setShowCompose(false);
    setEditingDraftId(null);
    setDraftInitialData(null);
  };

  const handleComposeSend = (message: {
    recipientEmail: string;
    subject: string;
    body: string;
  }) => {
    // If sending a draft, remove it from drafts
    if (editingDraftId) {
      setDraftMessages((prev) =>
        prev.filter((d) => d.id !== editingDraftId)
      );
      setEditingDraftId(null);
      setDraftInitialData(null);
    }

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

  const handleSaveDraft = (
    data: { recipientEmail: string; subject: string; body: string },
    draftId?: string | null
  ) => {
    if (draftId) {
      // Update existing draft
      setDraftMessages((prev) =>
        prev.map((d) =>
          d.id === draftId
            ? {
                ...d,
                recipientEmail: data.recipientEmail,
                subject: data.subject,
                body: data.body,
                savedAt: new Date().toISOString(),
              }
            : d
        )
      );
    } else {
      // Create new draft
      const newId = crypto.randomUUID();
      const newDraft: DraftMessage = {
        id: newId,
        recipientEmail: data.recipientEmail,
        subject: data.subject,
        body: data.body,
        savedAt: new Date().toISOString(),
      };
      setDraftMessages((prev) => [...prev, newDraft]);
      setEditingDraftId(newId);
    }
  };

  const handleDeleteDraft = (id: string) => {
    setDraftMessages((prev) => prev.filter((d) => d.id !== id));
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

  // Convert draft messages to EmailRecord format for the MessageList
  const draftEmailRecords: EmailRecord[] = draftMessages.map((draft) => ({
    id: draft.id,
    senderName: t("compose.me"),
    labelId: "",
    subject: draft.subject || t("compose.noSubject"),
    time: new Date(draft.savedAt).toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    }),
  }));

  // Determine which records to show based on active folder
  const displayRecords =
    activeFolder === "sent"
      ? sentEmailRecords
      : activeFolder === "draft"
        ? draftEmailRecords
        : activeFolder === "starred"
          ? [...mockEmailRecords, ...sentEmailRecords, ...draftEmailRecords]
          : mockEmailRecords;

  // Right panel content
  const renderRightPanel = () => {
    if (showCompose) {
      return (
        <ComposeView
          onClose={handleComposeClose}
          onSend={handleComposeSend}
          initialData={draftInitialData}
          editingDraftId={editingDraftId}
          onSaveDraft={handleSaveDraft}
          onShowToast={setToast}
        />
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
        onDelete={activeFolder === "draft" ? handleDeleteDraft : undefined}
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
            draft: draftMessages.length,
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
