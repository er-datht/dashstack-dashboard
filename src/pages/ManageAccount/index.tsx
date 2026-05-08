import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Camera, Loader2, X } from "lucide-react";
import { cn } from "../../utils/cn";
import { getStoredUser, updateStoredUser } from "../../services/auth";

const MAX_AVATAR_SIZE = 2 * 1024 * 1024; // 2 MB
const ALLOWED_AVATAR_TYPES = [
  "image/png",
  "image/jpeg",
  "image/gif",
  "image/svg+xml",
  "image/webp",
];

const DISPLAY_NAME_MAX = 60;
const BIO_MAX = 200;

type AvatarError = "tooLarge" | "wrongType" | null;

type ToastVariant = "success" | "error";

type Toast = {
  text: string;
  variant: ToastVariant;
};

export default function ManageAccount(): React.JSX.Element {
  const { t, i18n } = useTranslation("manageAccount");

  // Snapshot the stored user once on mount (read-only fields stay constant).
  const [initialUser] = useState(() => getStoredUser());

  const [displayName, setDisplayName] = useState(() => initialUser?.name ?? "");
  const [phone, setPhone] = useState(() => initialUser?.phone ?? "");
  const [bio, setBio] = useState(() => initialUser?.bio ?? "");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(
    () => initialUser?.avatar ?? null
  );

  const [displayNameError, setDisplayNameError] = useState<
    "required" | "tooLong" | null
  >(null);
  const [bioError, setBioError] = useState<"tooLong" | null>(null);
  const [avatarError, setAvatarError] = useState<AvatarError>(null);

  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, []);

  const showToast = (text: string, variant: ToastVariant) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ text, variant });
    toastTimerRef.current = setTimeout(() => setToast(null), 3000);
  };

  // -- Avatar handlers ----------------------------------------------------

  const applyAvatarFile = (file: File) => {
    if (!ALLOWED_AVATAR_TYPES.includes(file.type)) {
      setAvatarError("wrongType");
      return;
    }
    if (file.size > MAX_AVATAR_SIZE) {
      setAvatarError("tooLarge");
      return;
    }
    const reader = new FileReader();
    reader.onload = (evt) => {
      const result = (evt.target as FileReader | null)?.result;
      if (typeof result === "string") {
        setAvatarPreview(result);
        setAvatarError(null);
      }
    };
    reader.onerror = () => setAvatarError("wrongType");
    reader.readAsDataURL(file);
  };

  const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) applyAvatarFile(file);
    // Clear the input value so re-selecting the same file fires `change` again.
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemovePhoto = () => {
    setAvatarPreview(null);
    setAvatarError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) applyAvatarFile(file);
  };

  const handleDropzoneKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleUploadClick();
    }
  };

  // -- Validation ---------------------------------------------------------

  const validate = (): boolean => {
    const trimmedName = displayName.trim();
    let nameError: "required" | "tooLong" | null = null;
    if (!trimmedName) nameError = "required";
    else if (trimmedName.length > DISPLAY_NAME_MAX) nameError = "tooLong";
    setDisplayNameError(nameError);

    const bioOver = bio.trim().length > BIO_MAX;
    setBioError(bioOver ? "tooLong" : null);

    return !nameError && !bioOver;
  };

  // -- Save ---------------------------------------------------------------

  const handleSave = () => {
    if (!validate()) return;

    setIsSaving(true);
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      const patch = {
        name: displayName.trim(),
        phone: phone || undefined,
        bio: bio || undefined,
        avatar: avatarPreview ?? undefined,
      };
      const ok = updateStoredUser(patch);
      setIsSaving(false);
      showToast(t(ok ? "saveSuccess" : "saveError"), ok ? "success" : "error");
    }, 800);
  };

  // -- Derived ------------------------------------------------------------

  const bioCount = bio.length;
  const bioOverCap = bioCount > BIO_MAX;

  const memberSinceDate =
    initialUser?.createdAt && new Date(initialUser.createdAt);
  // i18n.language uses "jp" (the project's locale code), not the BCP47 "ja".
  const dateLocale = i18n.language === "jp" ? "ja" : i18n.language;
  const memberSinceText =
    memberSinceDate && !Number.isNaN(memberSinceDate.getTime())
      ? new Intl.DateTimeFormat(dateLocale).format(memberSinceDate)
      : null;

  const inputBaseClasses =
    "bg-surface-muted border border-default rounded text-primary p-2.5 w-full outline-none";
  const inputErrorClasses = "border-[var(--color-error-500)]";

  return (
    <div className="bg-page min-h-full p-6 relative">
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className={cn(
            "fixed top-6 right-6 z-50 px-4 py-3 rounded-lg shadow-lg text-on-primary",
            toast.variant === "success"
              ? "bg-[var(--color-success-500)]"
              : "bg-[var(--color-error-500)]"
          )}
        >
          {toast.text}
        </div>
      )}

      <h1 className="text-primary font-bold text-[32px] mb-6">{t("title")}</h1>

      <div className="card p-8">
        {/* Avatar uploader */}
        <div className="flex flex-col items-center mb-8">
          <div
            className={cn(
              "w-24 h-24 rounded-full flex items-center justify-center overflow-hidden cursor-pointer transition-colors",
              isDragging
                ? "bg-surface-muted border-2 border-solid border-primary"
                : "bg-surface-muted border-2 border-dashed border-default"
            )}
            onClick={handleUploadClick}
            onDragOver={handleDragOver}
            onDragEnter={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            role="button"
            tabIndex={0}
            aria-label={t("uploadAvatarAria")}
            onKeyDown={handleDropzoneKeyDown}
          >
            {avatarPreview ? (
              <img
                src={avatarPreview}
                alt={displayName || ""}
                className="w-full h-full object-cover"
              />
            ) : (
              <Camera className="w-8 h-8 text-secondary" />
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarSelect}
          />

          {avatarPreview ? (
            <button
              type="button"
              onClick={handleRemovePhoto}
              className="mt-2 text-brand-primary font-bold text-sm flex items-center gap-1"
            >
              <X className="w-4 h-4" />
              {t("removePhoto")}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleUploadClick}
              className="mt-2 text-brand-primary font-bold text-sm"
            >
              {t("uploadPhoto")}
            </button>
          )}

          {avatarError && (
            <p className="text-error text-sm mt-2">
              {t(avatarError === "tooLarge" ? "fileTooLarge" : "fileWrongType")}
            </p>
          )}
        </div>

        {/* Form fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Display Name (required) */}
          <div>
            <label
              htmlFor="displayName"
              className="text-primary font-bold text-base block mb-1.5"
            >
              {t("displayName")} <span className="text-error">*</span>
            </label>
            <input
              id="displayName"
              type="text"
              value={displayName}
              placeholder={t("displayNamePlaceholder")}
              onChange={(e) => {
                setDisplayName(e.target.value);
                if (displayNameError) setDisplayNameError(null);
              }}
              className={cn(inputBaseClasses, {
                [inputErrorClasses]: !!displayNameError,
              })}
              aria-invalid={displayNameError ? "true" : undefined}
              aria-describedby={
                displayNameError ? "displayName-error" : undefined
              }
            />
            {displayNameError && (
              <p id="displayName-error" className="text-error text-sm mt-1">
                {t(
                  displayNameError === "required"
                    ? "fieldRequired"
                    : "displayNameTooLong"
                )}
              </p>
            )}
          </div>

          {/* Email (read-only) */}
          <div>
            <label
              htmlFor="email"
              className="text-primary font-bold text-base block mb-1.5"
            >
              {t("email")}
            </label>
            <input
              id="email"
              type="email"
              value={initialUser?.email ?? ""}
              readOnly
              className={cn(
                inputBaseClasses,
                "bg-surface-muted text-secondary cursor-not-allowed"
              )}
            />
          </div>

          {/* Phone (optional) */}
          <div>
            <label
              htmlFor="phone"
              className="text-primary font-bold text-base block mb-1.5"
            >
              {t("phone")}
            </label>
            <input
              id="phone"
              type="text"
              value={phone}
              placeholder={t("phonePlaceholder")}
              onChange={(e) => setPhone(e.target.value)}
              className={inputBaseClasses}
            />
          </div>

          {/* Role (read-only) */}
          <div>
            <label
              htmlFor="role"
              className="text-primary font-bold text-base block mb-1.5"
            >
              {t("role")}
            </label>
            <input
              id="role"
              type="text"
              value={initialUser?.role ?? ""}
              readOnly
              className={cn(
                inputBaseClasses,
                "bg-surface-muted text-secondary cursor-not-allowed capitalize"
              )}
            />
          </div>

          {/* Bio (full-width row) */}
          <div className="md:col-span-2">
            <label
              htmlFor="bio"
              className="text-primary font-bold text-base block mb-1.5"
            >
              {t("bio")}
            </label>
            <textarea
              id="bio"
              value={bio}
              placeholder={t("bioPlaceholder")}
              onChange={(e) => {
                setBio(e.target.value);
                if (e.target.value.length > BIO_MAX) {
                  setBioError("tooLong");
                } else if (bioError) {
                  setBioError(null);
                }
              }}
              rows={3}
              className={cn(inputBaseClasses, "min-h-[96px] resize-none", {
                [inputErrorClasses]: bioOverCap,
              })}
              aria-invalid={bioOverCap ? "true" : undefined}
              aria-describedby={
                bioOverCap ? "bio-error bio-counter" : "bio-counter"
              }
            />
            <div className="flex items-center justify-between mt-1">
              <span
                id="bio-counter"
                className={cn(
                  "text-sm",
                  bioOverCap ? "text-error" : "text-secondary"
                )}
              >
                {`${bioCount} / ${BIO_MAX}`}
              </span>
              {bioOverCap && (
                <p id="bio-error" className="text-error text-sm">
                  {t("bioTooLong")}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Member since */}
        {memberSinceText && (
          <p className="text-secondary text-sm mt-6 text-center">
            {t("memberSince", { date: memberSinceText })}
          </p>
        )}

        {/* Save button */}
        <div className="flex justify-center mt-8">
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className={cn(
              "bg-primary text-on-primary hover-bg-primary-dark rounded-lg font-bold text-xl px-10 py-3 transition-colors",
              "disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
            )}
          >
            {isSaving && <Loader2 className="w-5 h-5 animate-spin" />}
            {t("saveChanges")}
          </button>
        </div>
      </div>
    </div>
  );
}
