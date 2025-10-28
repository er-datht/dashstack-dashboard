import { useTranslation } from "react-i18next";
import { Users } from "lucide-react";

export default function Contact() {
  const { t } = useTranslation();

  return (
    <div className="p-6">
      {/* Page Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-warning-light rounded-lg flex items-center justify-center">
          <Users className="w-6 h-6 text-warning" />
        </div>
        <h1 className="text-2xl font-bold text-primary">
          {t("navigation.contact", "Contact")}
        </h1>
      </div>

      {/* Content */}
      <div className="card p-6">
        <p className="text-secondary">
          {t(
            "contact.description",
            "Manage your contacts and customer information here."
          )}
        </p>
      </div>
    </div>
  );
}
