import { useTranslation } from "react-i18next";
import PricingCard from "./PricingCard";
import type { Feature } from "../../types/pricing";

export default function Pricing(): React.JSX.Element {
  const { t } = useTranslation("pricing");

  // Define all features with translations
  const allFeatures = [
    t("features.freeSetup"),
    t("features.bandwidthLimit"),
    t("features.userConnection"),
    t("features.analyticsReport"),
    t("features.publicApiAccess"),
    t("features.pluginsIntegration"),
    t("features.customContentManagement"),
  ];

  // Basic Plan: First 3 features only
  const basicFeatures: Feature[] = allFeatures.map((name, index) => ({
    name,
    available: index < 3,
  }));

  // Standard Plan: First 5 features only
  const standardFeatures: Feature[] = allFeatures.map((name, index) => ({
    name,
    available: index < 5,
  }));

  // Premium Plan: All 7 features
  const premiumFeatures: Feature[] = allFeatures.map((name) => ({
    name,
    available: true,
  }));

  return (
    <div className="p-6">
      {/* Page Title */}
      <h1 className="text-3xl font-bold text-primary mb-8">
        {t("title")}
      </h1>

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Basic Plan */}
        <PricingCard
          planName={t("plans.basic")}
          price="14.99"
          features={basicFeatures}
          isRecommended={false}
        />

        {/* Standard Plan */}
        <PricingCard
          planName={t("plans.standard")}
          price="49.99"
          features={standardFeatures}
          isRecommended={false}
        />

        {/* Premium Plan */}
        <PricingCard
          planName={t("plans.premium")}
          price="89.99"
          features={premiumFeatures}
          isRecommended={true}
        />
      </div>
    </div>
  );
}
