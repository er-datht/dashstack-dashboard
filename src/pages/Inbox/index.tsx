import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  mockMessages,
  mockEmailRecords,
  inboxLabels,
} from "./mockData";
import type { EmailRecord } from "./mockData";
import type { SentMessage, DraftMessage, BinnedMessage, ArchivedMessage } from "../../types/inbox";
import { useLocalStorage } from "../../hooks/useLocalStorage";
import InboxSidebar from "./InboxSidebar";
import ChatView from "./ChatView";
import MessageList from "./MessageList";
import ComposeView from "./ComposeView";
import InfoModal from "./InfoModal";
import type { InfoModalData } from "./InfoModal";

const BIN_ELIGIBLE_FOLDERS = ["inbox", "starred", "sent", "important"];
const ARCHIVE_ELIGIBLE_FOLDERS = ["inbox", "starred", "sent", "important", "draft"];

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
  const [archivedMessages, setArchivedMessages] = useLocalStorage<ArchivedMessage[]>(
    "inbox-archived-messages",
    []
  );

  const [labelOverrides, setLabelOverrides] = useState<Record<string, string>>(
    {}
  );

  const [infoModalItems, setInfoModalItems] = useState<InfoModalData[]>([]);

  const handleLabelAssign = (recordId: string, labelId: string) => {
    setLabelOverrides((prev) => ({ ...prev, [recordId]: labelId }));
  };

  const binnedIdSet = new Set(binnedMessages.map((m) => m.id));
  const archivedIdSet = new Set(archivedMessages.map((m) => m.id));

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
    (id) => starredIds[id] && !binnedIdSet.has(id) && !archivedIdSet.has(id)
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
    labelId: labelOverrides[msg.id] || "",
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
    labelId: labelOverrides[draft.id] || "",
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

  // Shared helper: resolve source folder, find record, build ArchivedMessage
  const buildArchivedMessage = (id: string): { archived: ArchivedMessage; isSent: boolean; isDraft: boolean } | null => {
    if (archivedIdSet.has(id)) return null;

    let sourceFolder = activeFolder;
    if (activeFolder === "starred") {
      if (mockEmailRecords.some((r) => r.id === id)) {
        sourceFolder = "inbox";
      } else if (sentMessages.some((m) => m.id === id)) {
        sourceFolder = "sent";
      } else if (draftMessages.some((m) => m.id === id)) {
        sourceFolder = "draft";
      }
    }

    const record =
      mockEmailRecords.find((r) => r.id === id) ||
      sentEmailRecords.find((r) => r.id === id) ||
      draftEmailRecords.find((r) => r.id === id);
    if (!record) return null;

    const sentMsg = sourceFolder === "sent" ? sentMessages.find((m) => m.id === id) : undefined;
    const draftMsg = sourceFolder === "draft" ? draftMessages.find((m) => m.id === id) : undefined;

    return {
      archived: {
        id: record.id,
        senderName: record.senderName,
        labelId: record.labelId,
        subject: record.subject,
        time: record.time,
        sourceFolder: sourceFolder as ArchivedMessage["sourceFolder"],
        ...(sentMsg && {
          recipientEmail: sentMsg.recipientEmail,
          body: sentMsg.body,
          sentAt: sentMsg.sentAt,
        }),
        ...(draftMsg && {
          recipientEmail: draftMsg.recipientEmail,
          body: draftMsg.body,
          savedAt: draftMsg.savedAt,
        }),
      },
      isSent: sourceFolder === "sent",
      isDraft: sourceFolder === "draft",
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

  const handleArchiveMessage = (id: string) => {
    const result = buildArchivedMessage(id);
    if (!result) return;

    setArchivedMessages((prev) => {
      if (prev.some((m) => m.id === id)) return prev;
      return [...prev, result.archived];
    });

    if (result.isSent) {
      setSentMessages((prev) => prev.filter((m) => m.id !== id));
    }
    if (result.isDraft) {
      setDraftMessages((prev) => prev.filter((d) => d.id !== id));
    }

    setToast(t("list.archived"));
  };

  const handleBulkArchive = (ids: string[]) => {
    const results = ids
      .map((id) => buildArchivedMessage(id))
      .filter((r): r is NonNullable<typeof r> => r !== null);

    if (results.length === 0) return;

    const sentIdsToRemove = new Set(
      results.filter((r) => r.isSent).map((r) => r.archived.id)
    );
    const draftIdsToRemove = new Set(
      results.filter((r) => r.isDraft).map((r) => r.archived.id)
    );

    setArchivedMessages((prev) => {
      const existingIds = new Set(prev.map((m) => m.id));
      const newItems = results
        .filter((r) => !existingIds.has(r.archived.id))
        .map((r) => r.archived);
      if (newItems.length === 0) return prev;
      return [...prev, ...newItems];
    });

    if (sentIdsToRemove.size > 0) {
      setSentMessages((prev) =>
        prev.filter((m) => !sentIdsToRemove.has(m.id))
      );
    }
    if (draftIdsToRemove.size > 0) {
      setDraftMessages((prev) =>
        prev.filter((d) => !draftIdsToRemove.has(d.id))
      );
    }

    setToast(t("list.archived"));
  };

  const handleUnarchiveMessage = (id: string) => {
    const archived = archivedMessages.find((m) => m.id === id);
    if (!archived) return;

    setArchivedMessages((prev) => prev.filter((m) => m.id !== id));

    if (archived.sourceFolder === "sent") {
      const restoredSent: SentMessage = {
        id: archived.id,
        recipientEmail: archived.recipientEmail ?? "",
        subject: archived.subject,
        body: archived.body ?? "",
        sentAt: archived.sentAt ?? new Date().toISOString(),
      };
      setSentMessages((prev) => [...prev, restoredSent]);
    }
    if (archived.sourceFolder === "draft") {
      const restoredDraft: DraftMessage = {
        id: archived.id,
        recipientEmail: archived.recipientEmail ?? "",
        subject: archived.subject,
        body: archived.body ?? "",
        savedAt: archived.savedAt ?? new Date().toISOString(),
      };
      setDraftMessages((prev) => [...prev, restoredDraft]);
    }

    setToast(t("list.unarchived"));
  };

  const handleBulkUnarchive = (ids: string[]) => {
    const toRestore = archivedMessages.filter((m) => ids.includes(m.id));
    if (toRestore.length === 0) return;

    setArchivedMessages((prev) => prev.filter((m) => !ids.includes(m.id)));

    const sentToRestore = toRestore.filter((m) => m.sourceFolder === "sent");
    if (sentToRestore.length > 0) {
      setSentMessages((prev) => [
        ...prev,
        ...sentToRestore.map((m) => ({
          id: m.id,
          recipientEmail: m.recipientEmail ?? "",
          subject: m.subject,
          body: m.body ?? "",
          sentAt: m.sentAt ?? new Date().toISOString(),
        })),
      ]);
    }
    const draftsToRestore = toRestore.filter((m) => m.sourceFolder === "draft");
    if (draftsToRestore.length > 0) {
      setDraftMessages((prev) => [
        ...prev,
        ...draftsToRestore.map((m) => ({
          id: m.id,
          recipientEmail: m.recipientEmail ?? "",
          subject: m.subject,
          body: m.body ?? "",
          savedAt: m.savedAt ?? new Date().toISOString(),
        })),
      ]);
    }

    setToast(t("list.unarchived"));
  };

  const handleMessageListShowInfo = (selectedRecords: EmailRecord[]) => {
    if (selectedRecords.length === 0) return;
    setInfoModalItems(
      selectedRecords.map((record) => {
        const label = inboxLabels.find(
          (l) => l.id === (labelOverrides[record.id] || record.labelId)
        );
        return {
          senderName: record.senderName,
          subject: record.subject,
          labelName: label ? t(label.nameKey) : "",
          labelColor: label?.color ?? "",
          time: `${new Date().toLocaleDateString()} ${record.time}`,
          isStarred: !!starredIds[record.id],
          folder: t(`folders.${activeFolder}`),
        };
      })
    );
  };

  const handleChatShowInfo = () => {
    if (!selectedRecord) return;
    const label = inboxLabels.find((l) => l.id === activeLabel);
    const sentMsg = sentMessages.find((m) => m.id === selectedRecord.id);
    setInfoModalItems([
      {
        senderName: sentMsg ? sentMsg.recipientEmail : selectedRecord.senderName,
        subject: selectedRecord.subject,
        labelName: label ? t(label.nameKey) : "",
        labelColor: label?.color ?? "",
        time: `${new Date().toLocaleDateString()} ${selectedRecord.time}`,
        isStarred: !!starredIds[selectedRecord.id],
        folder: t(`folders.${activeFolder}`),
      },
    ]);
  };

  // Determine which records to show based on active folder
  const getDisplayRecords = (): EmailRecord[] => {
    if (activeFolder === "archive") {
      return archivedMessages.map((m) => ({
        id: m.id,
        senderName: m.senderName,
        labelId: m.labelId,
        subject: m.subject,
        time: m.time,
      }));
    }
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
      return sentEmailRecords.filter((r) => !binnedIdSet.has(r.id) && !archivedIdSet.has(r.id));
    }
    if (activeFolder === "draft") {
      return draftEmailRecords.filter((r) => !archivedIdSet.has(r.id));
    }
    if (activeFolder === "starred") {
      return [...mockEmailRecords, ...sentEmailRecords, ...draftEmailRecords].filter(
        (r) => !binnedIdSet.has(r.id) && !archivedIdSet.has(r.id)
      );
    }
    return mockEmailRecords.filter((r) => !binnedIdSet.has(r.id) && !archivedIdSet.has(r.id));
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
          onLabelChange={(labelId: string) => {
            setActiveLabel(labelId);
            if (selectedRecord) {
              handleLabelAssign(selectedRecord.id, labelId);
            }
          }}
          onShowToast={setToast}
          onBack={() => setSelectedRecord(null)}
          onArchive={ARCHIVE_ELIGIBLE_FOLDERS.includes(activeFolder) ? () => {
            if (selectedRecord) {
              handleArchiveMessage(selectedRecord.id);
              setSelectedRecord(null);
            }
          } : undefined}
          onShowInfo={handleChatShowInfo}
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
        onAssignLabel={handleLabelAssign}
        onArchive={ARCHIVE_ELIGIBLE_FOLDERS.includes(activeFolder) ? handleArchiveMessage : undefined}
        onBulkArchive={ARCHIVE_ELIGIBLE_FOLDERS.includes(activeFolder) ? handleBulkArchive : undefined}
        onUnarchive={activeFolder === "archive" ? handleUnarchiveMessage : undefined}
        onBulkUnarchive={activeFolder === "archive" ? handleBulkUnarchive : undefined}
        onShowInfo={handleMessageListShowInfo}
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
            archive: archivedMessages.length,
          }}
        />

        {renderRightPanel()}
      </div>

      <InfoModal
        isOpen={infoModalItems.length > 0}
        onClose={() => setInfoModalItems([])}
        items={infoModalItems}
      />

      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] px-4 py-2 rounded-lg shadow-lg bg-usermenu-bg text-usermenu-text border border-usermenu-border text-sm">
          {toast}
        </div>
      )}
    </div>
  );
}
