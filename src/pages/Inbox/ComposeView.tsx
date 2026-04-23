import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { X } from "lucide-react";
import { cn } from "../../utils/cn";

type ComposeViewProps = {
  onClose: () => void;
  onSend: (message: {
    recipientEmail: string;
    subject: string;
    body: string;
  }) => void;
  initialData?: {
    recipientEmail: string;
    subject: string;
    body: string;
  } | null;
  editingDraftId?: string | null;
  onSaveDraft?: (
    data: { recipientEmail: string; subject: string; body: string },
    draftId?: string | null
  ) => void;
  onShowToast?: (message: string) => void;
};

type FieldErrors = {
  recipientEmail: boolean;
  subject: boolean;
  body: boolean;
};

export default function ComposeView({
  onClose,
  onSend,
  initialData,
  editingDraftId,
  onSaveDraft,
  onShowToast,
}: ComposeViewProps): React.JSX.Element {
  const { t } = useTranslation("inbox");

  const [recipientEmail, setRecipientEmail] = useState(
    initialData?.recipientEmail ?? ""
  );
  const [subject, setSubject] = useState(initialData?.subject ?? "");
  const [body, setBody] = useState(initialData?.body ?? "");
  const [errors, setErrors] = useState<FieldErrors>({
    recipientEmail: false,
    subject: false,
    body: false,
  });
  const [autoSaveStatus, setAutoSaveStatus] = useState<
    "idle" | "saving" | "saved"
  >("idle");
  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auto-save draft with 3-second debounce
  useEffect(() => {
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    if (!onSaveDraft) return;
    if (!recipientEmail.trim() && !subject.trim() && !body.trim()) return;

    autoSaveTimerRef.current = setTimeout(() => {
      setAutoSaveStatus("saving");
      onSaveDraft(
        {
          recipientEmail: recipientEmail.trim(),
          subject: subject.trim(),
          body: body.trim(),
        },
        editingDraftId
      );
      setTimeout(() => {
        setAutoSaveStatus("saved");
        setTimeout(() => setAutoSaveStatus("idle"), 2000);
      }, 300);
    }, 3000);

    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [recipientEmail, subject, body, onSaveDraft, editingDraftId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: FieldErrors = {
      recipientEmail: recipientEmail.trim() === "",
      subject: subject.trim() === "",
      body: body.trim() === "",
    };

    setErrors(newErrors);

    if (newErrors.recipientEmail || newErrors.subject || newErrors.body) {
      return;
    }

    onSend({
      recipientEmail: recipientEmail.trim(),
      subject: subject.trim(),
      body: body.trim(),
    });
  };

  return (
    <form
      className="card flex-1 flex flex-col overflow-hidden"
      onSubmit={handleSubmit}
      noValidate
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-default">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-primary">
            {editingDraftId
              ? t("compose.editDraft")
              : t("compose.newMessage")}
          </h2>
          {autoSaveStatus !== "idle" && (
            <span className="text-xs text-secondary">
              {autoSaveStatus === "saving"
                ? t("compose.saving")
                : t("compose.draftSaved")}
            </span>
          )}
        </div>
        <button
          type="button"
          aria-label={t("compose.close")}
          onClick={onClose}
          className="p-1 text-secondary hover:text-primary transition-colors cursor-pointer rounded-md hover:bg-surface-secondary"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Form Fields */}
      <div className="flex-1 flex flex-col px-5 py-4 gap-4 overflow-y-auto">
        {/* To Field */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="compose-to"
            className="text-sm font-medium text-primary"
          >
            {t("compose.to")}
          </label>
          <input
            id="compose-to"
            type="email"
            value={recipientEmail}
            onChange={(e) => {
              setRecipientEmail(e.target.value);
              if (errors.recipientEmail) {
                setErrors((prev) => ({ ...prev, recipientEmail: false }));
              }
            }}
            placeholder={t("compose.toPlaceholder")}
            aria-invalid={errors.recipientEmail}
            className={cn(
              "w-full h-10 px-3 rounded-lg text-sm text-primary bg-surface placeholder:text-secondary outline-none",
              errors.recipientEmail
                ? "border border-[var(--color-danger)]"
                : "border border-default"
            )}
          />
        </div>

        {/* Subject Field */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="compose-subject"
            className="text-sm font-medium text-primary"
          >
            {t("compose.subject")}
          </label>
          <input
            id="compose-subject"
            type="text"
            value={subject}
            onChange={(e) => {
              setSubject(e.target.value);
              if (errors.subject) {
                setErrors((prev) => ({ ...prev, subject: false }));
              }
            }}
            placeholder={t("compose.subjectPlaceholder")}
            aria-invalid={errors.subject}
            className={cn(
              "w-full h-10 px-3 rounded-lg text-sm text-primary bg-surface placeholder:text-secondary outline-none",
              errors.subject
                ? "border border-[var(--color-danger)]"
                : "border border-default"
            )}
          />
        </div>

        {/* Body Field */}
        <div className="flex flex-col gap-1.5 flex-1">
          <label
            htmlFor="compose-body"
            className="text-sm font-medium text-primary"
          >
            {t("compose.body")}
          </label>
          <textarea
            id="compose-body"
            value={body}
            onChange={(e) => {
              setBody(e.target.value);
              if (errors.body) {
                setErrors((prev) => ({ ...prev, body: false }));
              }
            }}
            placeholder={t("compose.bodyPlaceholder")}
            aria-invalid={errors.body}
            className={cn(
              "w-full flex-1 min-h-[200px] px-3 py-2.5 rounded-lg text-sm text-primary bg-surface placeholder:text-secondary outline-none resize-none",
              errors.body
                ? "border border-[var(--color-danger)]"
                : "border border-default"
            )}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-default">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 rounded-lg text-sm font-medium text-primary bg-surface border border-default hover:bg-surface-secondary transition-colors cursor-pointer"
        >
          {t("compose.cancel")}
        </button>
        {onSaveDraft && (
          <button
            type="button"
            onClick={() => {
              onSaveDraft(
                {
                  recipientEmail: recipientEmail.trim(),
                  subject: subject.trim(),
                  body: body.trim(),
                },
                editingDraftId
              );
              onShowToast?.(t("compose.draftSaved"));
            }}
            className="px-4 py-2 rounded-lg text-sm font-medium text-primary bg-surface border border-default hover:bg-surface-secondary transition-colors cursor-pointer"
          >
            {t("compose.saveAsDraft")}
          </button>
        )}
        <button
          type="submit"
          className="px-4 py-2 rounded-lg text-sm font-medium bg-primary text-on-primary hover:opacity-90 transition-opacity cursor-pointer"
        >
          {t("compose.send")}
        </button>
      </div>
    </form>
  );
}
