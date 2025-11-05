import { useTranslation } from "react-i18next";
import { UsersRound } from "lucide-react";

export default function Team() {
  const { t } = useTranslation();

  return (
    <div className="p-6">
      {/* Page Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-error-light rounded-lg flex items-center justify-center">
          <UsersRound className="w-6 h-6 text-error" />
        </div>
        <h1 className="text-2xl font-bold text-primary">
          {t("navigation.team", "Team")}
        </h1>
      </div>

      {/* Content */}
      <div className="card p-6">
        <p className="text-secondary">
          {t("team.description", "Manage your team members and roles here.")}
        </p>
      </div>
    </div>
  );
}
