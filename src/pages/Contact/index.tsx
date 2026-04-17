import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Users, Plus } from "lucide-react";
import { cn } from "../../utils/cn";
import { mockContacts } from "./contactData";
import ContactCard from "./ContactCard";

const CONTACTS_PER_PAGE = 6;

export default function Contact(): React.JSX.Element {
  const { t } = useTranslation();
  const [visibleCount, setVisibleCount] = useState(CONTACTS_PER_PAGE);
  const [toast, setToast] = useState<string | null>(null);

  // Auto-dismiss toast after 2 seconds
  useEffect(() => {
    if (!toast) return;

    const timer = setTimeout(() => {
      setToast(null);
    }, 2000);

    return () => clearTimeout(timer);
  }, [toast]);

  const handleShowComingSoon = () => {
    setToast(t("contact:comingSoon"));
  };

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + CONTACTS_PER_PAGE);
  };

  const visibleContacts = mockContacts.slice(0, visibleCount);
  const hasMore = visibleCount < mockContacts.length;

  return (
    <div className="p-6">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-warning-light rounded-lg flex items-center justify-center">
            <Users className="w-6 h-6 text-warning" />
          </div>
          <h1 className="text-2xl font-bold text-primary">
            {t("contact:title")}
          </h1>
        </div>
        <button
          onClick={handleShowComingSoon}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-lg",
            "bg-primary-600 text-white text-sm font-medium",
            "hover:bg-primary-700 transition-colors duration-150",
            "cursor-pointer"
          )}
        >
          <Plus className="w-4 h-4" />
          {t("contact:addNewContact")}
        </button>
      </div>

      {/* Contact Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {visibleContacts.map((contact) => (
          <ContactCard
            key={contact.id}
            contact={contact}
          />
        ))}
      </div>

      {/* Load More Button */}
      {hasMore && (
        <div className="flex justify-center mt-8">
          <button
            onClick={handleLoadMore}
            className={cn(
              "px-6 py-2.5 rounded-lg",
              "border border-current/20",
              "text-secondary text-sm font-medium",
              "hover:bg-surface-secondary transition-colors duration-150",
              "cursor-pointer"
            )}
          >
            {t("contact:loadMore")}
          </button>
        </div>
      )}

      {/* Toast notification */}
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] px-4 py-2 rounded-lg shadow-lg bg-usermenu-bg text-usermenu-text border border-usermenu-border text-sm">
          {toast}
        </div>
      )}
    </div>
  );
}
