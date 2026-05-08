import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Filter, ChevronDown } from "lucide-react";
import classnames from "classnames";
import type { FilterValue } from "../types";

type FilterByDropdownProps = {
  value: FilterValue;
  onChange: (next: FilterValue) => void;
};

const OPTIONS: FilterValue[] = [
  "all",
  "basic",
  "cellContent",
  "statesAndInteraction",
];

export default function FilterByDropdown({
  value,
  onChange,
}: FilterByDropdownProps): React.JSX.Element {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (next: FilterValue) => {
    onChange(next);
    setIsOpen(false);
  };

  return (
    <div className="flex items-center gap-3">
      <Filter className="w-4 h-4 text-secondary" />
      <span className="text-sm font-medium text-secondary">
        {t("tables:filterBy.label")}
      </span>
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          onBlur={() => setTimeout(() => setIsOpen(false), 200)}
          className={classnames(
            "flex items-center gap-2 px-3 py-2",
            "border border-default rounded-md",
            "text-sm text-primary hover-bg-muted",
            "transition-colors",
          )}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
        >
          <span>{t(`tables:filterBy.${value}`)}</span>
          <ChevronDown
            className={classnames("w-4 h-4 transition-transform", {
              "rotate-180": isOpen,
            })}
          />
        </button>

        {isOpen && (
          <div
            role="listbox"
            className={classnames(
              "absolute top-full right-0 mt-2 min-w-[180px]",
              "border border-default rounded-lg shadow-lg",
              "overflow-hidden z-10",
            )}
            style={{ background: "var(--color-surface)" }}
          >
            {OPTIONS.map((option) => {
              const isActive = option === value;
              return (
                <button
                  key={option}
                  type="button"
                  role="option"
                  aria-selected={isActive}
                  onClick={() => handleSelect(option)}
                  className={classnames(
                    "block w-full text-left px-4 py-2 text-sm",
                    "transition-colors",
                    isActive
                      ? "bg-sidebar-menu-active text-sidebar-menu-active font-medium"
                      : "text-primary hover-bg-muted",
                  )}
                >
                  {t(`tables:filterBy.${option}`)}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
