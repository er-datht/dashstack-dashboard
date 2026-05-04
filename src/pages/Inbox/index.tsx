import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  mockMessages,
  mockEmailRecords,
  mockSpamRecords,
  inboxLabels,
} from "./mockData";
import type { EmailRecord } from "./mockData";
import type { SentMessage, DraftMessage, BinnedMessage, ArchivedMessage, SpammedMessage, DeliveredMessage, Message } from "../../types/inbox";
import { useLocalStorage } from "../../hooks/useLocalStorage";
import { getStoredUser } from "../../services/auth";
import InboxSidebar from "./InboxSidebar";
import ChatView from "./ChatView";
import MessageList from "./MessageList";
import ComposeView from "./ComposeView";
import InfoModal from "./InfoModal";
import type { InfoModalData } from "./InfoModal";

const BIN_ELIGIBLE_FOLDERS = ["inbox", "starred", "sent", "important"];
const ARCHIVE_ELIGIBLE_FOLDERS = ["inbox", "starred", "sent", "important", "draft"];
const SPAM_ELIGIBLE_FOLDERS = ["inbox", "starred", "sent"];
const IMPORTANT_ELIGIBLE_FOLDERS = ["inbox", "starred", "sent", "important"];

const VALID_FOLDERS = ["inbox", "starred", "sent", "draft", "spam", "important", "bin", "archive"];

export default function Inbox(): React.JSX.Element {
  const { t } = useTranslation("inbox");
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeFolder, setActiveFolderRaw] = useState(() => {
    const folder = searchParams.get("folder");
    return folder && VALID_FOLDERS.includes(folder) ? folder : "inbox";
  });
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
  const [deliveredMessages, setDeliveredMessages] = useLocalStorage<DeliveredMessage[]>(
    "inbox-delivered-messages",
    []
  );
  const [restoredSpamIds, setRestoredSpamIds] = useLocalStorage<string[]>(
    "inbox-restored-spam-ids",
    []
  );
  const [restoredFromSpam, setRestoredFromSpam] = useLocalStorage<EmailRecord[]>(
    "inbox-restored-from-spam",
    []
  );
  const [spammedMessages, setSpammedMessages] = useLocalStorage<SpammedMessage[]>(
    "inbox-spammed-messages",
    []
  );

  const [conversationMessages, setConversationMessages] = useState<Message[]>([]);

  const [labelOverrides, setLabelOverrides] = useLocalStorage<Record<string, string>>(
    "inbox-label-overrides",
    {}
  );

  const [infoModalItems, setInfoModalItems] = useState<InfoModalData[]>([]);

  const handleLabelAssign = (recordId: string, labelId: string) => {
    setLabelOverrides((prev) => ({ ...prev, [recordId]: labelId }));
  };

  const binnedIdSet = new Set(binnedMessages.map((m) => m.id));
  const archivedIdSet = new Set(archivedMessages.map((m) => m.id));
  const spammedIdSet = new Set(spammedMessages.map((m) => m.id));
  const restoredSpamIdSet = new Set(restoredSpamIds);

  const setActiveFolder = (folder: string) => {
    setActiveFolderRaw(folder);
    setSearchParams(folder === "inbox" ? {} : { folder }, { replace: true });
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
    (id) => starredIds[id] && !binnedIdSet.has(id) && !archivedIdSet.has(id) && !spammedIdSet.has(id)
  ).length;

  // Important state: keyed by record id, persisted in localStorage so the
  // user's flagged set survives page reloads. Seeded on first mount from the
  // mockEmailRecords entries marked `isImportant: true`.
  const [importantIds, setImportantIds] = useLocalStorage<Record<string, boolean>>(
    "inbox-important-ids",
    Object.fromEntries(
      mockEmailRecords.filter((r) => r.isImportant).map((r) => [r.id, true])
    )
  );

  const toggleImportant = (id: string) => {
    const wasFlagged = !!importantIds[id];
    setImportantIds((prev) => {
      const next = { ...prev };
      if (next[id]) delete next[id];
      else next[id] = true;
      return next;
    });
    setToast(t(wasFlagged ? "list.unmarkedImportant" : "list.markedImportant"));
  };

  const toggleImportantBulk = (ids: string[], flag: boolean) => {
    if (ids.length === 0) return;
    setImportantIds((prev) => {
      const next = { ...prev };
      ids.forEach((id) => {
        if (flag) {
          next[id] = true;
        } else {
          delete next[id];
        }
      });
      return next;
    });
    setToast(flag ? t("list.markedImportant") : t("list.unmarkedImportant"));
  };

  const importantCount = Object.keys(importantIds).filter(
    (id) =>
      importantIds[id] &&
      !binnedIdSet.has(id) &&
      !archivedIdSet.has(id) &&
      !spammedIdSet.has(id)
  ).length;

  // Auto-dismiss toast after 2 seconds
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 2000);
    return () => clearTimeout(timer);
  }, [toast]);

  // Initialize conversation messages when a record is selected.
  // Intentionally depends only on selectedRecord?.id — we re-initialize only
  // when a different record is selected, not when sentMessages updates (which
  // would discard newly sent chat messages).
  useEffect(() => {
    if (!selectedRecord) {
      setConversationMessages([]);
      return;
    }
    const sentMsg = sentMessages.find((m) => m.id === selectedRecord.id);
    const deliveredMsg = deliveredMessages.find((m) => m.id === selectedRecord.id);
    if (sentMsg) {
      setConversationMessages([
        {
          id: sentMsg.id,
          senderId: "user-1",
          senderName: "You",
          recipientId: "recipient",
          subject: sentMsg.subject,
          body: sentMsg.body,
          isRead: true,
          isStarred: false,
          hasAttachments: false,
          createdAt: sentMsg.sentAt,
          folder: "sent",
        },
      ]);
    } else if (deliveredMsg) {
      // Load the full conversation thread between current user and this sender
      const loggedInUser = getStoredUser();
      const partnerEmail = deliveredMsg.senderEmail === loggedInUser?.email
        ? deliveredMsg.recipientEmail
        : deliveredMsg.senderEmail;
      const thread = deliveredMessages
        .filter(
          (m) =>
            (m.senderEmail === loggedInUser?.email && m.recipientEmail === partnerEmail) ||
            (m.senderEmail === partnerEmail && m.recipientEmail === loggedInUser?.email)
        )
        .sort((a, b) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime())
        .map((m): Message => ({
          id: m.id,
          senderId: m.senderEmail,
          senderName: m.senderEmail === loggedInUser?.email ? "You" : m.senderName,
          recipientId: m.recipientEmail,
          subject: m.subject,
          body: m.body,
          isRead: true,
          isStarred: false,
          hasAttachments: false,
          createdAt: m.sentAt,
          folder: m.senderEmail === loggedInUser?.email ? "sent" : "inbox",
        }));
      setConversationMessages(thread);
    } else {
      setConversationMessages([...mockMessages]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRecord?.id]);

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

  const deliverMessage = (recipientEmail: string, subject: string, body: string) => {
    const currentUser = getStoredUser();
    if (!currentUser) return;

    const delivered: DeliveredMessage = {
      id: crypto.randomUUID(),
      senderEmail: currentUser.email,
      senderName: currentUser.name,
      recipientEmail,
      subject,
      body,
      sentAt: new Date().toISOString(),
    };
    setDeliveredMessages((prev) => [...prev, delivered]);
  };

  const handleComposeSend = (message: {
    recipientEmail: string;
    subject: string;
    body: string;
  }) => {
    // Capture the draft's label before removing it
    const draftLabel = editingDraftId ? labelOverrides[editingDraftId] : undefined;

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
      senderEmail: getStoredUser()?.email,
      recipientEmail: message.recipientEmail,
      subject: message.subject,
      body: message.body,
      sentAt: new Date().toISOString(),
    };
    setSentMessages((prev) => [...prev, sentMessage]);

    // Carry over label from draft to sent message
    if (draftLabel) {
      setLabelOverrides((prev) => ({ ...prev, [sentMessage.id]: draftLabel }));
    }
    deliverMessage(message.recipientEmail, message.subject, message.body);
    setToast(t("compose.messageSent"));
    setShowCompose(false);
    setActiveFolder("sent");
  };

  const handleChatSend = (text: string) => {
    const newMessage: Message = {
      id: crypto.randomUUID(),
      senderId: "user-1",
      senderName: "You",
      recipientId: selectedRecord?.id ?? "recipient",
      subject: selectedRecord?.subject ?? "",
      body: text,
      isRead: true,
      isStarred: false,
      hasAttachments: false,
      createdAt: new Date().toISOString(),
      folder: "sent",
    };
    setConversationMessages((prev) => [...prev, newMessage]);

    if (selectedRecord?.senderEmail) {
      deliverMessage(selectedRecord.senderEmail, selectedRecord.subject, text);
    }
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
        senderEmail: getStoredUser()?.email,
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

  // Filter sent/draft messages to only show the current user's items
  const currentUserEmail = getStoredUser()?.email;
  const userSentMessages = sentMessages.filter(
    (m) => !m.senderEmail || m.senderEmail === currentUserEmail
  );
  const userDraftMessages = draftMessages.filter(
    (d) => !d.senderEmail || d.senderEmail === currentUserEmail
  );

  // Convert sent messages to EmailRecord format for the MessageList
  const sentEmailRecords: EmailRecord[] = userSentMessages.map((msg) => ({
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
  const draftEmailRecords: EmailRecord[] = userDraftMessages.map((draft) => ({
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
    if (activeFolder === "starred" || activeFolder === "important") {
      if (mockEmailRecords.some((r) => r.id === id)) {
        sourceFolder = "inbox";
      } else if (sentMessages.some((m) => m.id === id)) {
        sourceFolder = "sent";
      } else if (
        restoredFromSpam.some((r) => r.id === id) ||
        receivedEmailRecords.some((r) => r.id === id)
      ) {
        sourceFolder = "inbox";
      }
    }

    const record =
      mockEmailRecords.find((r) => r.id === id) ||
      sentEmailRecords.find((r) => r.id === id) ||
      restoredFromSpam.find((r) => r.id === id) ||
      receivedEmailRecords.find((r) => r.id === id);
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
    if (activeFolder === "starred" || activeFolder === "important") {
      if (mockEmailRecords.some((r) => r.id === id)) {
        sourceFolder = "inbox";
      } else if (sentMessages.some((m) => m.id === id)) {
        sourceFolder = "sent";
      } else if (draftMessages.some((m) => m.id === id)) {
        sourceFolder = "draft";
      } else if (
        restoredFromSpam.some((r) => r.id === id) ||
        receivedEmailRecords.some((r) => r.id === id)
      ) {
        sourceFolder = "inbox";
      }
    }

    const record =
      mockEmailRecords.find((r) => r.id === id) ||
      sentEmailRecords.find((r) => r.id === id) ||
      draftEmailRecords.find((r) => r.id === id) ||
      restoredFromSpam.find((r) => r.id === id) ||
      receivedEmailRecords.find((r) => r.id === id);
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

  const buildSpammedMessage = (id: string): { spammed: SpammedMessage; isSent: boolean } | null => {
    if (spammedIdSet.has(id) || binnedIdSet.has(id) || archivedIdSet.has(id)) return null;

    let sourceFolder = activeFolder;
    if (activeFolder === "starred") {
      if (mockEmailRecords.some((r) => r.id === id)) {
        sourceFolder = "inbox";
      } else if (sentMessages.some((m) => m.id === id)) {
        sourceFolder = "sent";
      } else if (restoredFromSpam.some((r) => r.id === id)) {
        sourceFolder = "inbox";
      }
    }

    const record =
      mockEmailRecords.find((r) => r.id === id) ||
      sentEmailRecords.find((r) => r.id === id) ||
      restoredFromSpam.find((r) => r.id === id);
    if (!record) return null;

    const sentMsg = sourceFolder === "sent" ? sentMessages.find((m) => m.id === id) : undefined;

    return {
      spammed: {
        id: record.id,
        senderName: record.senderName,
        labelId: record.labelId,
        subject: record.subject,
        time: record.time,
        sourceFolder: sourceFolder as SpammedMessage["sourceFolder"],
        ...(sentMsg && {
          recipientEmail: sentMsg.recipientEmail,
          body: sentMsg.body,
          sentAt: sentMsg.sentAt,
        }),
      },
      isSent: sourceFolder === "sent",
    };
  };

  const handleMoveToSpam = (id: string) => {
    const result = buildSpammedMessage(id);
    if (!result) return;

    setSpammedMessages((prev) => {
      if (prev.some((m) => m.id === id)) return prev;
      return [...prev, result.spammed];
    });

    if (result.isSent) {
      setSentMessages((prev) => prev.filter((m) => m.id !== id));
    }

    // If the message was restored from spam, remove it from the restored lists
    if (restoredFromSpam.some((r) => r.id === id)) {
      setRestoredFromSpam((prev) => prev.filter((r) => r.id !== id));
      setRestoredSpamIds((prev) => prev.filter((rid) => rid !== id));
    }

    setToast(t("list.movedToSpam"));
  };

  const handleBulkMoveToSpam = (ids: string[]) => {
    const results = ids
      .map((id) => buildSpammedMessage(id))
      .filter((r): r is NonNullable<typeof r> => r !== null);

    if (results.length === 0) return;

    const sentIdsToRemove = new Set(
      results.filter((r) => r.isSent).map((r) => r.spammed.id)
    );

    setSpammedMessages((prev) => {
      const existingIds = new Set(prev.map((m) => m.id));
      const newItems = results
        .filter((r) => !existingIds.has(r.spammed.id))
        .map((r) => r.spammed);
      if (newItems.length === 0) return prev;
      return [...prev, ...newItems];
    });

    if (sentIdsToRemove.size > 0) {
      setSentMessages((prev) =>
        prev.filter((m) => !sentIdsToRemove.has(m.id))
      );
    }

    // Remove any restored-from-spam records that are being re-spammed
    const restoredIdsToRemove = results
      .filter((r) => restoredFromSpam.some((rf) => rf.id === r.spammed.id))
      .map((r) => r.spammed.id);
    if (restoredIdsToRemove.length > 0) {
      const removeSet = new Set(restoredIdsToRemove);
      setRestoredFromSpam((prev) => prev.filter((r) => !removeSet.has(r.id)));
      setRestoredSpamIds((prev) => prev.filter((rid) => !removeSet.has(rid)));
    }

    setToast(t("list.movedToSpam"));
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

  const handleNotSpam = (id: string) => {
    // Path 1: User-spammed message — restore to source folder
    const spammed = spammedMessages.find((m) => m.id === id);
    if (spammed) {
      setSpammedMessages((prev) => prev.filter((m) => m.id !== id));

      if (spammed.sourceFolder === "sent") {
        const restoredSent: SentMessage = {
          id: spammed.id,
          recipientEmail: spammed.recipientEmail ?? "",
          subject: spammed.subject,
          body: spammed.body ?? "",
          sentAt: spammed.sentAt ?? new Date().toISOString(),
        };
        setSentMessages((prev) => [...prev, restoredSent]);
      }

      setToast(t("list.markedNotSpam"));
      return;
    }

    // Path 2: Pre-seeded mock spam — restore to inbox
    const record = mockSpamRecords.find((r) => r.id === id);
    if (!record) return;
    setRestoredSpamIds((prev) => {
      if (prev.includes(id)) return prev;
      return [...prev, id];
    });
    setRestoredFromSpam((prev) => {
      if (prev.some((r) => r.id === id)) return prev;
      return [...prev, record];
    });
    setToast(t("list.markedNotSpam"));
  };

  const handleBulkNotSpam = (ids: string[]) => {
    ids.forEach((id) => handleNotSpam(id));
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

  // Convert received delivered messages to EmailRecord format for the inbox
  const currentUser = getStoredUser();
  const receivedEmailRecords: EmailRecord[] = currentUser
    ? deliveredMessages
        .filter((m) => m.recipientEmail === currentUser.email)
        .map((m) => ({
          id: m.id,
          senderName: m.senderName,
          senderEmail: m.senderEmail,
          labelId: labelOverrides[m.id] || "",
          subject: m.subject,
          time: new Date(m.sentAt).toLocaleTimeString([], {
            hour: "numeric",
            minute: "2-digit",
          }),
        }))
    : [];

  // Inbox-specific filtered arrays (used for both display and sidebar count)
  const inboxMockRecords = mockEmailRecords
    .filter((r) => !binnedIdSet.has(r.id) && !archivedIdSet.has(r.id) && !spammedIdSet.has(r.id))
    .map((r) => (labelOverrides[r.id] ? { ...r, labelId: labelOverrides[r.id] } : r));
  const activeRestoredFromSpam = restoredFromSpam.filter(
    (r) => !binnedIdSet.has(r.id) && !archivedIdSet.has(r.id) && !spammedIdSet.has(r.id)
  );
  const inboxCount = receivedEmailRecords.length + activeRestoredFromSpam.length + inboxMockRecords.length;

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
      return sentEmailRecords.filter((r) => !binnedIdSet.has(r.id) && !archivedIdSet.has(r.id) && !spammedIdSet.has(r.id));
    }
    if (activeFolder === "draft") {
      return draftEmailRecords.filter((r) => !archivedIdSet.has(r.id));
    }
    if (activeFolder === "spam") {
      const mockSpam = mockSpamRecords.filter((r) => !restoredSpamIdSet.has(r.id));
      const userSpam: EmailRecord[] = spammedMessages.map((m) => ({
        id: m.id,
        senderName: m.senderName,
        labelId: m.labelId,
        subject: m.subject,
        time: m.time,
      }));
      return [...userSpam, ...mockSpam];
    }
    if (activeFolder === "starred") {
      return [...mockEmailRecords, ...sentEmailRecords, ...draftEmailRecords, ...restoredFromSpam].filter(
        (r) => !binnedIdSet.has(r.id) && !archivedIdSet.has(r.id) && !spammedIdSet.has(r.id)
      );
    }
    if (activeFolder === "important") {
      return [
        ...mockEmailRecords,
        ...sentEmailRecords,
        ...draftEmailRecords,
        ...restoredFromSpam,
        ...receivedEmailRecords,
      ].filter(
        (r) =>
          !binnedIdSet.has(r.id) && !archivedIdSet.has(r.id) && !spammedIdSet.has(r.id)
      );
    }
    return [...receivedEmailRecords, ...activeRestoredFromSpam, ...inboxMockRecords];
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
      const isImportantEligible =
        IMPORTANT_ELIGIBLE_FOLDERS.includes(activeFolder);

      return (
        <ChatView
          messages={conversationMessages}
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
          onArchive={ARCHIVE_ELIGIBLE_FOLDERS.includes(activeFolder) || activeFolder === "spam" ? () => {
            if (selectedRecord) {
              handleArchiveMessage(selectedRecord.id);
              setSelectedRecord(null);
            }
          } : undefined}
          onNotSpam={activeFolder === "spam" ? () => {
            if (selectedRecord) {
              handleNotSpam(selectedRecord.id);
              setSelectedRecord(null);
            }
          } : undefined}
          isImportant={
            isImportantEligible ? !!importantIds[selectedRecord.id] : undefined
          }
          onToggleImportant={
            isImportantEligible
              ? () => toggleImportant(selectedRecord.id)
              : undefined
          }
          onShowInfo={handleChatShowInfo}
          onSendMessage={handleChatSend}
        />
      );
    }

    const importantEligible = IMPORTANT_ELIGIBLE_FOLDERS.includes(activeFolder);

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
        onBulkArchive={ARCHIVE_ELIGIBLE_FOLDERS.includes(activeFolder) || activeFolder === "spam" ? handleBulkArchive : undefined}
        onUnarchive={activeFolder === "archive" ? handleUnarchiveMessage : undefined}
        onBulkUnarchive={activeFolder === "archive" ? handleBulkUnarchive : undefined}
        onNotSpam={activeFolder === "spam" ? handleNotSpam : undefined}
        onBulkNotSpam={activeFolder === "spam" ? handleBulkNotSpam : undefined}
        onMoveToSpam={SPAM_ELIGIBLE_FOLDERS.includes(activeFolder) ? handleMoveToSpam : undefined}
        onBulkMoveToSpam={SPAM_ELIGIBLE_FOLDERS.includes(activeFolder) ? handleBulkMoveToSpam : undefined}
        importantIds={importantIds}
        onToggleImportant={importantEligible ? toggleImportant : undefined}
        onBulkToggleImportant={
          importantEligible
            ? (ids: string[]) =>
                toggleImportantBulk(ids, activeFolder !== "important")
            : undefined
        }
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
            inbox: inboxCount,
            starred: starredCount,
            sent: userSentMessages.length,
            draft: userDraftMessages.length,
            spam: (mockSpamRecords.length - restoredSpamIds.length) + spammedMessages.length,
            important: importantCount,
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
