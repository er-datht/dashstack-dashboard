import { useTranslation } from "react-i18next";
import { cn } from "../../utils/cn";
import type { PricingCardProps } from "../../types/pricing";

export default function PricingCard({
  planName,
  price,
  features,
  isRecommended = false,
}: PricingCardProps): React.JSX.Element {
  const { t } = useTranslation("pricing");

  return (
    <div className="card p-8 flex flex-col h-full">
      {/* Plan Name */}
      <h2 className="text-2xl font-bold text-primary text-center mb-3">
        {planName}
      </h2>

      {/* Monthly Charge Label */}
      <p className="text-base text-secondary text-center mb-4">
        {t("monthlyCharge")}
      </p>

      {/* Price */}
      <div className="text-5xl font-bold text-center mb-6 text-brand-primary">
        ${price}
      </div>

      {/* Divider */}
      <div className="border-t border-gray-200 mb-6"></div>

      {/* Features List */}
      <ul className="space-y-4 mb-6 flex-1">
        {features.map((feature, index) => (
          <li
            key={index}
            className={cn(
              "text-base text-center transition-opacity duration-200",
              feature.available
                ? "text-primary opacity-100"
                : "text-secondary opacity-40"
            )}
          >
            {feature.name}
          </li>
        ))}
      </ul>

      {/* Divider */}
      <div className="border-t border-gray-200 mb-6"></div>

      {/* Get Started Button */}
      <button
        className={cn(
          "w-full py-3 px-6 rounded-full text-base font-medium transition-all duration-200 mb-4",
          isRecommended
            ? "bg-primary text-white hover:opacity-90"
            : "bg-transparent text-brand-primary border-2 border-primary hover:bg-primary hover:bg-none hover:text-white"
        )}
      >
        {t("getStarted")}
      </button>

      {/* Free Trial Link */}
      <a
        href="#"
        className="text-sm text-primary text-center underline hover:opacity-80 transition-opacity duration-200"
        style={{ color: "var(--color-text-primary)" }}
      >
        {t("freeTrial")}
      </a>
    </div>
  );
}
