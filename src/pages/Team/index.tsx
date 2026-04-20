import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { UsersRound } from "lucide-react";
import { cn } from "../../utils/cn";
import { ROUTES } from "../../routes/routes";
import { mockTeamMembers } from "./teamData";
import TeamCard from "./TeamCard";

const MEMBERS_PER_PAGE = 6;

export default function Team(): React.JSX.Element {
  const { t } = useTranslation("team");
  const navigate = useNavigate();
  const [visibleCount, setVisibleCount] = useState(MEMBERS_PER_PAGE);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!toast) return;

    const timer = setTimeout(() => {
      setToast(null);
    }, 2000);

    return () => clearTimeout(timer);
  }, [toast]);

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + MEMBERS_PER_PAGE);
  };

  const visibleMembers = mockTeamMembers.slice(0, visibleCount);
  const hasMore = visibleCount < mockTeamMembers.length;

  return (
    <div className="p-6">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-error-light rounded-lg flex items-center justify-center">
            <UsersRound className="w-6 h-6 text-error" />
          </div>
          <h1 className="text-2xl font-bold text-primary">
            {t("title")}
          </h1>
        </div>
        <button
          onClick={() => navigate(ROUTES.ADD_TEAM)}
          className={cn(
            "flex items-center gap-2 px-6 py-2.5 rounded-lg",
            "bg-primary text-on-primary font-medium",
            "hover:opacity-90 transition-opacity duration-150",
            "cursor-pointer"
          )}
        >
          {t("addNewMember")}
        </button>
      </div>

      {/* Team Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {visibleMembers.map((member) => (
          <TeamCard
            key={member.id}
            member={member}
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
            {t("loadMore")}
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
