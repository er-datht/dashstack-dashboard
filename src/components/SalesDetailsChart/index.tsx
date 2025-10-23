import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../hooks/useTheme';
import { THEMES } from '../../constants/common';
import { ChevronDown, Loader2 } from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import classnames from 'classnames';
import type { SalesDetailsChartProps, MonthData, SalesDataPoint } from './types';
import styles from './SalesDetailsChart.module.scss';

// Sample data matching the screenshot pattern
const generateSalesData = (): MonthData[] => {
  return [
    {
      month: 'january',
      data: [],
    },
    {
      month: 'february',
      data: [],
    },
    {
      month: 'march',
      data: [],
    },
    {
      month: 'april',
      data: [],
    },
    {
      month: 'may',
      data: [],
    },
    {
      month: 'june',
      data: [],
    },
    {
      month: 'july',
      data: [],
    },
    {
      month: 'august',
      data: [
        { volume: 5000, percentage: 28, value: 16890.45 },
        { volume: 10000, percentage: 32, value: 20450.67 },
        { volume: 15000, percentage: 45, value: 31230.89 },
        { volume: 20000, percentage: 42, value: 34560.12 },
        { volume: 25000, percentage: 52, value: 49870.34 },
        { volume: 30000, percentage: 38, value: 26780.56 },
        { volume: 35000, percentage: 58, value: 51340.78 },
        { volume: 40000, percentage: 48, value: 40230.23 },
        { volume: 45000, percentage: 42, value: 36890.45 },
        { volume: 50000, percentage: 55, value: 53670.67 },
        { volume: 55000, percentage: 60, value: 61230.89 },
        { volume: 60000, percentage: 58, value: 60450.12 },
      ],
    },
    {
      month: 'september',
      data: [
        { volume: 5000, percentage: 25, value: 15600.34 },
        { volume: 10000, percentage: 35, value: 22340.56 },
        { volume: 15000, percentage: 42, value: 28900.78 },
        { volume: 20000, percentage: 38, value: 31200.45 },
        { volume: 25000, percentage: 48, value: 45670.89 },
        { volume: 30000, percentage: 32, value: 22890.12 },
        { volume: 35000, percentage: 55, value: 48230.34 },
        { volume: 40000, percentage: 50, value: 42100.67 },
        { volume: 45000, percentage: 45, value: 38560.23 },
        { volume: 50000, percentage: 60, value: 56780.45 },
        { volume: 55000, percentage: 58, value: 59340.78 },
        { volume: 60000, percentage: 52, value: 54670.12 },
      ],
    },
    {
      month: 'october',
      data: [
        { volume: 5000, percentage: 21, value: 12500.23 },
        { volume: 10000, percentage: 30, value: 18234.45 },
        { volume: 15000, percentage: 48, value: 28450.67 },
        { volume: 20000, percentage: 40, value: 32100.89 },
        { volume: 25000, percentage: 50, value: 48990.34 },
        { volume: 30000, percentage: 35, value: 24560.78 },
        { volume: 35000, percentage: 52, value: 41230.12 },
        { volume: 40000, percentage: 45, value: 38900.45 },
        { volume: 45000, percentage: 40, value: 35670.89 },
        { volume: 50000, percentage: 58, value: 52340.67 },
        { volume: 55000, percentage: 62, value: 64364.77 },
        { volume: 60000, percentage: 55, value: 58790.23 },
      ],
    },
    {
      month: 'november',
      data: [],
    },
    {
      month: 'december',
      data: [],
    },
  ];
};

// Custom tooltip component with locale support
const CustomTooltip = ({ active, payload, locale }: {
  active?: boolean;
  payload?: Array<{ payload: SalesDataPoint }>;
  locale?: string;
}) => {
  if (active && payload && payload.length > 0) {
    const dataPoint = payload[0];
    if (dataPoint && dataPoint.payload) {
      const data = dataPoint.payload;
      // Use locale for number formatting (en-US for English, ja-JP for Japanese)
      const localeCode = locale === 'jp' ? 'ja-JP' : 'en-US';
      return (
        <div className={styles.customTooltip}>
          <p className={styles.tooltipValue}>
            {data.value.toLocaleString(localeCode, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>
        </div>
      );
    }
  }
  return null;
};

const SalesDetailsChart = ({ className = '' }: SalesDetailsChartProps) => {
  const { t, i18n } = useTranslation('dashboard');
  const { theme } = useTheme();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState('october');
  const [isLoading, setIsLoading] = useState(true);

  const salesData = useMemo(() => generateSalesData(), []);

  // Simulate data loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const currentMonthData = useMemo(() => {
    return salesData.find((d) => d.month === selectedMonth)?.data || salesData[0].data;
  }, [salesData, selectedMonth]);

  // Dynamic colors based on theme
  const chartColors = useMemo(() => {
    return {
      grid: theme === THEMES.DARK ? '#374151' : '#e5e7eb',
      axis: theme === THEMES.DARK ? '#6b7280' : '#9ca3af',
      line: '#4880ff',
      dotStroke: theme === THEMES.DARK ? '#1a1d24' : '#fff',
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
        <h2 className={styles.title}>{t('salesDetailsTitle')}</h2>

        {/* Month Dropdown */}
        <div className={styles.dropdown}>
          <button
            className={styles.dropdownButton}
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            onBlur={() => setTimeout(() => setIsDropdownOpen(false), 200)}
            disabled={isLoading}
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
              {salesData.map((monthData) => (
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

      {/* Chart */}
      <div className={styles.chartWrapper}>
        {isLoading ? (
          <div className={styles.loadingState}>
            <Loader2 className={styles.loadingSpinner} />
            <p className={styles.loadingText}>{t('loadingChartData')}</p>
          </div>
        ) : currentMonthData.length === 0 ? (
          <div className={styles.emptyState}>
            <p>{t('noDataAvailable')}</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={currentMonthData}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorPercentage" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4880ff" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#4880ff" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} opacity={0.5} />
              <XAxis
                dataKey="volume"
                tickFormatter={formatXAxis}
                stroke={chartColors.axis}
                style={{ fontSize: '12px' }}
                tickLine={false}
              />
              <YAxis
                tickFormatter={formatYAxis}
                stroke={chartColors.axis}
                style={{ fontSize: '12px' }}
                tickLine={false}
                domain={[0, 100]}
                ticks={[20, 40, 60, 80, 100]}
              />
              <Tooltip content={<CustomTooltip locale={i18n.language} />} />
              <Area
                type="monotone"
                dataKey="percentage"
                stroke={chartColors.line}
                strokeWidth={2}
                fill="url(#colorPercentage)"
                dot={{
                  fill: chartColors.line,
                  strokeWidth: 2,
                  r: 4,
                  stroke: chartColors.dotStroke,
                }}
                activeDot={{
                  r: 6,
                  fill: chartColors.line,
                  stroke: chartColors.dotStroke,
                  strokeWidth: 2,
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default SalesDetailsChart;
