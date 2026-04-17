import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Mail, User } from "lucide-react";
import { cn } from "../../utils/cn";
import { ROUTES } from "../../routes/routes";
import type { Contact } from "../../types/contact";

type ContactCardProps = {
  contact: Contact;
};

export default function ContactCard({
  contact,
}: ContactCardProps): React.JSX.Element {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [imgError, setImgError] = useState(false);

  const showFallback = !contact.avatar || imgError;

  return (
    <div
      className={cn(
        "card rounded-xl overflow-hidden",
        "shadow-sm hover:shadow-md transition-shadow duration-200",
        "flex flex-col"
      )}
    >
      {/* Avatar area - approximately 60% height */}
      <div className="relative w-full aspect-[4/3] bg-surface-secondary flex items-center justify-center overflow-hidden">
        {showFallback ? (
          <div className="flex items-center justify-center w-full h-full bg-surface-secondary">
            <User className="w-16 h-16 text-secondary" />
          </div>
        ) : (
          <img
            src={contact.avatar}
            alt={contact.name}
            className="w-full h-full object-cover"
            onError={() => setImgError(true)}
          />
        )}
      </div>

      {/* Contact info */}
      <div className="p-4 flex flex-col items-center gap-2">
        <p
          className={cn("text-primary font-bold text-base truncate w-full text-center")}
          title={contact.name}
        >
          {contact.name}
        </p>
        <p
          className={cn("text-secondary text-sm truncate w-full text-center")}
          title={contact.email}
        >
          {contact.email}
        </p>

        {/* Message button */}
        <button
          onClick={() => navigate(ROUTES.INBOX)}
          className={cn(
            "mt-2 flex items-center justify-center gap-2 w-full",
            "px-4 py-2 rounded-lg",
            "border border-current/20",
            "text-primary text-sm font-medium",
            "hover:bg-surface-secondary transition-colors duration-150",
            "cursor-pointer"
          )}
        >
          <Mail className="w-4 h-4" />
          {t("contact:message")}
        </button>
      </div>
    </div>
  );
}
