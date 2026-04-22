import { useTranslation } from "react-i18next";
import type { LucideIcon } from "lucide-react";
import { cn } from "../../utils/cn";

type FolderItemProps = {
  icon: LucideIcon;
  nameKey: string;
  count: number;
  isActive: boolean;
  onClick: () => void;
};

export default function FolderItem({
  icon: Icon,
  nameKey,
  count,
  isActive,
  onClick,
}: FolderItemProps): React.JSX.Element {
  const { t } = useTranslation("inbox");

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-center justify-between w-full px-3 py-2.5 rounded-lg",
        "transition-colors duration-150 cursor-pointer",
        isActive
          ? "bg-brand-light text-brand-primary"
          : "bg-surface-primary text-primary hover:bg-surface-secondary"
      )}
    >
      <div className="flex items-center gap-3">
        <Icon className="w-[18px] h-[18px]" />
        <span className="text-sm font-medium">{t(nameKey)}</span>
      </div>
      <span
        className={cn(
          "text-xs font-bold",
          isActive ? "opacity-80 text-brand-primary" : "opacity-60"
        )}
      >
        {count.toLocaleString()}
      </span>
    </button>
  );
}
