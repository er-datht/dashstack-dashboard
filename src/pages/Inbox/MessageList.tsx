import { useState, useEffect, useRef } from "react";
import { Search, Download, Info, Trash2, Star, ChevronLeft, ChevronRight, RotateCcw, Tag } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "../../utils/cn";
import type { EmailRecord, InboxLabel } from "./mockData";

const RECORDS_PER_PAGE = 12;

type MessageListProps = {
  records: EmailRecord[];
  labels: InboxLabel[];
  onSelect: (record: EmailRecord) => void;
  onShowToast: (message: string) => void;
  starredIds: Record<string, boolean>;
  onToggleStar: (id: string) => void;
  activeFolder: string;
  onDelete?: (id: string) => void;
  onRestore?: (id: string) => void;
  onBulkDelete?: (ids: string[]) => void;
  onAssignLabel?: (recordId: string, labelId: string) => void;
};

export default function MessageList({
  records,
  labels,
  onSelect,
  onShowToast,
  starredIds,
  onToggleStar,
  activeFolder,
  onDelete,
  onRestore,
  onBulkDelete,
  onAssignLabel,
}: MessageListProps): React.JSX.Element {
  const { t } = useTranslation("inbox");
  const [page, setPage] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const selectAllRef = useRef<HTMLInputElement>(null);
  const [openLabelDropdownId, setOpenLabelDropdownId] = useState<string | null>(
    null
  );
  const labelDropdownRef = useRef<HTMLDivElement>(null);

  // Reset pagination and selection when active folder changes
  useEffect(() => {
    setPage(0);
    setSelectedIds(new Set());
  }, [activeFolder]);

  // Click-outside and Escape to close label dropdown
  useEffect(() => {
    if (!openLabelDropdownId) return;
    const handleMouseDown = (e: MouseEvent) => {
      if (
        labelDropdownRef.current &&
        !labelDropdownRef.current.contains(e.target as Node)
      ) {
        setOpenLabelDropdownId(null);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenLabelDropdownId(null);
    };
    document.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [openLabelDropdownId]);

  // Folder filter: if "starred", show only starred records
  const folderRecords =
    activeFolder === "starred"
      ? records.filter((r) => starredIds[r.id])
      : records;

  // Search filter (scoped to folder-filtered records)
  const filteredRecords = searchQuery
    ? folderRecords.filter((r) => {
        const q = searchQuery.toLowerCase();
        return (
          r.senderName.toLowerCase().includes(q) ||
          r.subject.toLowerCase().includes(q)
        );
      })
    : folderRecords;

  const totalRecords = filteredRecords.length;
  const start = page * RECORDS_PER_PAGE;
  const end = Math.min(start + RECORDS_PER_PAGE, totalRecords);
  const visibleRecords = filteredRecords.slice(start, end);
  const hasNext = end < totalRecords;
  const hasPrev = page > 0;

  const visibleIds = visibleRecords.map((r) => r.id);
  const selectedCount = visibleIds.filter((id) => selectedIds.has(id)).length;
  const allSelected = visibleIds.length > 0 && selectedCount === visibleIds.length;
  const someSelected = selectedCount > 0 && !allSelected;

  // Sync indeterminate DOM property
  useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate = someSelected;
    }
  }, [someSelected]);

  return (
    <div className="card flex-1 flex flex-col overflow-hidden">
      {/* Top bar: Select All + Search + Actions */}
      <div className="flex items-center justify-between px-5 pt-5 pb-0">
        <div className="flex items-center gap-3">
          <input
            ref={selectAllRef}
            type="checkbox"
            checked={allSelected}
            disabled={visibleRecords.length === 0}
            onChange={() => {
              if (allSelected) {
                setSelectedIds(new Set());
              } else {
                setSelectedIds(new Set(visibleIds));
              }
            }}
            aria-label={t("list.selectAll", "Select all")}
            className="w-[18px] h-[18px] rounded-sm border-[1.2px] border-secondary/50 flex-shrink-0 accent-primary cursor-pointer disabled:cursor-default disabled:opacity-40"
          />
          <div className="relative w-[388px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(0);
              }}
              placeholder={t("list.search", "Search")}
              className="w-full h-[38px] pl-10 pr-4 rounded-full bg-surface-secondary border border-default text-sm text-primary placeholder:text-secondary outline-none! focus-visible:outline-none!"
            />
          </div>
        </div>
        <div className="flex items-center border border-default rounded-lg overflow-hidden">
          {([
            { Icon: Download, label: t("chat.download", "Download"), key: "download" },
            { Icon: Info, label: t("chat.info", "Info"), key: "info" },
            { Icon: Trash2, label: t("chat.delete", "Delete"), key: "delete" },
          ] as const).map(({ Icon, label, key }, index) => (
            <button
              key={key}
              type="button"
              aria-label={label}
              onClick={() => {
                if (key !== "delete") {
                  onShowToast(t("chat.comingSoon"));
                  return;
                }
                if (!onBulkDelete) {
                  onShowToast(t("chat.comingSoon"));
                  return;
                }
                if (selectedIds.size === 0) {
                  onShowToast(t("list.noSelection"));
                  return;
                }
                onBulkDelete([...selectedIds]);
                setSelectedIds(new Set());
              }}
              className={cn(
                "p-2 text-secondary hover:text-primary hover:bg-surface-secondary",
                "transition-colors cursor-pointer",
                index < 2 && "border-r border-default"
              )}
            >
              <Icon className="w-4 h-4" />
            </button>
          ))}
        </div>
      </div>

      {/* Email Records */}
      <div className="flex-1 overflow-y-auto mt-4">
        {visibleRecords.map((record) => {
          const label = labels.find((l) => l.id === record.labelId);
          return (
            <button
              key={record.id}
              type="button"
              onClick={() => onSelect(record)}
              className="w-full flex items-center gap-[60px] px-5 py-[20.5px] border-b border-default hover:bg-surface-secondary transition-colors cursor-pointer text-left"
            >
              {/* Sender Info */}
              <div className="flex-1 flex flex-wrap items-center gap-x-[60px] gap-y-5 min-w-0">
                {/* Sender Details: checkbox + star + name */}
                <div className="flex items-center gap-2.5 w-[168px] flex-shrink-0">
                  {/* Checkbox */}
                  <input
                    type="checkbox"
                    checked={selectedIds.has(record.id)}
                    onChange={() => {
                      setSelectedIds((prev) => {
                        const next = new Set(prev);
                        if (next.has(record.id)) {
                          next.delete(record.id);
                        } else {
                          next.add(record.id);
                        }
                        return next;
                      });
                    }}
                    aria-label={t("list.selectMessage", "Select message")}
                    className="w-[18px] h-[18px] rounded-sm border-[1.2px] border-secondary/50 flex-shrink-0 accent-primary cursor-pointer"
                    onClick={(e) => e.stopPropagation()}
                  />
                  {/* Star */}
                  <button
                    type="button"
                    aria-label={t("list.star", "Star")}
                    className={cn(
                      "flex-shrink-0 transition-colors cursor-pointer",
                      starredIds[record.id]
                        ? "text-warning"
                        : "text-secondary hover:text-primary"
                    )}
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleStar(record.id);
                    }}
                  >
                    <Star
                      className="w-[15px] h-[15px]"
                      fill={starredIds[record.id] ? "currentColor" : "none"}
                    />
                  </button>
                  {/* Sender name */}
                  <span className="flex-1 text-sm font-medium text-primary truncate min-w-0">
                    {record.senderName}
                  </span>
                </div>

                {/* Message Info: label + subject */}
                <div className="flex-1 flex items-center gap-2.5 min-w-0">
                  {label ? (
                    <span
                      className="px-1 py-0.5 rounded-sm text-xs font-medium flex-shrink-0 w-16 text-center"
                      style={{
                        backgroundColor: `${label.color}20`,
                        color: label.color,
                      }}
                    >
                      {t(label.nameKey)}
                    </span>
                  ) : onAssignLabel ? (
                    <div
                      className="relative flex-shrink-0"
                      ref={
                        openLabelDropdownId === record.id
                          ? labelDropdownRef
                          : undefined
                      }
                    >
                      <button
                        type="button"
                        aria-label={t("list.addLabel")}
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenLabelDropdownId((prev) =>
                            prev === record.id ? null : record.id
                          );
                        }}
                        className="p-1 text-secondary hover:text-primary hover:bg-surface-secondary rounded-md transition-colors cursor-pointer"
                      >
                        <Tag className="w-4 h-4" />
                      </button>

                      {openLabelDropdownId === record.id && (
                        <div className="absolute top-full left-0 mt-1 w-40 py-1 rounded-lg shadow-lg bg-usermenu-bg border border-usermenu-border z-50 animate-usermenu-enter">
                          {labels.map((labelOption) => (
                            <button
                              key={labelOption.id}
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onAssignLabel(record.id, labelOption.id);
                                setOpenLabelDropdownId(null);
                              }}
                              className="flex items-center gap-2.5 w-full px-3 py-2 text-sm text-left hover:bg-usermenu-hover transition-colors cursor-pointer text-usermenu-text"
                            >
                              <div
                                className="w-3 h-3 rounded-sm flex-shrink-0"
                                style={{
                                  border: `1.2px solid ${labelOption.color}`,
                                  backgroundColor: "transparent",
                                }}
                              />
                              {t(labelOption.nameKey)}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : null}
                  <span className="text-sm text-primary truncate min-w-0">
                    {record.subject}
                  </span>
                </div>
              </div>

              {/* Delete button — parent controls which handler (or undefined) via onDelete */}
              {activeFolder !== "bin" && onDelete && (
                <button
                  type="button"
                  aria-label={t("chat.delete")}
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(record.id);
                  }}
                  className="flex-shrink-0 p-1.5 text-secondary hover:text-[var(--color-danger)] hover:bg-surface-secondary rounded-md transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}

              {/* Restore button for bin folder */}
              {activeFolder === "bin" && onRestore && (
                <button
                  type="button"
                  aria-label={t("list.restore")}
                  onClick={(e) => {
                    e.stopPropagation();
                    onRestore(record.id);
                  }}
                  className="flex-shrink-0 p-1.5 text-secondary hover:text-[var(--color-success)] hover:bg-surface-secondary rounded-md transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              )}

              {/* Time */}
              <span className="text-sm text-primary flex-shrink-0 whitespace-nowrap">
                {record.time}
              </span>
            </button>
          );
        })}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-5 py-3">
        <span className="text-sm font-bold text-primary opacity-60">
          {t("list.showing", { start: start + 1, end, total: totalRecords, defaultValue: `Showing ${start + 1}-${end} of ${totalRecords}` })}
        </span>
        <div className="flex items-center border border-default rounded-lg overflow-hidden h-[30px]">
          <button
            type="button"
            disabled={!hasPrev}
            onClick={() => { setPage((p) => p - 1); setSelectedIds(new Set()); }}
            className={cn(
              "px-2.5 h-full border-r border-default transition-colors",
              hasPrev
                ? "text-secondary hover:bg-surface-secondary cursor-pointer"
                : "text-secondary/30 cursor-default"
            )}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            type="button"
            disabled={!hasNext}
            onClick={() => { setPage((p) => p + 1); setSelectedIds(new Set()); }}
            className={cn(
              "px-2.5 h-full transition-colors",
              hasNext
                ? "text-secondary hover:bg-surface-secondary cursor-pointer"
                : "text-secondary/30 cursor-default"
            )}
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
