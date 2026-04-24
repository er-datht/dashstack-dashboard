import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import DashboardLayout from "../layouts/DashboardLayout";
import { withAuth } from "../hoc/withAuth";
import { ROUTES } from "./routes";

const ProtectedDashboardLayout = withAuth(DashboardLayout);

// Lazy load all page components
const Dashboard = lazy(() => import("../pages/Dashboard"));
const Products = lazy(() => import("../pages/Products"));
const EditProduct = lazy(() => import("../pages/EditProduct"));
const Favorites = lazy(() => import("../pages/Favorites"));
const Inbox = lazy(() => import("../pages/Inbox"));
const Orders = lazy(() => import("../pages/Orders"));
const ProductStock = lazy(() => import("../pages/ProductStock"));
const Pricing = lazy(() => import("../pages/Pricing"));
const Calendar = lazy(() => import("../pages/Calendar"));
const Todo = lazy(() => import("../pages/Todo"));
const Contact = lazy(() => import("../pages/Contact"));
const AddNewContact = lazy(() => import("../pages/Contact/AddNewContact"));
const Invoice = lazy(() => import("../pages/Invoice"));
const UiElement = lazy(() => import("../pages/UiElement"));
const Team = lazy(() => import("../pages/Team"));
const AddNewMember = lazy(() => import("../pages/Team/AddNewMember"));
const Table = lazy(() => import("../pages/Table"));
const Settings = lazy(() => import("../pages/Settings"));
const Login = lazy(() => import("../pages/Login"));
const Register = lazy(() => import("../pages/Register"));

// Loading fallback component
const LoadingFallback = () => {
  const { t } = useTranslation("common");

  return (
    <div className="flex items-center justify-center min-h-screen bg-white dark:bg-gray-900">
      <div className="text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-600 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
        <p className="mt-4 text-gray-600 dark:text-gray-400">{t("loading")}</p>
      </div>
    </div>
  );
};

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          {/* Public Routes */}
          <Route path={ROUTES.LOGIN} element={<Login />} />
          <Route path={ROUTES.REGISTER} element={<Register />} />

          {/* Protected Routes with Dashboard Layout */}
          <Route path={ROUTES.ROOT} element={<ProtectedDashboardLayout />}>
            <Route index element={<Navigate to={ROUTES.DASHBOARD} replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="products" element={<Products />} />
            <Route path="products/:id/edit" element={<EditProduct />} />
            <Route path="favorites" element={<Favorites />} />
            <Route path="inbox" element={<Inbox />} />
            <Route path="orders" element={<Orders />} />
            <Route path="product-stock" element={<ProductStock />} />
            <Route path="pricing" element={<Pricing />} />
            <Route path="calendar" element={<Calendar />} />
            <Route path="todo" element={<Todo />} />
            <Route path="contact" element={<Contact />} />
            <Route path="contact/add" element={<AddNewContact />} />
            <Route path="invoice" element={<Invoice />} />
            <Route path="ui-element" element={<UiElement />} />
            <Route path="team" element={<Team />} />
            <Route path="team/add" element={<AddNewMember />} />
            <Route path="table" element={<Table />} />
            <Route path="settings" element={<Settings />} />
          </Route>

          {/* Catch all - redirect to dashboard */}
          <Route
            path="*"
            element={<Navigate to={ROUTES.DASHBOARD} replace />}
          />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
