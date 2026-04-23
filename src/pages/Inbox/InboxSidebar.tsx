import { useTranslation } from "react-i18next";
import { cn } from "../../utils/cn";
import { inboxFolders, inboxLabels } from "./mockData";
import FolderItem from "./FolderItem";
import LabelItem from "./LabelItem";

type InboxSidebarProps = {
  activeFolder: string;
  onFolderChange: (folderId: string) => void;
  onShowToast: (message: string) => void;
  onCompose: () => void;
  folderCountOverrides?: Partial<Record<string, number>>;
};

export default function InboxSidebar({
  activeFolder,
  onFolderChange,
  onShowToast,
  onCompose,
  folderCountOverrides,
}: InboxSidebarProps): React.JSX.Element {
  const { t } = useTranslation("inbox");

  return (
    <div className="card w-72 flex-shrink-0 p-4 flex flex-col overflow-y-auto">
      {/* Compose Button */}
      <button
        type="button"
        onClick={onCompose}
        className={cn(
          "w-full py-2.5 rounded-lg",
          "bg-primary text-on-primary font-medium text-sm",
          "hover:opacity-90 transition-opacity duration-150",
          "cursor-pointer"
        )}
      >
        {t("composeBtn")}
      </button>

      {/* My Email Section */}
      <div className="mt-6">
        <h3 className="text-xs font-semibold text-secondary uppercase tracking-wider px-3 mb-2">
          {t("myEmail")}
        </h3>
        <div className="flex flex-col gap-0.5">
          {inboxFolders.map((folder) => (
            <FolderItem
              key={folder.id}
              icon={folder.icon}
              nameKey={folder.nameKey}
              count={folderCountOverrides?.[folder.id] ?? folder.count}
              isActive={activeFolder === folder.id}
              onClick={() => onFolderChange(folder.id)}
            />
          ))}
        </div>
      </div>

      {/* Label Section */}
      <div className="mt-6">
        <h3 className="text-xs font-semibold text-secondary uppercase tracking-wider px-3 mb-2">
          {t("labels.title")}
        </h3>
        <div className="flex flex-col">
          {inboxLabels.map((label) => (
            <LabelItem
              key={label.id}
              nameKey={label.nameKey}
              color={label.color}
            />
          ))}
        </div>

        {/* Create New Label */}
        <button
          type="button"
          onClick={() => onShowToast(t("chat.comingSoon"))}
          className={cn(
            "w-full text-left px-3 py-2 text-sm text-secondary",
            "hover:text-primary transition-colors duration-150",
            "cursor-pointer"
          )}
        >
          {t("labels.createNew")}
        </button>
      </div>
    </div>
  );
}
