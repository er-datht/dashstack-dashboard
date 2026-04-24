import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Loader2 } from "lucide-react";
import { cn } from "../../utils/cn";
import { register, getStoredToken } from "../../services/auth";
import { ROUTES } from "../../routes/routes";

type FormErrors = {
  name?: boolean;
  email?: boolean;
  emailInvalid?: boolean;
  password?: boolean;
  passwordMinLength?: boolean;
  passwordMismatch?: boolean;
};

const INPUT_CLASSES =
  "bg-surface-muted border border-default rounded text-primary p-2.5 w-full outline-none focus:ring-1 focus:ring-[var(--color-primary-500)]";

const INPUT_ERROR_CLASSES = "border-[var(--color-error-500)]";

export default function Register(): React.JSX.Element {
  const { t } = useTranslation("auth");
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (getStoredToken()) {
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }

  function validate(): boolean {
    const newErrors: FormErrors = {};

    if (!name.trim()) {
      newErrors.name = true;
    }

    if (!email.trim()) {
      newErrors.email = true;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.emailInvalid = true;
    }

    if (!password) {
      newErrors.password = true;
    } else if (password.length < 8) {
      newErrors.passwordMinLength = true;
    } else if (confirmPassword !== password) {
      newErrors.passwordMismatch = true;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await register({ name, email, password, confirmPassword });
      navigate(ROUTES.LOGIN, { state: { registrationSuccess: true } });
    } catch {
      // Error handling for unexpected failures
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-page">
      <div className="card p-8 w-full max-w-md shadow-lg">
        <h1 className="text-2xl font-bold text-primary mb-2 text-center">
          {t("registerTitle")}
        </h1>
        <p className="text-secondary text-sm text-center mb-6">
          {t("registerSubtitle")}
        </p>

        <form className="space-y-4" onSubmit={handleSubmit} noValidate>
          {/* Full Name */}
          <div>
            <label
              htmlFor="register-name"
              className="text-primary font-bold text-base block mb-1.5"
            >
              {t("name")} <span className="text-error">*</span>
            </label>
            <input
              id="register-name"
              type="text"
              className={cn(INPUT_CLASSES, {
                [INPUT_ERROR_CLASSES]: errors.name,
              })}
              placeholder={t("namePlaceholder")}
              value={name}
              onChange={(e) => setName(e.target.value)}
              aria-required="true"
              aria-invalid={errors.name ? "true" : undefined}
              aria-describedby={errors.name ? "register-name-error" : undefined}
            />
            {errors.name && (
              <p id="register-name-error" className="text-error text-sm mt-1">
                {t("nameRequired")}
              </p>
            )}
          </div>

          {/* Email */}
          <div>
            <label
              htmlFor="register-email"
              className="text-primary font-bold text-base block mb-1.5"
            >
              {t("email")} <span className="text-error">*</span>
            </label>
            <input
              id="register-email"
              type="email"
              className={cn(INPUT_CLASSES, {
                [INPUT_ERROR_CLASSES]: errors.email || errors.emailInvalid,
              })}
              placeholder={t("emailPlaceholder")}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-required="true"
              aria-invalid={errors.email || errors.emailInvalid ? "true" : undefined}
              aria-describedby={
                errors.email || errors.emailInvalid
                  ? "register-email-error"
                  : undefined
              }
            />
            {errors.email && (
              <p id="register-email-error" className="text-error text-sm mt-1">
                {t("emailRequired")}
              </p>
            )}
            {errors.emailInvalid && (
              <p id="register-email-error" className="text-error text-sm mt-1">
                {t("emailInvalid")}
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="register-password"
              className="text-primary font-bold text-base block mb-1.5"
            >
              {t("password")} <span className="text-error">*</span>
            </label>
            <input
              id="register-password"
              type="password"
              className={cn(INPUT_CLASSES, {
                [INPUT_ERROR_CLASSES]:
                  errors.password || errors.passwordMinLength,
              })}
              placeholder={t("passwordPlaceholder")}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              aria-required="true"
              aria-invalid={errors.password || errors.passwordMinLength ? "true" : undefined}
              aria-describedby={
                errors.password || errors.passwordMinLength
                  ? "register-password-error"
                  : undefined
              }
            />
            {errors.password && (
              <p
                id="register-password-error"
                className="text-error text-sm mt-1"
              >
                {t("passwordRequired")}
              </p>
            )}
            {errors.passwordMinLength && (
              <p
                id="register-password-error"
                className="text-error text-sm mt-1"
              >
                {t("passwordMinLength")}
              </p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label
              htmlFor="register-confirm-password"
              className="text-primary font-bold text-base block mb-1.5"
            >
              {t("confirmPassword")} <span className="text-error">*</span>
            </label>
            <input
              id="register-confirm-password"
              type="password"
              className={cn(INPUT_CLASSES, {
                [INPUT_ERROR_CLASSES]: errors.passwordMismatch,
              })}
              placeholder={t("confirmPasswordPlaceholder")}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              aria-required="true"
              aria-invalid={errors.passwordMismatch ? "true" : undefined}
              aria-describedby={
                errors.passwordMismatch
                  ? "register-confirm-password-error"
                  : undefined
              }
            />
            {errors.passwordMismatch && (
              <p
                id="register-confirm-password-error"
                className="text-error text-sm mt-1"
              >
                {t("passwordMismatch")}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-primary text-on-primary hover-bg-primary-dark rounded-lg font-bold text-xl py-3 transition-colors disabled:opacity-60 disabled:cursor-not-allowed w-full flex items-center justify-center gap-2"
          >
            {isSubmitting && (
              <Loader2 className="w-5 h-5 animate-spin" />
            )}
            {t("registerButton")}
          </button>
        </form>

        {/* Sign In Link */}
        <p className="text-center mt-4">
          <Link
            to={ROUTES.LOGIN}
            className="text-[var(--color-primary-500)] font-medium hover:underline"
          >
            {t("signInLink")}
          </Link>
        </p>
      </div>
    </div>
  );
}
