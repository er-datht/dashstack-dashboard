import { useTranslation } from "react-i18next";
import { Inbox as InboxIcon } from "lucide-react";

export default function Inbox() {
  const { t } = useTranslation();

  return (
    <div className="p-6">
      {/* Page Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-brand-light rounded-lg flex items-center justify-center">
          <InboxIcon className="w-6 h-6 icon-brand" />
        </div>
        <h1 className="text-2xl font-bold text-primary">
          {t("navigation.inbox", "Inbox")}
        </h1>
      </div>

      {/* Content */}
      <div className="card p-6">
        <p className="text-secondary">
          {t(
            "inbox.description",
            "Your messages and notifications will appear here."
          )}
        </p>
      </div>
    </div>
  );
}
