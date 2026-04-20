import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Camera, X, Loader2, ChevronDown, Check } from "lucide-react";
import { cn } from "../../../utils/cn";
import { ROUTES } from "../../../routes/routes";

const MAX_PHOTO_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_IMAGE_TYPES = [
  "image/png",
  "image/jpeg",
  "image/gif",
  "image/svg+xml",
  "image/webp",
];

type FormErrors = {
  firstName?: boolean;
  lastName?: boolean;
  email?: boolean;
  emailInvalid?: boolean;
};

export default function AddNewContact(): React.JSX.Element {
  const { t } = useTranslation("contact");
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState("male");
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [isDragging, setIsDragging] = useState(false);
  const [isGenderOpen, setIsGenderOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const genderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  // Close gender dropdown on click outside or Escape
  useEffect(() => {
    if (!isGenderOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (genderRef.current && !genderRef.current.contains(e.target as Node)) {
        setIsGenderOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsGenderOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isGenderOpen]);

  const revokePhotoUrl = (url: string | null) => {
    if (url) URL.revokeObjectURL(url);
  };

  const isValidImageFile = (file: File): boolean => {
    return ALLOWED_IMAGE_TYPES.includes(file.type) && file.size <= MAX_PHOTO_SIZE;
  };

  const showToast = (message: string) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToastMessage(message);
    toastTimerRef.current = setTimeout(() => {
      setToastMessage("");
    }, 3000);
  };

  const applyPhotoFile = (file: File) => {
    if (!isValidImageFile(file)) return;
    revokePhotoUrl(photoPreview);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) applyPhotoFile(file);
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
    if (file) applyPhotoFile(file);
  };

  const handleRemovePhoto = () => {
    revokePhotoUrl(photoPreview);
    setPhotoPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (!firstName.trim()) newErrors.firstName = true;
    if (!lastName.trim()) newErrors.lastName = true;
    if (!email.trim()) {
      newErrors.email = true;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.emailInvalid = true;
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      showToast(t("contactAdded"));
      setTimeout(() => {
        navigate(ROUTES.CONTACT);
      }, 1000);
    }, 500);
  };

  const genderOptions = [
    { value: "male", labelKey: "genderMale" },
    { value: "female", labelKey: "genderFemale" },
    { value: "other", labelKey: "genderOther" },
  ];

  const selectedGenderLabel = t(
    genderOptions.find((g) => g.value === gender)?.labelKey ?? "genderMale"
  );

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
        {t("addNewContact")}
      </h1>

      {/* Card */}
      <div className="card p-8">
        {/* Photo upload area */}
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
            aria-label={t("uploadPhoto")}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleUploadClick();
              }
            }}
          >
            {photoPreview ? (
              <img
                src={photoPreview}
                alt={t("photoPreview")}
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
            onChange={handlePhotoSelect}
          />

          {photoPreview ? (
            <button
              type="button"
              onClick={handleRemovePhoto}
              className="mt-2 text-brand-primary font-bold text-sm flex items-center gap-1"
              aria-label={t("removePhoto")}
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
        </div>

        {/* Form fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* First Name */}
          <div>
            <label
              htmlFor="firstName"
              className="text-primary font-bold text-base block mb-1.5"
            >
              {t("firstName")} <span className="text-error">*</span>
            </label>
            <input
              id="firstName"
              type="text"
              value={firstName}
              placeholder={t("firstNamePlaceholder")}
              onChange={(e) => {
                setFirstName(e.target.value);
                if (errors.firstName) {
                  setErrors((prev) => ({ ...prev, firstName: false }));
                }
              }}
              className={cn(inputBaseClasses, {
                [inputErrorClasses]: errors.firstName,
              })}
              aria-invalid={errors.firstName ? "true" : undefined}
              aria-describedby={errors.firstName ? "firstName-error" : undefined}
            />
            {errors.firstName && (
              <p id="firstName-error" className="text-error text-sm mt-1">
                {t("fieldRequired")}
              </p>
            )}
          </div>

          {/* Last Name */}
          <div>
            <label
              htmlFor="lastName"
              className="text-primary font-bold text-base block mb-1.5"
            >
              {t("lastName")} <span className="text-error">*</span>
            </label>
            <input
              id="lastName"
              type="text"
              value={lastName}
              placeholder={t("lastNamePlaceholder")}
              onChange={(e) => {
                setLastName(e.target.value);
                if (errors.lastName) {
                  setErrors((prev) => ({ ...prev, lastName: false }));
                }
              }}
              className={cn(inputBaseClasses, {
                [inputErrorClasses]: errors.lastName,
              })}
              aria-invalid={errors.lastName ? "true" : undefined}
              aria-describedby={errors.lastName ? "lastName-error" : undefined}
            />
            {errors.lastName && (
              <p id="lastName-error" className="text-error text-sm mt-1">
                {t("fieldRequired")}
              </p>
            )}
          </div>

          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="text-primary font-bold text-base block mb-1.5"
            >
              {t("yourEmail")} <span className="text-error">*</span>
            </label>
            <input
              id="email"
              type="email"
              value={email}
              placeholder={t("emailPlaceholder")}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email || errors.emailInvalid) {
                  setErrors((prev) => ({
                    ...prev,
                    email: false,
                    emailInvalid: false,
                  }));
                }
              }}
              className={cn(inputBaseClasses, {
                [inputErrorClasses]: errors.email || errors.emailInvalid,
              })}
              aria-invalid={
                errors.email || errors.emailInvalid ? "true" : undefined
              }
              aria-describedby={
                errors.email || errors.emailInvalid ? "email-error" : undefined
              }
            />
            {errors.email && (
              <p id="email-error" className="text-error text-sm mt-1">
                {t("fieldRequired")}
              </p>
            )}
            {errors.emailInvalid && (
              <p id="email-error" className="text-error text-sm mt-1">
                {t("invalidEmail")}
              </p>
            )}
          </div>

          {/* Phone Number */}
          <div>
            <label
              htmlFor="phone"
              className="text-primary font-bold text-base block mb-1.5"
            >
              {t("phoneNumber")}
            </label>
            <input
              id="phone"
              type="tel"
              value={phone}
              placeholder={t("phonePlaceholder")}
              onChange={(e) => setPhone(e.target.value)}
              className={inputBaseClasses}
            />
          </div>

          {/* Date of Birth */}
          <div>
            <label
              htmlFor="dateOfBirth"
              className="text-primary font-bold text-base block mb-1.5"
            >
              {t("dateOfBirth")}
            </label>
            <input
              id="dateOfBirth"
              type="text"
              value={dateOfBirth}
              placeholder={t("dateOfBirthPlaceholder")}
              onFocus={(e) => {
                e.target.type = "date";
              }}
              onBlur={(e) => {
                if (!e.target.value) e.target.type = "text";
              }}
              onChange={(e) => setDateOfBirth(e.target.value)}
              className={inputBaseClasses}
            />
          </div>

          {/* Gender */}
          <div>
            <label
              htmlFor="gender"
              className="text-primary font-bold text-base block mb-1.5"
            >
              {t("gender")}
            </label>
            <div className="relative" ref={genderRef}>
              <button
                id="gender"
                type="button"
                onClick={() => setIsGenderOpen((prev) => !prev)}
                aria-haspopup="listbox"
                aria-expanded={isGenderOpen}
                className={cn(
                  inputBaseClasses,
                  "flex items-center justify-between cursor-pointer text-left"
                )}
              >
                <span>{selectedGenderLabel}</span>
                <ChevronDown
                  className="w-5 h-5 text-secondary transition-transform duration-200"
                  style={{
                    transform: isGenderOpen ? "rotate(180deg)" : "rotate(0deg)",
                  }}
                />
              </button>

              {isGenderOpen && (
                <div
                  role="listbox"
                  aria-label={t("gender")}
                  className={cn(
                    "absolute left-0 right-0 top-full mt-1 rounded-xl shadow-lg z-50",
                    "bg-usermenu-bg border border-usermenu-border",
                    "animate-usermenu-enter overflow-hidden"
                  )}
                >
                  {genderOptions.map((option, index) => (
                    <button
                      key={option.value}
                      type="button"
                      role="option"
                      aria-selected={gender === option.value}
                      onClick={() => {
                        setGender(option.value);
                        setIsGenderOpen(false);
                      }}
                      className={cn(
                        "w-full flex items-center gap-3 px-4 py-3 text-left text-sm",
                        "text-usermenu-text transition-colors cursor-pointer",
                        "hover:bg-usermenu-hover",
                        {
                          "rounded-t-xl": index === 0,
                          "rounded-b-xl": index === genderOptions.length - 1,
                        }
                      )}
                    >
                      {gender === option.value && (
                        <Check className="w-4 h-4 text-usermenu-text" />
                      )}
                      <span className={cn({ "ml-7": gender !== option.value })}>
                        {t(option.labelKey)}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Submit button */}
        <div className="flex justify-center mt-8">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSaving}
            className={cn(
              "bg-primary text-on-primary hover-bg-primary-dark rounded-lg font-bold text-xl px-16 py-3 transition-colors",
              "disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
            )}
          >
            {isSaving && <Loader2 className="w-5 h-5 animate-spin" />}
            {t("addNow")}
          </button>
        </div>
      </div>
    </div>
  );
}
