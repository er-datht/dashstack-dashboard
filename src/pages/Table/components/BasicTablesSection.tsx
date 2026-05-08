import { useTranslation } from "react-i18next";
import TableCommon, {
  type ColumnDefinition,
} from "../../../components/TableCommon";
import Section from "./Section";
import VariantCard from "./VariantCard";
import { basicMockRows } from "../mockData";
import type { GenericRow } from "../types";

export default function BasicTablesSection(): React.JSX.Element {
  const { t } = useTranslation();

  const columns: ColumnDefinition<GenericRow>[] = [
    { key: "label", header: t("tables:columns.label"), align: "left" },
    { key: "value", header: t("tables:columns.value"), align: "left" },
  ];

  const renderCell = (
    item: GenericRow,
    column: ColumnDefinition<GenericRow>,
  ) => {
    if (column.key === "label") {
      return <span className="text-sm text-primary">{item.label}</span>;
    }
    return <span className="text-sm text-secondary">{item.value}</span>;
  };

  return (
    <Section title={t("tables:sections.basic.title")}>
      <VariantCard title={t("tables:variants.basic.default")}>
        <TableCommon<GenericRow>
          columns={columns}
          data={basicMockRows}
          renderCell={renderCell}
          hasPagination={false}
        />
      </VariantCard>
      <VariantCard title={t("tables:variants.basic.striped")}>
        <TableCommon<GenericRow>
          columns={columns}
          data={basicMockRows}
          renderCell={renderCell}
          hasPagination={false}
          striped
        />
      </VariantCard>
      <VariantCard title={t("tables:variants.basic.bordered")}>
        <TableCommon<GenericRow>
          columns={columns}
          data={basicMockRows}
          renderCell={renderCell}
          hasPagination={false}
          bordered
        />
      </VariantCard>
      <VariantCard title={t("tables:variants.basic.compact")}>
        <TableCommon<GenericRow>
          columns={columns}
          data={basicMockRows}
          renderCell={renderCell}
          hasPagination={false}
          compact
        />
      </VariantCard>
    </Section>
  );
}
