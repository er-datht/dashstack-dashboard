import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Printer, Send } from "lucide-react";
import { cn } from "../../utils/cn";

type InvoiceItem = {
  serialNo: number;
  description: string;
  quantity: number;
  baseCost: number;
  totalCost: number;
};

const invoiceItems: InvoiceItem[] = [
  {
    serialNo: 1,
    description: "Children Toy",
    quantity: 2,
    baseCost: 20,
    totalCost: 80,
  },
  {
    serialNo: 2,
    description: "Makeup",
    quantity: 2,
    baseCost: 50,
    totalCost: 100,
  },
  {
    serialNo: 3,
    description: "Asus Laptop",
    quantity: 5,
    baseCost: 100,
    totalCost: 500,
  },
  {
    serialNo: 4,
    description: "Iphone X",
    quantity: 4,
    baseCost: 1000,
    totalCost: 4000,
  },
];

export default function Invoice(): React.JSX.Element {
  const { t } = useTranslation("invoice");
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 2000);
    return () => clearTimeout(timer);
  }, [toast]);

  const total = invoiceItems.reduce((sum, item) => sum + item.totalCost, 0);

  const handleComingSoon = () => {
    setToast(t("comingSoon"));
  };

  return (
    <div className="p-6">
      {/* Page Title */}
      <h1 className="text-2xl font-bold text-primary mb-6">{t("title")}</h1>

      {/* Invoice Card */}
      <div className="card p-8">
        {/* Header: From / To / Dates */}
        <div className="flex flex-wrap gap-8 mb-10">
          {/* Invoice From */}
          <div className="flex-1 min-w-[180px]">
            <p className="text-secondary text-sm mb-1">{t("invoiceFrom")}</p>
            <p className="text-primary font-bold">Virginia Walker</p>
            <p className="text-secondary text-sm">
              9694 Krajcik Locks Suite 635
            </p>
          </div>

          {/* Invoice To */}
          <div className="flex-1 min-w-[180px]">
            <p className="text-secondary text-sm mb-1">{t("invoiceTo")}</p>
            <p className="text-primary font-bold">Austin Miller</p>
            <p className="text-secondary text-sm">Brookview</p>
          </div>

          {/* Dates */}
          <div className="flex-1 min-w-[180px]">
            <p className="text-primary text-sm mb-1">
              <span className="font-medium">{t("invoiceDate")}</span> 12 Nov
              2019
            </p>
            <p className="text-primary text-sm">
              <span className="font-medium">{t("dueDate")}</span> 25 Dec 2019
            </p>
          </div>
        </div>

        {/* Items Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-surface-secondary">
                <th className="px-6 py-3 text-center text-secondary font-medium">
                  {t("serialNo")}
                </th>
                <th className="px-6 py-3 text-center text-secondary font-medium">
                  {t("description")}
                </th>
                <th className="px-6 py-3 text-center text-secondary font-medium">
                  {t("quantity")}
                </th>
                <th className="px-6 py-3 text-center text-secondary font-medium">
                  {t("baseCost")}
                </th>
                <th className="px-6 py-3 text-center text-secondary font-medium">
                  {t("totalCost")}
                </th>
              </tr>
            </thead>
            <tbody>
              {invoiceItems.map((item) => (
                <tr
                  key={item.serialNo}
                  className="border-b border-border-muted"
                >
                  <td className="px-6 py-4 text-center text-primary">
                    {item.serialNo}
                  </td>
                  <td className="px-6 py-4 text-center text-primary">
                    {item.description}
                  </td>
                  <td className="px-6 py-4 text-center text-primary">
                    {item.quantity}
                  </td>
                  <td className="px-6 py-4 text-center text-primary">
                    ${item.baseCost}
                  </td>
                  <td className="px-6 py-4 text-center text-primary">
                    ${item.totalCost}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Total */}
        <div className="flex justify-end mt-6">
          <p className="text-primary font-bold text-base">
            {t("total")} &nbsp;= &nbsp;${total}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end items-center gap-4 mt-8">
          <button
            type="button"
            onClick={handleComingSoon}
            className={cn(
              "w-10 h-10 rounded-lg border border-border-primary",
              "flex items-center justify-center",
              "text-secondary hover:bg-surface-secondary transition-colors",
              "cursor-pointer",
            )}
            aria-label="Print"
          >
            <Printer className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={handleComingSoon}
            className={cn(
              "flex items-center gap-2 px-6 py-2.5 rounded-lg",
              "bg-primary text-on-primary font-medium",
              "hover:opacity-90 transition-opacity duration-150",
              "cursor-pointer",
            )}
          >
            {t("send")}
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] px-4 py-2 rounded-lg shadow-lg bg-usermenu-bg text-usermenu-text border border-usermenu-border text-sm">
          {toast}
        </div>
      )}
    </div>
  );
}
