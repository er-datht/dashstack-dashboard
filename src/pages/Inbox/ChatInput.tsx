import { Mic, Paperclip, Image, Send } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "../../utils/cn";

type ChatInputProps = {
  onShowToast: (message: string) => void;
};

export default function ChatInput({
  onShowToast,
}: ChatInputProps): React.JSX.Element {
  const { t } = useTranslation("inbox");

  return (
    <div className="px-5 py-4 border-t border-default">
      <div className="flex items-end gap-3">
        {/* Input area */}
        <div className="flex-1 flex items-center gap-2 bg-surface-secondary rounded-lg px-4 py-3">
          <input
            type="text"
            placeholder={t("chat.placeholder")}
            className="flex-1 bg-transparent text-sm text-primary outline-none! focus-visible:outline-none! border-none shadow-none ring-0"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                onShowToast(t("chat.comingSoon"));
              }
            }}
          />
          <div className="flex items-center gap-2">
            {([
              { Icon: Mic, label: t("chat.voiceChat", "Voice"), key: "mic" },
              { Icon: Paperclip, label: t("chat.attachment", "Attach"), key: "attach" },
              { Icon: Image, label: t("chat.image", "Image"), key: "image" },
            ] as const).map(({ Icon, label, key }) => (
              <button
                key={key}
                type="button"
                aria-label={label}
                onClick={() => onShowToast(t("chat.comingSoon"))}
                className="text-secondary hover:text-primary transition-colors cursor-pointer"
              >
                <Icon className="w-4 h-4" />
              </button>
            ))}
          </div>
        </div>

        {/* Send Button */}
        <button
          type="button"
          onClick={() => onShowToast(t("chat.comingSoon"))}
          className={cn(
            "flex items-center gap-2 px-5 py-3 rounded-lg",
            "bg-primary text-on-primary text-sm font-medium",
            "hover:opacity-90 transition-opacity duration-150",
            "cursor-pointer"
          )}
        >
          {t("chat.send")}
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
