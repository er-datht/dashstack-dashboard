import { useTranslation } from "react-i18next";
import { LayoutDashboard } from "lucide-react";
import SalesDetailsChart from "../../components/SalesDetailsChart";
import RevenueChart from "../../components/RevenueChart";
import DealDetailsTable from "../../components/DealDetailsTable";

export default function Dashboard() {
  const { t } = useTranslation("dashboard");

  return (
    <div className="p-6" style={{ backgroundColor: "var(--color-background)" }}>
      {/* Dashboard Header */}
      <div className="flex items-center gap-3 mb-6">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center"
          style={{
            backgroundColor: "var(--color-primary-100)",
          }}
        >
          <LayoutDashboard
            className="w-6 h-6"
            style={{ color: "var(--color-primary-600)" }}
          />
        </div>
        <h1
          className="text-2xl font-bold"
          style={{ color: "var(--color-text-primary)" }}
        >
          {t("title")}
        </h1>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div
          className="p-6 rounded-lg"
          style={{
            backgroundColor: "var(--color-surface)",
            boxShadow: "var(--shadow-sm)",
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p
                className="text-sm mb-1"
                style={{ color: "var(--color-text-secondary)" }}
              >
                {t("totalUser")}
              </p>
              <p
                className="text-2xl font-bold"
                style={{ color: "var(--color-text-primary)" }}
              >
                40,689
              </p>
              <p
                className="text-xs mt-1"
                style={{ color: "var(--color-success-600)" }}
              >
                8.5% {t("upFromYesterday")}
              </p>
            </div>
            <div
              className="w-12 h-12 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: "var(--color-primary-100)" }}
            >
              <svg
                className="w-6 h-6"
                style={{ color: "var(--color-primary-600)" }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        <div
          className="p-6 rounded-lg"
          style={{
            backgroundColor: "var(--color-surface)",
            boxShadow: "var(--shadow-sm)",
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p
                className="text-sm mb-1"
                style={{ color: "var(--color-text-secondary)" }}
              >
                {t("totalOrder")}
              </p>
              <p
                className="text-2xl font-bold"
                style={{ color: "var(--color-text-primary)" }}
              >
                10,293
              </p>
              <p
                className="text-xs mt-1"
                style={{ color: "var(--color-success-600)" }}
              >
                1.3% {t("upFromPastWeek")}
              </p>
            </div>
            <div
              className="w-12 h-12 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: "var(--color-warning-100)" }}
            >
              <svg
                className="w-6 h-6"
                style={{ color: "var(--color-warning-600)" }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                />
              </svg>
            </div>
          </div>
        </div>

        <div
          className="p-6 rounded-lg"
          style={{
            backgroundColor: "var(--color-surface)",
            boxShadow: "var(--shadow-sm)",
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p
                className="text-sm mb-1"
                style={{ color: "var(--color-text-secondary)" }}
              >
                {t("totalSales")}
              </p>
              <p
                className="text-2xl font-bold"
                style={{ color: "var(--color-text-primary)" }}
              >
                $89,000
              </p>
              <p
                className="text-xs mt-1"
                style={{ color: "var(--color-error-600)" }}
              >
                4.3% {t("downFromYesterday")}
              </p>
            </div>
            <div
              className="w-12 h-12 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: "var(--color-success-100)" }}
            >
              <svg
                className="w-6 h-6"
                style={{ color: "var(--color-success-600)" }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
          </div>
        </div>

        <div
          className="p-6 rounded-lg"
          style={{
            backgroundColor: "var(--color-surface)",
            boxShadow: "var(--shadow-sm)",
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p
                className="text-sm mb-1"
                style={{ color: "var(--color-text-secondary)" }}
              >
                {t("totalPending")}
              </p>
              <p
                className="text-2xl font-bold"
                style={{ color: "var(--color-text-primary)" }}
              >
                2,040
              </p>
              <p
                className="text-xs mt-1"
                style={{ color: "var(--color-success-600)" }}
              >
                1.8% {t("upFromYesterday")}
              </p>
            </div>
            <div
              className="w-12 h-12 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: "var(--color-error-100)" }}
            >
              <svg
                className="w-6 h-6"
                style={{ color: "var(--color-error-600)" }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Sales Details Chart */}
      <SalesDetailsChart className="mb-6" />

      {/* Deal Details Table */}
      <DealDetailsTable className="mb-6" />

      {/* Revenue Chart */}
      <RevenueChart className="mb-6" />

      {/* Content Placeholder */}
      <div
        className="p-6 rounded-lg"
        style={{
          backgroundColor: "var(--color-surface)",
          boxShadow: "var(--shadow-sm)",
        }}
      >
        <h2
          className="text-lg font-semibold mb-4"
          style={{ color: "var(--color-text-primary)" }}
        >
          {t("welcomeTitle")}
        </h2>
        <p style={{ color: "var(--color-text-secondary)" }}>
          {t("welcomeMessage")}
        </p>
      </div>
    </div>
  );
}
