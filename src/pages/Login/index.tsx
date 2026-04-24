import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Navigate, Link, useNavigate, useLocation } from "react-router-dom";
import { Eye, EyeOff, Loader2, X } from "lucide-react";
import { cn } from "../../utils/cn";
import { login, getStoredToken, storeTokens, storeUser } from "../../services/auth";
import { ROUTES } from "../../routes/routes";

type FormErrors = {
  email?: boolean;
  emailInvalid?: boolean;
  password?: boolean;
};

const inputBaseClasses =
  "bg-surface-muted border border-default rounded text-primary p-2.5 w-full outline-none focus:ring-1 focus:ring-[var(--color-primary-500)]";
const inputErrorClasses = "border-[var(--color-error-500)]";

export default function Login(): React.JSX.Element {
  const { t } = useTranslation("auth");
  const navigate = useNavigate();
  const location = useLocation();

  // 4.1 Form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [toastMessage, setToastMessage] = useState("");

  // 4.5 Forgot password modal state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotSubmitted, setForgotSubmitted] = useState(false);

  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Toast cleanup
  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  // 4.7 Registration success toast
  useEffect(() => {
    const state = location.state as { registrationSuccess?: boolean; from?: string } | null;
    if (state?.registrationSuccess) {
      showToast(t("registerSuccess"));
      window.history.replaceState({}, document.title);
    }
  }, [location.state, t]);

  // 4.4 Auto-redirect if authenticated (skip during/after submission to preserve return URL)
  const existingToken = getStoredToken();
  if (existingToken && !isSubmitting && !toastMessage) {
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }

  function showToast(message: string) {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToastMessage(message);
    toastTimerRef.current = setTimeout(() => {
      setToastMessage("");
    }, 3000);
  }

  // 4.2 Validation
  function validate(): boolean {
    const newErrors: FormErrors = {};

    if (!email.trim()) {
      newErrors.email = true;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.emailInvalid = true;
    }

    if (!password.trim()) {
      newErrors.password = true;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  // 4.3 Submission handler
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoginError("");

    if (!validate()) return;

    setIsSubmitting(true);

    try {
      const response = await login({ email, password, rememberMe });
      const storage = rememberMe ? "local" : "session";
      storeTokens(response.token, response.refreshToken || "", storage);
      storeUser({ name: response.user.name, email: response.user.email, role: response.user.role }, storage);
      showToast(t("loginSuccess"));

      setTimeout(() => {
        const state = location.state as { from?: string } | null;
        navigate(state?.from || ROUTES.DASHBOARD);
      }, 1000);
    } catch {
      setLoginError(t("invalidCredentials"));
    } finally {
      setIsSubmitting(false);
    }
  }

  // 4.5 Forgot password modal handlers
  function handleForgotSubmit(e: React.FormEvent) {
    e.preventDefault();
    setForgotSubmitted(true);
  }

  function closeForgotModal() {
    setShowForgotModal(false);
    setForgotEmail("");
    setForgotSubmitted(false);
  }

  function handleModalOverlayClick(e: React.MouseEvent) {
    if (e.target === e.currentTarget) {
      closeForgotModal();
    }
  }

  function handleModalKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") {
      closeForgotModal();
      return;
    }
    if (e.key === "Tab" && modalRef.current) {
      const focusable = modalRef.current.querySelectorAll<HTMLElement>(
        'button, input, [tabindex]:not([tabindex="-1"])'
      );
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }

  function getEmailError(): string | null {
    if (errors.email) return t("emailRequired");
    if (errors.emailInvalid) return t("emailInvalid");
    return null;
  }

  const emailError = getEmailError();
  const hasEmailError = errors.email || errors.emailInvalid;

  return (
    <div className="min-h-screen flex items-center justify-center bg-page">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-[var(--color-success-500)] text-on-primary px-4 py-3 rounded-lg shadow-lg">
          {toastMessage}
        </div>
      )}

      <div className="card p-8 w-full max-w-md shadow-lg">
        {/* Branding */}
        <h1 className="text-2xl font-bold text-primary mb-2 text-center">
          {t("loginTitle")}
        </h1>
        <p className="text-secondary text-sm text-center mb-6">
          {t("loginSubtitle")}
        </p>

        {/* API error */}
        {loginError && (
          <p className="text-error text-sm text-center mb-4">{loginError}</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {/* Email field */}
          <div>
            <label
              htmlFor="login-email"
              className="text-primary font-bold text-base block mb-1.5"
            >
              {t("email")} <span className="text-error">*</span>
            </label>
            <input
              id="login-email"
              type="email"
              value={email}
              placeholder={t("emailPlaceholder")}
              onChange={(e) => {
                setEmail(e.target.value);
                if (hasEmailError) {
                  setErrors((prev) => ({
                    ...prev,
                    email: false,
                    emailInvalid: false,
                  }));
                }
              }}
              className={cn(inputBaseClasses, {
                [inputErrorClasses]: hasEmailError,
              })}
              aria-required="true"
              aria-invalid={hasEmailError ? "true" : undefined}
              aria-describedby={hasEmailError ? "email-error" : undefined}
            />
            {emailError && (
              <p id="email-error" className="text-error text-sm mt-1">
                {emailError}
              </p>
            )}
          </div>

          {/* Password field */}
          <div>
            <label
              htmlFor="login-password"
              className="text-primary font-bold text-base block mb-1.5"
            >
              {t("password")} <span className="text-error">*</span>
            </label>
            <div className="relative">
              <input
                id="login-password"
                type={showPassword ? "text" : "password"}
                value={password}
                placeholder={t("passwordPlaceholder")}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) {
                    setErrors((prev) => ({ ...prev, password: false }));
                  }
                }}
                className={cn(inputBaseClasses, "pr-10", {
                  [inputErrorClasses]: errors.password,
                })}
                aria-required="true"
                aria-invalid={errors.password ? "true" : undefined}
                aria-describedby={errors.password ? "password-error" : undefined}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-secondary hover:text-primary transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
            {errors.password && (
              <p id="password-error" className="text-error text-sm mt-1">
                {t("passwordRequired")}
              </p>
            )}
          </div>

          {/* Remember me and Forgot password */}
          <div className="flex items-center justify-between">
            <label
              htmlFor="remember-me"
              className="flex items-center gap-2 text-secondary text-sm cursor-pointer"
            >
              <input
                id="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="accent-[var(--color-primary-600)]"
              />
              {t("rememberMe")}
            </label>

            <button
              type="button"
              onClick={() => setShowForgotModal(true)}
              className="text-[var(--color-primary-500)] text-sm font-medium hover:underline"
            >
              {t("forgotPassword")}
            </button>
          </div>

          {/* Submit button */}
          <div className="flex justify-center pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className={cn(
                "bg-primary text-on-primary hover-bg-primary-dark rounded-lg font-bold text-xl px-16 py-3 transition-colors",
                "disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2",
              )}
            >
              {isSubmitting && <Loader2 className="w-5 h-5 animate-spin" />}
              {t("loginButton")}
            </button>
          </div>
        </form>

        {/* 4.6 Sign up link */}
        <p className="text-center mt-4">
          <Link
            to={ROUTES.REGISTER}
            className="text-[var(--color-primary-500)] font-medium hover:underline"
          >
            {t("signUpLink")}
          </Link>
        </p>
      </div>

      {/* 4.5 Forgot password modal */}
      {showForgotModal && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center"
          onClick={handleModalOverlayClick}
          onKeyDown={handleModalKeyDown}
          role="dialog"
          aria-modal="true"
          aria-labelledby="forgot-password-title"
        >
          <div ref={modalRef} className="card p-6 w-full max-w-sm relative">
            {/* Close button */}
            <button
              type="button"
              onClick={closeForgotModal}
              className="absolute top-4 right-4 text-secondary hover:text-primary transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            {forgotSubmitted ? (
              <div className="text-center py-4">
                <p className="text-primary text-sm">
                  {t("forgotPasswordSuccess")}
                </p>
              </div>
            ) : (
              <>
                <h2
                  id="forgot-password-title"
                  className="text-xl font-bold text-primary mb-2"
                >
                  {t("forgotPasswordTitle")}
                </h2>
                <p className="text-secondary text-sm mb-4">
                  {t("forgotPasswordSubtitle")}
                </p>

                <form onSubmit={handleForgotSubmit} className="space-y-4">
                  <div>
                    <label
                      htmlFor="forgot-email"
                      className="text-primary font-bold text-base block mb-1.5"
                    >
                      {t("email")}
                    </label>
                    <input
                      id="forgot-email"
                      type="email"
                      value={forgotEmail}
                      placeholder={t("emailPlaceholder")}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      className={inputBaseClasses}
                      autoFocus
                    />
                  </div>

                  <button
                    type="submit"
                    className="bg-primary text-on-primary hover-bg-primary-dark rounded-lg font-bold text-sm px-6 py-2.5 transition-colors w-full"
                  >
                    {t("forgotPasswordButton")}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
