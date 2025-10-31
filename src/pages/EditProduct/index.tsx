import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Package } from "lucide-react";
import styles from "./EditProduct.module.scss";

export default function EditProduct() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation("dashboard");

  const handleBack = () => {
    navigate("/products");
  };

  return (
    <div className={styles.container}>
      {/* Page Header */}
      <div className={styles.header}>
        <button className={styles.backButton} onClick={handleBack}>
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className={styles.headerIcon}>
          <Package className="w-6 h-6 icon-brand" />
        </div>
        <h1 className={styles.title}>
          {t("products.editProduct")} - #{id}
        </h1>
      </div>

      {/* Content */}
      <div className="card p-6">
        <div className={styles.content}>
          <p className="text-secondary mb-4">
            Product edit functionality will be implemented here.
          </p>
          <p className="text-secondary text-sm">
            Product ID: <span className="font-semibold">{id}</span>
          </p>
        </div>
      </div>
    </div>
  );
}
