import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  mockMessages,
  mockEmailRecords,
  inboxLabels,
} from "./mockData";
import type { EmailRecord } from "./mockData";
import type { SentMessage, DraftMessage, BinnedMessage } from "../../types/inbox";
import { useLocalStorage } from "../../hooks/useLocalStorage";
import InboxSidebar from "./InboxSidebar";
import ChatView from "./ChatView";
import MessageList from "./MessageList";
import ComposeView from "./ComposeView";

const BIN_ELIGIBLE_FOLDERS = ["inbox", "starred", "sent", "important"];

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
  const [binnedMessages, setBinnedMessages] = useLocalStorage<BinnedMessage[]>(
    "inbox-binned-messages",
    []
  );

  const binnedIdSet = new Set(binnedMessages.map((m) => m.id));

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

  const starredCount = Object.keys(starredIds).filter(
    (id) => starredIds[id] && !binnedIdSet.has(id)
  ).length;

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
    draftId?: string | null,
    navigateToDraft?: boolean
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
    if (navigateToDraft) {
      setShowCompose(false);
      setEditingDraftId(null);
      setDraftInitialData(null);
      setActiveFolderRaw("draft");
      setSelectedRecord(null);
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

  // Shared helper: resolve source folder, find record, build BinnedMessage
  const buildBinnedMessage = (id: string): { binned: BinnedMessage; isSent: boolean } | null => {
    if (binnedIdSet.has(id)) return null;

    let sourceFolder = activeFolder;
    if (activeFolder === "starred") {
      if (mockEmailRecords.some((r) => r.id === id)) {
        sourceFolder = "inbox";
      } else if (sentMessages.some((m) => m.id === id)) {
        sourceFolder = "sent";
      }
    }

    const record =
      mockEmailRecords.find((r) => r.id === id) ||
      sentEmailRecords.find((r) => r.id === id);
    if (!record) return null;

    const sentMsg = sourceFolder === "sent" ? sentMessages.find((m) => m.id === id) : undefined;

    return {
      binned: {
        id: record.id,
        senderName: record.senderName,
        labelId: record.labelId,
        subject: record.subject,
        time: record.time,
        sourceFolder: sourceFolder as BinnedMessage["sourceFolder"],
        ...(sentMsg && {
          recipientEmail: sentMsg.recipientEmail,
          body: sentMsg.body,
          sentAt: sentMsg.sentAt,
        }),
      },
      isSent: sourceFolder === "sent",
    };
  };

  const handleDeleteToBin = (id: string) => {
    const result = buildBinnedMessage(id);
    if (!result) return;

    // Guard inside updater to prevent duplicates from rapid clicks
    setBinnedMessages((prev) => {
      if (prev.some((m) => m.id === id)) return prev;
      return [...prev, result.binned];
    });

    if (result.isSent) {
      setSentMessages((prev) => prev.filter((m) => m.id !== id));
    }

    setToast(t("list.deletedToBin"));
  };

  const handleBulkDeleteToBin = (ids: string[]) => {
    const results = ids
      .map((id) => buildBinnedMessage(id))
      .filter((r): r is NonNullable<typeof r> => r !== null);

    if (results.length === 0) return;

    const sentIdsToRemove = new Set(
      results.filter((r) => r.isSent).map((r) => r.binned.id)
    );

    // Guard inside updater to prevent duplicates from stale state
    setBinnedMessages((prev) => {
      const existingIds = new Set(prev.map((m) => m.id));
      const newItems = results
        .filter((r) => !existingIds.has(r.binned.id))
        .map((r) => r.binned);
      if (newItems.length === 0) return prev;
      return [...prev, ...newItems];
    });

    if (sentIdsToRemove.size > 0) {
      setSentMessages((prev) =>
        prev.filter((m) => !sentIdsToRemove.has(m.id))
      );
    }

    setToast(t("list.deletedToBin"));
  };

  const handleRestoreFromBin = (id: string) => {
    const binned = binnedMessages.find((m) => m.id === id);
    if (!binned) return;

    setBinnedMessages((prev) => prev.filter((m) => m.id !== id));

    // If source was sent, re-add to sentMessages with preserved data
    if (binned.sourceFolder === "sent") {
      const restoredSent: SentMessage = {
        id: binned.id,
        recipientEmail: binned.recipientEmail ?? "",
        subject: binned.subject,
        body: binned.body ?? "",
        sentAt: binned.sentAt ?? new Date().toISOString(),
      };
      setSentMessages((prev) => [...prev, restoredSent]);
    }

    setToast(t("list.restored"));
  };

  // Determine which records to show based on active folder
  const getDisplayRecords = (): EmailRecord[] => {
    if (activeFolder === "bin") {
      return binnedMessages.map((m) => ({
        id: m.id,
        senderName: m.senderName,
        labelId: m.labelId,
        subject: m.subject,
        time: m.time,
      }));
    }
    if (activeFolder === "sent") {
      return sentEmailRecords.filter((r) => !binnedIdSet.has(r.id));
    }
    if (activeFolder === "draft") {
      return draftEmailRecords;
    }
    if (activeFolder === "starred") {
      return [...mockEmailRecords, ...sentEmailRecords, ...draftEmailRecords].filter(
        (r) => !binnedIdSet.has(r.id)
      );
    }
    return mockEmailRecords.filter((r) => !binnedIdSet.has(r.id));
  };
  const displayRecords = getDisplayRecords();

  // Determine handlers based on active folder
  const getDeleteHandler = () => {
    if (activeFolder === "draft") return handleDeleteDraft;
    if (BIN_ELIGIBLE_FOLDERS.includes(activeFolder)) return handleDeleteToBin;
    return undefined;
  };
  const deleteHandler = getDeleteHandler();
  const bulkDeleteHandler = BIN_ELIGIBLE_FOLDERS.includes(activeFolder)
    ? handleBulkDeleteToBin
    : undefined;

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
        onDelete={deleteHandler}
        onRestore={activeFolder === "bin" ? handleRestoreFromBin : undefined}
        onBulkDelete={bulkDeleteHandler}
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
            bin: binnedMessages.length,
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
