import { MoreVertical, User } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "../../utils/cn";

type ChatBubbleProps = {
  body: string;
  time: string;
  isSent: boolean;
  avatarUrl?: string;
};

export default function ChatBubble({
  body,
  time,
  isSent,
  avatarUrl,
}: ChatBubbleProps): React.JSX.Element {
  const { t } = useTranslation("inbox");
  return (
    <div
      className={cn(
        "flex gap-3 max-w-[75%]",
        isSent ? "flex-row-reverse ml-auto" : "flex-row"
      )}
    >
      {/* Avatar (received messages only) */}
      {!isSent && (
        <div className="w-10 h-10 rounded-full bg-surface-secondary flex items-center justify-center flex-shrink-0">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt=""
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <User className="w-5 h-5 text-secondary" />
          )}
        </div>
      )}

      {/* Bubble */}
      <div
        className={cn(
          "px-4 py-3 max-w-full",
          isSent
            ? "bg-primary text-on-primary rounded-tl-2xl rounded-tr-2xl rounded-bl-2xl"
            : "bg-surface-secondary text-primary rounded-tl-2xl rounded-tr-2xl rounded-br-2xl"
        )}
      >
        <p className="text-sm leading-relaxed break-words">{body}</p>
        <div
          className={cn(
            "flex items-center gap-1.5 mt-1.5",
            isSent ? "justify-end" : "justify-start"
          )}
        >
          <span
            className={cn(
              "text-xs",
              isSent ? "text-on-primary opacity-80" : "text-secondary"
            )}
          >
            {time}
          </span>
          <button
            type="button"
            aria-label={t("chat.moreOptions", "More options")}
            className="cursor-pointer"
            onClick={() => {}}
          >
            <MoreVertical
              className={cn(
                "w-3.5 h-3.5",
                isSent ? "text-on-primary opacity-80" : "text-secondary"
              )}
            />
          </button>
        </div>
      </div>
    </div>
  );
}
