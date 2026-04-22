import { useTranslation } from "react-i18next";

type LabelItemProps = {
  nameKey: string;
  color: string;
};

export default function LabelItem({
  nameKey,
  color,
}: LabelItemProps): React.JSX.Element {
  const { t } = useTranslation("inbox");

  return (
    <div className="flex items-center gap-3 px-3 py-2">
      <div
        className="w-[18px] h-[18px] rounded-sm flex-shrink-0"
        style={{
          border: `1.2px solid ${color}`,
        }}
      />
      <span className="text-sm text-primary">{t(nameKey)}</span>
    </div>
  );
}
