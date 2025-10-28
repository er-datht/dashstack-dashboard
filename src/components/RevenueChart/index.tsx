import { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useTheme } from "../../hooks/useTheme";
import { THEME_COLORS } from "../../constants/common";
import { ChevronDown, Loader2 } from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import classnames from "classnames";
import type { RevenueChartProps, MonthData } from "./types";
import styles from "./RevenueChart.module.scss";
import { isDarkTheme } from "../../utils/theme";

// Revenue chart colors based on requirements
const REVENUE_COLORS = {
  SALES: "#FF8F6D", // Orange/Coral
  PROFIT: "#DBA5FF", // Purple/Lavender
};

// Sample data matching the screenshot pattern
const generateRevenueData = (): MonthData[] => {
  return [
    {
      month: "january",
      data: [],
    },
    {
      month: "february",
      data: [],
    },
    {
      month: "march",
      data: [],
    },
    {
      month: "april",
      data: [],
    },
    {
      month: "may",
      data: [],
    },
    {
      month: "june",
      data: [],
    },
    {
      month: "july",
      data: [],
    },
    {
      month: "august",
      data: [
        {
          volume: 0,
          salesPercentage: 0,
          profitPercentage: 0,
          sales: 0,
          profit: 0,
        },
        {
          volume: 5000,
          salesPercentage: 8,
          profitPercentage: 20,
          sales: 5000,
          profit: 8000,
        },
        {
          volume: 10000,
          salesPercentage: 17,
          profitPercentage: 38,
          sales: 10000,
          profit: 15000,
        },
        {
          volume: 15000,
          salesPercentage: 25,
          profitPercentage: 30,
          sales: 15000,
          profit: 12000,
        },
        {
          volume: 20000,
          salesPercentage: 33,
          profitPercentage: 40,
          sales: 20000,
          profit: 16000,
        },
        {
          volume: 25000,
          salesPercentage: 42,
          profitPercentage: 55,
          sales: 25000,
          profit: 22000,
        },
        {
          volume: 30000,
          salesPercentage: 50,
          profitPercentage: 45,
          sales: 30000,
          profit: 18000,
        },
        {
          volume: 35000,
          salesPercentage: 58,
          profitPercentage: 70,
          sales: 35000,
          profit: 28000,
        },
        {
          volume: 40000,
          salesPercentage: 67,
          profitPercentage: 60,
          sales: 40000,
          profit: 24000,
        },
        {
          volume: 45000,
          salesPercentage: 75,
          profitPercentage: 50,
          sales: 45000,
          profit: 20000,
        },
        {
          volume: 50000,
          salesPercentage: 83,
          profitPercentage: 65,
          sales: 50000,
          profit: 26000,
        },
        {
          volume: 55000,
          salesPercentage: 92,
          profitPercentage: 75,
          sales: 55000,
          profit: 30000,
        },
        {
          volume: 60000,
          salesPercentage: 100,
          profitPercentage: 88,
          sales: 60000,
          profit: 35000,
        },
      ],
    },
    {
      month: "september",
      data: [
        {
          volume: 0,
          salesPercentage: 0,
          profitPercentage: 0,
          sales: 0,
          profit: 0,
        },
        {
          volume: 5000,
          salesPercentage: 8,
          profitPercentage: 25,
          sales: 5000,
          profit: 10000,
        },
        {
          volume: 10000,
          salesPercentage: 17,
          profitPercentage: 40,
          sales: 10000,
          profit: 16000,
        },
        {
          volume: 15000,
          salesPercentage: 25,
          profitPercentage: 35,
          sales: 15000,
          profit: 14000,
        },
        {
          volume: 20000,
          salesPercentage: 33,
          profitPercentage: 45,
          sales: 20000,
          profit: 18000,
        },
        {
          volume: 25000,
          salesPercentage: 42,
          profitPercentage: 60,
          sales: 25000,
          profit: 24000,
        },
        {
          volume: 30000,
          salesPercentage: 50,
          profitPercentage: 50,
          sales: 30000,
          profit: 20000,
        },
        {
          volume: 35000,
          salesPercentage: 58,
          profitPercentage: 65,
          sales: 35000,
          profit: 26000,
        },
        {
          volume: 40000,
          salesPercentage: 67,
          profitPercentage: 70,
          sales: 40000,
          profit: 28000,
        },
        {
          volume: 45000,
          salesPercentage: 75,
          profitPercentage: 55,
          sales: 45000,
          profit: 22000,
        },
        {
          volume: 50000,
          salesPercentage: 83,
          profitPercentage: 70,
          sales: 50000,
          profit: 28000,
        },
        {
          volume: 55000,
          salesPercentage: 92,
          profitPercentage: 80,
          sales: 55000,
          profit: 32000,
        },
        {
          volume: 60000,
          salesPercentage: 100,
          profitPercentage: 95,
          sales: 60000,
          profit: 38000,
        },
      ],
    },
    {
      month: "october",
      data: [
        {
          volume: 0,
          salesPercentage: 0,
          profitPercentage: 0,
          sales: 0,
          profit: 0,
        },
        {
          volume: 5000,
          salesPercentage: 8,
          profitPercentage: 30,
          sales: 5000,
          profit: 12000,
        },
        {
          volume: 10000,
          salesPercentage: 17,
          profitPercentage: 45,
          sales: 10000,
          profit: 18000,
        },
        {
          volume: 15000,
          salesPercentage: 25,
          profitPercentage: 38,
          sales: 15000,
          profit: 15000,
        },
        {
          volume: 20000,
          salesPercentage: 33,
          profitPercentage: 50,
          sales: 20000,
          profit: 20000,
        },
        {
          volume: 25000,
          salesPercentage: 42,
          profitPercentage: 65,
          sales: 25000,
          profit: 26000,
        },
        {
          volume: 30000,
          salesPercentage: 50,
          profitPercentage: 55,
          sales: 30000,
          profit: 22000,
        },
        {
          volume: 35000,
          salesPercentage: 58,
          profitPercentage: 75,
          sales: 35000,
          profit: 30000,
        },
        {
          volume: 40000,
          salesPercentage: 67,
          profitPercentage: 65,
          sales: 40000,
          profit: 26000,
        },
        {
          volume: 45000,
          salesPercentage: 75,
          profitPercentage: 60,
          sales: 45000,
          profit: 24000,
        },
        {
          volume: 50000,
          salesPercentage: 83,
          profitPercentage: 75,
          sales: 50000,
          profit: 30000,
        },
        {
          volume: 55000,
          salesPercentage: 92,
          profitPercentage: 88,
          sales: 55000,
          profit: 35000,
        },
        {
          volume: 60000,
          salesPercentage: 100,
          profitPercentage: 100,
          sales: 60000,
          profit: 40000,
        },
      ],
    },
    {
      month: "november",
      data: [],
    },
    {
      month: "december",
      data: [],
    },
  ];
};

// Custom tooltip component with locale support
const CustomTooltip = ({
  active,
  payload,
  locale,
}: {
  active?: boolean;
  payload?: Array<{ dataKey: string; value: number; color: string }>;
  locale?: string;
}) => {
  if (active && payload && payload.length > 0) {
    // Use locale for number formatting (en-US for English, ja-JP for Japanese)
    const localeCode = locale === "jp" ? "ja-JP" : "en-US";

    return (
      <div className={styles.customTooltip}>
        {payload.map((entry, index) => (
          <div key={index} className={styles.tooltipRow}>
            <div
              className={styles.tooltipDot}
              style={{ backgroundColor: entry.color }}
            />
            <span className={styles.tooltipLabel}>
              {entry.dataKey === "sales" ? "Sales" : "Profit"}:
            </span>
            <span className={styles.tooltipValue}>
              {entry.value.toLocaleString(localeCode, {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              })}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const RevenueChart = ({ className = "" }: RevenueChartProps) => {
  const { t, i18n } = useTranslation("dashboard");
  const { theme } = useTheme();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState("october");
  const [isLoading, setIsLoading] = useState(true);

  const revenueData = useMemo(() => generateRevenueData(), []);

  // Simulate data loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const currentMonthData = useMemo(() => {
    return (
      revenueData.find((d) => d.month === selectedMonth)?.data ||
      revenueData[0].data
    );
  }, [revenueData, selectedMonth]);

  // Dynamic colors based on theme
  const chartColors = useMemo(() => {
    return {
      grid: isDarkTheme(theme)
        ? THEME_COLORS.GRAY[700]
        : THEME_COLORS.GRAY[200],
      axis: isDarkTheme(theme)
        ? THEME_COLORS.GRAY[500]
        : THEME_COLORS.GRAY[400],
    };
  }, [theme]);

  const handleMonthSelect = (month: string) => {
    setSelectedMonth(month);
    setIsDropdownOpen(false);
  };

  const formatXAxis = (value: number) => {
    return `${value / 1000}k`;
  };

  const formatYAxis = (value: number) => {
    return `${value}%`;
  };

  return (
    <div className={classnames(styles.chartContainer, className)}>
      {/* Header */}
      <div className={styles.header}>
        <h2 className={styles.title}>{t("revenueTitle")}</h2>

        <div className={styles.headerControls}>
          {/* Month Dropdown */}
          <div className={styles.dropdown}>
            <button
              className={styles.dropdownButton}
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              onBlur={() => setTimeout(() => setIsDropdownOpen(false), 200)}
              disabled={isLoading}
              aria-label="Select month"
            >
              <span>{t(`months.${selectedMonth}`)}</span>
              <ChevronDown
                className={classnames(styles.dropdownIcon, {
                  [styles.open]: isDropdownOpen,
                })}
              />
            </button>

            {isDropdownOpen && (
              <div className={styles.dropdownMenu}>
                {revenueData.map((monthData) => (
                  <button
                    key={monthData.month}
                    className={classnames(styles.dropdownItem, {
                      [styles.active]: monthData.month === selectedMonth,
                    })}
                    onClick={() => handleMonthSelect(monthData.month)}
                  >
                    {t(`months.${monthData.month}`)}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className={styles.chartWrapper}>
        {isLoading ? (
          <div className={styles.loadingState}>
            <Loader2 className={styles.loadingSpinner} />
            <p className={styles.loadingText}>{t("loadingChartData")}</p>
          </div>
        ) : currentMonthData.length === 0 ? (
          <div className={styles.emptyState}>
            <p>{t("noDataAvailable")}</p>
          </div>
        ) : (
          <>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={currentMonthData}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <defs>
                  {/* Sales gradient */}
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor={REVENUE_COLORS.SALES}
                      stopOpacity={0.8}
                    />
                    <stop
                      offset="95%"
                      stopColor={REVENUE_COLORS.SALES}
                      stopOpacity={0.1}
                    />
                  </linearGradient>
                  {/* Profit gradient */}
                  <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor={REVENUE_COLORS.PROFIT}
                      stopOpacity={0.8}
                    />
                    <stop
                      offset="95%"
                      stopColor={REVENUE_COLORS.PROFIT}
                      stopOpacity={0.1}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={chartColors.grid}
                  opacity={0.5}
                />
                <XAxis
                  type="number"
                  dataKey="volume"
                  tickFormatter={formatXAxis}
                  stroke={chartColors.axis}
                  className="text-xs"
                  tickLine={false}
                  domain={[0, "dataMax"]}
                />
                <YAxis
                  tickFormatter={formatYAxis}
                  stroke={chartColors.axis}
                  className="text-xs"
                  tickLine={false}
                  domain={[0, 100]}
                  ticks={[0, 20, 40, 60, 80, 100]}
                />
                <Tooltip content={<CustomTooltip locale={i18n.language} />} />
                {/* Sales Area */}
                <Area
                  type="monotone"
                  dataKey="salesPercentage"
                  stroke={REVENUE_COLORS.SALES}
                  strokeWidth={2}
                  fill="url(#colorSales)"
                  fillOpacity={0.8}
                />
                {/* Profit Area */}
                <Area
                  type="monotone"
                  dataKey="profitPercentage"
                  stroke={REVENUE_COLORS.PROFIT}
                  strokeWidth={2}
                  fill="url(#colorProfit)"
                  fillOpacity={0.8}
                />
              </AreaChart>
            </ResponsiveContainer>
          </>
        )}
      </div>

      {/* Legend */}
      <div className={styles.legend}>
        <div className={styles.legendItem}>
          <div
            className={styles.legendDot}
            style={{ backgroundColor: REVENUE_COLORS.SALES }}
          />
          <span className={styles.legendLabel}>{t("revenueChartSales")}</span>
        </div>
        <div className={styles.legendItem}>
          <div
            className={styles.legendDot}
            style={{ backgroundColor: REVENUE_COLORS.PROFIT }}
          />
          <span className={styles.legendLabel}>{t("revenueChartProfit")}</span>
        </div>
      </div>
    </div>
  );
};

export default RevenueChart;
