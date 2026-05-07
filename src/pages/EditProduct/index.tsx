import { useState, useRef, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Package, Plus, Trash2 } from "lucide-react";
import { cn } from "../../utils/cn";
import { useProductStock } from "../../hooks/useProductStock";
import type { ProductColor } from "../../types/productStock";
import styles from "./EditProduct.module.scss";

const ALLOWED_IMAGE_TYPES = [
  "image/png",
  "image/jpeg",
  "image/gif",
  "image/svg+xml",
  "image/webp",
];

const MAX_IMAGE_SIZE_BYTES = 2 * 1024 * 1024;
const POST_SAVE_NAVIGATE_DELAY_MS = 600;

type ToastVariant = "success" | "error";
type ToastState = { text: string; variant: ToastVariant };

type FormErrors = {
  name?: boolean;
  price?: boolean;
  amount?: boolean;
  colors?: boolean;
  image?: boolean;
};

type EditProductFormState = {
  image: string;
  name: string;
  category: string;
  price: number;
  amount: number;
  availableColors: ProductColor[];
};

const PRODUCT_STOCK_PATH = "/product-stock";

export default function EditProduct(): React.JSX.Element {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation("products");
  const { products, isLoading, updateProduct, isUpdatingProduct } =
    useProductStock();

  const product = useMemo(
    () => products.find((p) => p.id === id),
    [products, id],
  );

  // Seed form state synchronously when the product is already in cache so
  // the form renders pre-populated on first paint (no placeholder flash).
  const [formState, setFormState] = useState<EditProductFormState | null>(
    () =>
      product
        ? {
            image: product.image,
            name: product.name,
            category: product.category,
            price: product.price,
            amount: product.amount,
            availableColors: product.availableColors.map((c) => ({ ...c })),
          }
        : null,
  );
  const [errors, setErrors] = useState<FormErrors>({});
  const [isDragging, setIsDragging] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const navigateTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Late hydration: when the query resolves after the first render, fill
  // the form once. Re-running on every product change would clobber edits.
  useEffect(() => {
    if (product && !formState) {
      setFormState({
        image: product.image,
        name: product.name,
        category: product.category,
        price: product.price,
        amount: product.amount,
        availableColors: product.availableColors.map((c) => ({ ...c })),
      });
    }
  }, [product, formState]);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
      if (navigateTimerRef.current) clearTimeout(navigateTimerRef.current);
    };
  }, []);

  const showToast = (text: string, variant: ToastVariant = "success") => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ text, variant });
    toastTimerRef.current = setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  const handleCancel = () => {
    navigate(PRODUCT_STOCK_PATH);
  };

  // Not-found state — only after data has loaded.
  if (!isLoading && !product) {
    return (
      <div className={styles.container}>
        <div className="card p-6 text-center">
          <h2 className="text-2xl font-bold text-primary mb-3">
            {t("notFound")}
          </h2>
          <button
            type="button"
            onClick={handleCancel}
            className="bg-primary text-on-primary hover-bg-primary-dark rounded-lg font-bold px-6 py-2 transition-colors"
          >
            {t("backToProductStock")}
          </button>
        </div>
      </div>
    );
  }

  // While the form is initializing (data loading or first effect tick), show
  // a minimal placeholder. We keep the heading rendered so the page chrome
  // doesn't flash.
  if (!formState) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <button
            type="button"
            className={styles.backButton}
            onClick={handleCancel}
            aria-label={t("back")}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className={styles.headerIcon}>
            <Package className="w-6 h-6 icon-brand" />
          </div>
          <h1 className={styles.title}>{t("editProductStock")}</h1>
        </div>
      </div>
    );
  }

  // ── handlers ────────────────────────────────────────────────────────────

  const isValidImageFile = (file: File): boolean =>
    ALLOWED_IMAGE_TYPES.includes(file.type);

  const applyImageFile = (file: File) => {
    if (!isValidImageFile(file)) {
      showToast(t("imageInvalidType"), "error");
      return;
    }
    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      showToast(t("imageTooLarge"), "error");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = typeof reader.result === "string" ? reader.result : "";
      setFormState((prev) => (prev ? { ...prev, image: dataUrl } : prev));
      if (errors.image) {
        setErrors((prev) => ({ ...prev, image: false }));
      }
    };
    reader.onerror = () => {
      showToast(t("imageReadFailed"), "error");
    };
    reader.readAsDataURL(file);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) applyImageFile(file);
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
    const file = e.dataTransfer.files?.[0];
    if (file) applyImageFile(file);
  };

  const handleClickDropZone = () => {
    fileInputRef.current?.click();
  };

  const handleFieldChange = <K extends keyof EditProductFormState>(
    field: K,
    value: EditProductFormState[K],
  ) => {
    setFormState((prev) => (prev ? { ...prev, [field]: value } : prev));
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: false }));
    }
  };

  const handleColorChange = (
    index: number,
    field: keyof ProductColor,
    value: string,
  ) => {
    const normalized = field === "hex" ? value.toUpperCase() : value;
    setFormState((prev) => {
      if (!prev) return prev;
      const next = prev.availableColors.map((c, i) =>
        i === index ? { ...c, [field]: normalized } : c,
      );
      return { ...prev, availableColors: next };
    });
    if (errors.colors) {
      setErrors((prev) => ({ ...prev, colors: false }));
    }
  };

  const handleAddColor = () => {
    setFormState((prev) =>
      prev
        ? {
            ...prev,
            availableColors: [
              ...prev.availableColors,
              { name: "", hex: "#000000" },
            ],
          }
        : prev,
    );
    if (errors.colors) {
      setErrors((prev) => ({ ...prev, colors: false }));
    }
  };

  const handleRemoveColor = (index: number) => {
    setFormState((prev) =>
      prev
        ? {
            ...prev,
            availableColors: prev.availableColors.filter((_, i) => i !== index),
          }
        : prev,
    );
  };

  const validate = (state: EditProductFormState): FormErrors => {
    const next: FormErrors = {};
    if (!state.name.trim()) next.name = true;
    if (state.price < 0) next.price = true;
    if (state.amount < 0 || !Number.isInteger(state.amount)) {
      next.amount = true;
    }
    if (state.availableColors.length < 1) next.colors = true;
    if (!state.image) next.image = true;
    return next;
  };

  const handleSave = async () => {
    if (!formState || !id || isUpdatingProduct) return;
    const nextErrors = validate(formState);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    try {
      await updateProduct(id, {
        image: formState.image,
        name: formState.name,
        category: formState.category,
        price: formState.price,
        amount: formState.amount,
        availableColors: formState.availableColors,
      });
      showToast(t("updateSuccess"));
      if (navigateTimerRef.current) clearTimeout(navigateTimerRef.current);
      navigateTimerRef.current = setTimeout(() => {
        navigate(PRODUCT_STOCK_PATH);
      }, POST_SAVE_NAVIGATE_DELAY_MS);
    } catch {
      showToast(t("updateError"), "error");
    }
  };

  // ── classes ─────────────────────────────────────────────────────────────

  const inputBaseClasses =
    "bg-surface-muted border border-default rounded text-primary p-2.5 w-full outline-none";
  const inputErrorClasses = "border-[var(--color-error-600)]";

  // ── render ──────────────────────────────────────────────────────────────

  return (
    <div className={cn(styles.container, "relative")}>
      {/* Toast */}
      {toast && (
        <div
          className={cn(
            "fixed bottom-6 right-6 z-50 text-on-primary px-4 py-3 rounded-lg shadow-lg",
            toast.variant === "success"
              ? "bg-[var(--color-success-500)]"
              : "bg-[var(--color-error-500)]",
          )}
          role="status"
          aria-live="polite"
        >
          {toast.text}
        </div>
      )}

      {/* Page Header */}
      <div className={styles.header}>
        <button
          type="button"
          className={styles.backButton}
          onClick={handleCancel}
          aria-label={t("back")}
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className={styles.headerIcon}>
          <Package className="w-6 h-6 icon-brand" />
        </div>
        <h1 className={styles.title}>{t("editProductStock")}</h1>
      </div>

      <div className="card p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Image upload */}
          <div className="md:col-span-2">
            <span
              id="image-label"
              className="text-primary font-bold text-base block mb-1.5"
            >
              {t("image")} <span className="text-error">*</span>
            </span>
            <div
              className={cn(
                "rounded-lg flex flex-col items-center justify-center cursor-pointer transition-colors p-6 gap-2",
                "min-h-[180px]",
                isDragging
                  ? "bg-surface-muted border-2 border-solid border-primary"
                  : "bg-surface-muted border-2 border-dashed border-default",
                errors.image && "border-[var(--color-error-600)]"
              )}
              onClick={handleClickDropZone}
              onDragOver={handleDragOver}
              onDragEnter={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              role="button"
              tabIndex={0}
              aria-labelledby="image-label"
              aria-describedby={errors.image ? "image-error" : undefined}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleClickDropZone();
                }
              }}
            >
              {formState.image && (
                <img
                  src={formState.image}
                  alt={formState.name}
                  className="max-h-32 rounded object-contain"
                />
              )}
              <p className="text-primary font-medium">{t("dropImageHere")}</p>
              <p className="text-sm text-secondary">{t("dragOrClick")}</p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileSelect}
            />
            {errors.image && (
              <p id="image-error" className="text-error text-sm mt-1">
                {t("imageRequired")}
              </p>
            )}
          </div>

          {/* Name */}
          <div>
            <div className="flex items-center mb-1.5">
              <label
                htmlFor="productName"
                className="text-primary font-bold text-base"
              >
                {t("productName")}
              </label>
              <span aria-hidden="true" className="text-error ml-1">
                *
              </span>
            </div>
            <input
              id="productName"
              type="text"
              value={formState.name}
              onChange={(e) => handleFieldChange("name", e.target.value)}
              className={cn(inputBaseClasses, {
                [inputErrorClasses]: errors.name,
              })}
              aria-invalid={errors.name ? "true" : undefined}
              aria-describedby={errors.name ? "productName-error" : undefined}
            />
            {errors.name && (
              <p id="productName-error" className="text-error text-sm mt-1">
                {t("fieldRequired")}
              </p>
            )}
          </div>

          {/* Category */}
          <div>
            <label
              htmlFor="category"
              className="text-primary font-bold text-base block mb-1.5"
            >
              {t("category")}
            </label>
            <input
              id="category"
              type="text"
              value={formState.category}
              onChange={(e) => handleFieldChange("category", e.target.value)}
              className={inputBaseClasses}
            />
          </div>

          {/* Price */}
          <div>
            <div className="flex items-center mb-1.5">
              <label
                htmlFor="price"
                className="text-primary font-bold text-base"
              >
                {t("price")}
              </label>
              <span aria-hidden="true" className="text-error ml-1">
                *
              </span>
            </div>
            <input
              id="price"
              type="number"
              min={0}
              value={formState.price}
              onChange={(e) => {
                const value = e.target.valueAsNumber;
                handleFieldChange("price", Number.isNaN(value) ? 0 : value);
              }}
              className={cn(inputBaseClasses, {
                [inputErrorClasses]: errors.price,
              })}
              aria-invalid={errors.price ? "true" : undefined}
              aria-describedby={errors.price ? "price-error" : undefined}
            />
            {errors.price && (
              <p id="price-error" className="text-error text-sm mt-1">
                {t("priceMustBePositive")}
              </p>
            )}
          </div>

          {/* Amount */}
          <div>
            <div className="flex items-center mb-1.5">
              <label
                htmlFor="amount"
                className="text-primary font-bold text-base"
              >
                {t("amount")}
              </label>
              <span aria-hidden="true" className="text-error ml-1">
                *
              </span>
            </div>
            <input
              id="amount"
              type="number"
              min={0}
              step={1}
              value={formState.amount}
              onChange={(e) => {
                const value = e.target.valueAsNumber;
                handleFieldChange("amount", Number.isNaN(value) ? 0 : value);
              }}
              className={cn(inputBaseClasses, {
                [inputErrorClasses]: errors.amount,
              })}
              aria-invalid={errors.amount ? "true" : undefined}
              aria-describedby={errors.amount ? "amount-error" : undefined}
            />
            {errors.amount && (
              <p id="amount-error" className="text-error text-sm mt-1">
                {t("amountMustBePositiveInteger")}
              </p>
            )}
          </div>

          {/* Colors editor */}
          <div className="md:col-span-2">
            <span className="text-primary font-bold text-base block mb-1.5">
              {t("availableColor")} <span className="text-error">*</span>
            </span>
            <div className="flex flex-col gap-2">
              {formState.availableColors.map((color, index) => {
                const nameId = `color-name-${index}`;
                const hexId = `color-hex-${index}`;
                return (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      id={nameId}
                      type="text"
                      value={color.name}
                      placeholder={t("colorName")}
                      aria-label={`${t("colorName")} ${index + 1}`}
                      onChange={(e) =>
                        handleColorChange(index, "name", e.target.value)
                      }
                      className={cn(inputBaseClasses, "flex-1")}
                    />
                    <input
                      id={hexId}
                      type="color"
                      value={color.hex}
                      aria-label={`${t("colorHex")} ${index + 1}`}
                      onChange={(e) =>
                        handleColorChange(index, "hex", e.target.value)
                      }
                      className="h-10 w-12 rounded border border-default cursor-pointer bg-surface-muted"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveColor(index)}
                      aria-label={`${t("removeColor")} ${index + 1}`}
                      className="p-2 rounded-lg hover:bg-danger-muted transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-danger" />
                    </button>
                  </div>
                );
              })}
            </div>
            <button
              type="button"
              onClick={handleAddColor}
              className="mt-3 inline-flex items-center gap-1 text-brand-primary font-bold text-sm"
            >
              <Plus className="w-4 h-4" />
              {t("addColor")}
            </button>
            {errors.colors && (
              <p className="text-error text-sm mt-1">{t("atLeastOneColor")}</p>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex justify-end gap-3 mt-8">
          <button
            type="button"
            onClick={handleCancel}
            className="bg-surface-muted text-primary rounded-lg font-bold px-6 py-2.5 hover:opacity-80 transition-opacity"
          >
            {t("discardChanges")}
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isUpdatingProduct}
            className={cn(
              "bg-primary text-on-primary hover-bg-primary-dark rounded-lg font-bold px-6 py-2.5 transition-colors",
              "disabled:opacity-60 disabled:cursor-not-allowed"
            )}
          >
            {t("saveChanges")}
          </button>
        </div>
      </div>
    </div>
  );
}
