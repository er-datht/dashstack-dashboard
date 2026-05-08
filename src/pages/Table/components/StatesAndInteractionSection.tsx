import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import TableCommon, {
  type ColumnDefinition,
} from "../../../components/TableCommon";
import Section from "./Section";
import VariantCard from "./VariantCard";
import { clickableMockRows, paginatedMockRows } from "../mockData";
import type { GenericRow } from "../types";

type StatesAndInteractionSectionProps = {
  showToast: (text: string) => void;
};

const PAGE_SIZE = 5;

export default function StatesAndInteractionSection({
  showToast,
}: StatesAndInteractionSectionProps): React.JSX.Element {
  const { t } = useTranslation();
  const [currentPage, setCurrentPage] = useState(0);

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

  const pageCount = Math.ceil(paginatedMockRows.length / PAGE_SIZE);
  const pagedRows = useMemo(() => {
    const start = currentPage * PAGE_SIZE;
    return paginatedMockRows.slice(start, start + PAGE_SIZE);
  }, [currentPage]);

  return (
    <Section title={t("tables:sections.states.title")}>
      <VariantCard>
        <TableCommon<GenericRow>
          columns={columns}
          data={[]}
          renderCell={renderCell}
          hasPagination={false}
          loading
        />
      </VariantCard>
      <VariantCard title={t("tables:variants.states.empty")}>
        <TableCommon<GenericRow>
          columns={columns}
          data={[]}
          renderCell={renderCell}
          hasPagination={false}
        />
      </VariantCard>
      <VariantCard title={t("tables:variants.states.paginated")}>
        <TableCommon<GenericRow>
          columns={columns}
          data={pagedRows}
          renderCell={renderCell}
          hasPagination
          pageCount={pageCount}
          pageCurrent={currentPage}
          onPageChange={setCurrentPage}
          pageSize={PAGE_SIZE}
          totalItems={paginatedMockRows.length}
        />
      </VariantCard>
      <VariantCard title={t("tables:variants.states.clickable")}>
        <TableCommon<GenericRow>
          columns={columns}
          data={clickableMockRows}
          renderCell={renderCell}
          hasPagination={false}
          onRowClick={(row) =>
            showToast(t("tables:toast.selected", { label: row.label }))
          }
        />
      </VariantCard>
    </Section>
  );
}
