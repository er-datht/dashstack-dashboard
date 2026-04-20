import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Camera, X, Loader2 } from "lucide-react";
import { cn } from "../../utils/cn";

const MAX_LOGO_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_IMAGE_TYPES = [
  "image/png",
  "image/jpeg",
  "image/gif",
  "image/svg+xml",
  "image/webp",
];

type FormErrors = {
  siteName?: boolean;
  copyright?: boolean;
  seoTitle?: boolean;
  seoKeywords?: boolean;
};

export default function Settings(): React.JSX.Element {
  const { t } = useTranslation("settings");

  const [siteName, setSiteName] = useState("");
  const [copyright, setCopyright] = useState("");
  const [seoTitle, setSeoTitle] = useState("");
  const [seoKeywords, setSeoKeywords] = useState("");
  const [seoDescription, setSeoDescription] = useState("");
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  const revokeLogoUrl = (url: string | null) => {
    if (url) URL.revokeObjectURL(url);
  };

  const isValidImageFile = (file: File): boolean => {
    return ALLOWED_IMAGE_TYPES.includes(file.type) && file.size <= MAX_LOGO_SIZE;
  };

  const showToast = (message: string) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToastMessage(message);
    toastTimerRef.current = setTimeout(() => {
      setToastMessage("");
    }, 3000);
  };

  const applyLogoFile = (file: File) => {
    if (!isValidImageFile(file)) return;
    revokeLogoUrl(logoPreview);
    setLogoPreview(URL.createObjectURL(file));
    showToast(t("logoUploaded"));
  };

  const handleLogoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) applyLogoFile(file);
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
    if (file) applyLogoFile(file);
  };

  const handleRemoveLogo = () => {
    revokeLogoUrl(logoPreview);
    setLogoPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (!siteName.trim()) newErrors.siteName = true;
    if (!copyright.trim()) newErrors.copyright = true;
    if (!seoTitle.trim()) newErrors.seoTitle = true;
    if (!seoKeywords.trim()) newErrors.seoKeywords = true;
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;

    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      showToast(t("settingsSaved"));
    }, 500);
  };

  const inputBaseClasses =
    "bg-surface-muted border border-default rounded text-primary p-2.5 w-full outline-none";
  const inputErrorClasses = "border-[var(--color-error-500)]";

  return (
    <div className="bg-page min-h-full p-6 relative">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-[var(--color-success-500)] text-on-primary px-4 py-3 rounded-lg shadow-lg">
          {toastMessage}
        </div>
      )}

      {/* Page heading */}
      <h1 className="text-primary font-bold text-[32px] mb-6">
        {t("generalSettings")}
      </h1>

      {/* Card */}
      <div className="card p-8">
        {/* Logo upload area */}
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
            aria-label={t("uploadLogo")}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleUploadClick();
              }
            }}
          >
            {logoPreview ? (
              <img
                src={logoPreview}
                alt={t("logoPreview")}
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
            onChange={handleLogoSelect}
          />

          {logoPreview ? (
            <button
              type="button"
              onClick={handleRemoveLogo}
              className="mt-2 text-brand-primary font-bold text-sm flex items-center gap-1"
              aria-label={t("removeLogo")}
            >
              <X className="w-4 h-4" />
              {t("removeLogo")}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleUploadClick}
              className="mt-2 text-brand-primary font-bold text-sm"
            >
              {t("uploadLogo")}
            </button>
          )}
        </div>

        {/* Form fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Row 1: Site Name | Copyright */}
          <div>
            <label
              htmlFor="siteName"
              className="text-primary font-bold text-base block mb-1.5"
            >
              {t("siteName")} <span className="text-error">*</span>
            </label>
            <input
              id="siteName"
              type="text"
              value={siteName}
              placeholder={t("siteNamePlaceholder")}
              onChange={(e) => {
                setSiteName(e.target.value);
                if (errors.siteName) {
                  setErrors((prev) => ({ ...prev, siteName: false }));
                }
              }}
              className={cn(inputBaseClasses, {
                [inputErrorClasses]: errors.siteName,
              })}
              aria-invalid={errors.siteName ? "true" : undefined}
              aria-describedby={errors.siteName ? "siteName-error" : undefined}
            />
            {errors.siteName && (
              <p id="siteName-error" className="text-error text-sm mt-1">
                {t("fieldRequired")}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="copyright"
              className="text-primary font-bold text-base block mb-1.5"
            >
              {t("copyright")} <span className="text-error">*</span>
            </label>
            <input
              id="copyright"
              type="text"
              value={copyright}
              placeholder={t("copyrightPlaceholder")}
              onChange={(e) => {
                setCopyright(e.target.value);
                if (errors.copyright) {
                  setErrors((prev) => ({ ...prev, copyright: false }));
                }
              }}
              className={cn(inputBaseClasses, {
                [inputErrorClasses]: errors.copyright,
              })}
              aria-invalid={errors.copyright ? "true" : undefined}
              aria-describedby={
                errors.copyright ? "copyright-error" : undefined
              }
            />
            {errors.copyright && (
              <p id="copyright-error" className="text-error text-sm mt-1">
                {t("fieldRequired")}
              </p>
            )}
          </div>

          {/* Row 2 left: SEO Title + SEO Keywords stacked */}
          <div className="flex flex-col gap-6">
            <div>
              <label
                htmlFor="seoTitle"
                className="text-primary font-bold text-base block mb-1.5"
              >
                {t("seoTitle")} <span className="text-error">*</span>
              </label>
              <input
                id="seoTitle"
                type="text"
                value={seoTitle}
                placeholder={t("seoTitlePlaceholder")}
                onChange={(e) => {
                  setSeoTitle(e.target.value);
                  if (errors.seoTitle) {
                    setErrors((prev) => ({ ...prev, seoTitle: false }));
                  }
                }}
                className={cn(inputBaseClasses, {
                  [inputErrorClasses]: errors.seoTitle,
                })}
                aria-invalid={errors.seoTitle ? "true" : undefined}
                aria-describedby={
                  errors.seoTitle ? "seoTitle-error" : undefined
                }
              />
              {errors.seoTitle && (
                <p id="seoTitle-error" className="text-error text-sm mt-1">
                  {t("fieldRequired")}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="seoKeywords"
                className="text-primary font-bold text-base block mb-1.5"
              >
                {t("seoKeywords")} <span className="text-error">*</span>
              </label>
              <input
                id="seoKeywords"
                type="text"
                value={seoKeywords}
                placeholder={t("seoKeywordsPlaceholder")}
                onChange={(e) => {
                  setSeoKeywords(e.target.value);
                  if (errors.seoKeywords) {
                    setErrors((prev) => ({ ...prev, seoKeywords: false }));
                  }
                }}
                className={cn(inputBaseClasses, {
                  [inputErrorClasses]: errors.seoKeywords,
                })}
                aria-invalid={errors.seoKeywords ? "true" : undefined}
                aria-describedby={
                  errors.seoKeywords ? "seoKeywords-error" : undefined
                }
              />
              {errors.seoKeywords && (
                <p id="seoKeywords-error" className="text-error text-sm mt-1">
                  {t("fieldRequired")}
                </p>
              )}
            </div>
          </div>

          {/* Row 2 right: SEO Description textarea */}
          <div className="flex flex-col">
            <label
              htmlFor="seoDescription"
              className="text-primary font-bold text-base block mb-1.5"
            >
              {t("seoDescription")}
            </label>
            <textarea
              id="seoDescription"
              value={seoDescription}
              placeholder={t("seoDescriptionPlaceholder")}
              onChange={(e) => setSeoDescription(e.target.value)}
              className={cn(inputBaseClasses, "flex-1 min-h-[120px] resize-none")}
            />
          </div>
        </div>

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
