import React from "react";
import { Tooltip } from "react-tooltip";
import { truncate } from "lodash";
import { Package } from "lucide-react";
import type { TFunction } from "i18next";
import StatusBadge from "../StatusBadge";
import type { StatusType } from "../StatusBadge";
import type { Deal } from "./types";

export type DealDetailsColumn = {
  key: string;
  header: string;
  dataField?: string;
  align?: "left" | "center" | "right";
  width?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  formatter?: (value: any, row: Deal) => React.ReactNode;
  headerClass?: string;
  rowClass?: string;
};

const getDealDetailsColumns = (t: TFunction): DealDetailsColumn[] => {
  return [
    {
      key: "name",
      header: t("dealDetails.headers.productName"),
      dataField: "name",
      align: "left",
      width: "25%",
      formatter: (value: string, row: Deal) => {
        const truncatedName = truncate(value, { length: 30 });
        const hasOverflow = truncatedName !== value;
        const tooltipId = `product-name-${row.id}`;

        return (
          <div className="flex items-center gap-3">
            {row.image ? (
              <img
                src={row.image}
                alt={value}
                className="w-9 h-9 rounded-lg object-cover shrink-0"
              />
            ) : (
              <div className="w-9 h-9 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center shrink-0">
                <Package className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
            )}
            <span
              data-tooltip-id={hasOverflow ? tooltipId : undefined}
              data-tooltip-content={hasOverflow ? value : undefined}
              className="truncate font-medium"
            >
              {truncatedName}
            </span>
            {hasOverflow && <Tooltip id={tooltipId} place="top" />}
          </div>
        );
      },
    },
    {
      key: "location",
      header: t("dealDetails.headers.location"),
      dataField: "location",
      align: "left",
      width: "20%",
      formatter: (value: string, row: Deal) => {
        const truncatedLocation = truncate(value, { length: 25 });
        const hasOverflow = truncatedLocation !== value;
        const tooltipId = `location-${row.id}`;

        return (
          <>
            <span
              data-tooltip-id={hasOverflow ? tooltipId : undefined}
              data-tooltip-content={hasOverflow ? value : undefined}
              className="truncate"
            >
              {truncatedLocation}
            </span>
            {hasOverflow && <Tooltip id={tooltipId} place="top" />}
          </>
        );
      },
    },
    {
      key: "datetime",
      header: t("dealDetails.headers.dateTime"),
      dataField: "datetime",
      align: "left",
      width: "18%",
      formatter: (value: string) => {
        return <span className="whitespace-nowrap">{value}</span>;
      },
    },
    {
      key: "amount",
      header: t("dealDetails.headers.amount"),
      dataField: "amount",
      align: "right",
      width: "12%",
      formatter: (value: number) => {
        return <span className="font-medium">{value.toLocaleString()}</span>;
      },
    },
    {
      key: "price",
      header: t("dealDetails.headers.price"),
      dataField: "price",
      align: "right",
      width: "15%",
      formatter: (value: string) => {
        return <span className="font-semibold">{value}</span>;
      },
    },
    {
      key: "status",
      header: t("dealDetails.headers.status"),
      dataField: "status",
      align: "center",
      width: "10%",
      formatter: (value: StatusType) => {
        return <StatusBadge status={value} translation="dashboard" />;
      },
    },
  ];
};

export default getDealDetailsColumns;
