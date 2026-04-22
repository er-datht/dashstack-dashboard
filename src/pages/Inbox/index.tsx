import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  mockMessages,
  mockEmailRecords,
  inboxLabels,
} from "./mockData";
import type { EmailRecord } from "./mockData";
import InboxSidebar from "./InboxSidebar";
import ChatView from "./ChatView";
import MessageList from "./MessageList";

export default function Inbox(): React.JSX.Element {
  const { t } = useTranslation("inbox");
  const [activeFolder, setActiveFolder] = useState("inbox");
  const [activeLabel, setActiveLabel] = useState("primary");
  const [selectedRecord, setSelectedRecord] = useState<EmailRecord | null>(
    null
  );
  const [toast, setToast] = useState<string | null>(null);

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
          folderCountOverrides={{ starred: starredCount }}
        />

        {selectedRecord ? (
          <ChatView
            messages={mockMessages}
            contactName={selectedRecord.senderName}
            activeLabel={activeLabel}
            labels={inboxLabels}
            onLabelChange={setActiveLabel}
            onShowToast={setToast}
            onBack={() => setSelectedRecord(null)}
          />
        ) : (
          <MessageList
            records={mockEmailRecords}
            labels={inboxLabels}
            onSelect={handleSelectRecord}
            onShowToast={setToast}
            starredIds={starredIds}
            onToggleStar={toggleStar}
            activeFolder={activeFolder}
          />
        )}
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
