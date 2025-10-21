import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import DashboardLayout from "../layouts/DashboardLayout";
import Dashboard from "../pages/Dashboard";
import Products from "../pages/Products";
import Favorites from "../pages/Favorites";
import Inbox from "../pages/Inbox";
import Orders from "../pages/Orders";
import ProductStock from "../pages/ProductStock";
import Pricing from "../pages/Pricing";
import Calendar from "../pages/Calendar";
import Todo from "../pages/Todo";
import Contact from "../pages/Contact";
import Invoice from "../pages/Invoice";
import UiElement from "../pages/UiElement";
import Team from "../pages/Team";
import Table from "../pages/Table";
import Settings from "../pages/Settings";
import Login from "../pages/Login";
import { ROUTES } from "./routes";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path={ROUTES.LOGIN} element={<Login />} />

        {/* Protected Routes with Dashboard Layout */}
        <Route path={ROUTES.ROOT} element={<DashboardLayout />}>
          <Route index element={<Navigate to={ROUTES.DASHBOARD} replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="products" element={<Products />} />
          <Route path="favorites" element={<Favorites />} />
          <Route path="inbox" element={<Inbox />} />
          <Route path="orders" element={<Orders />} />
          <Route path="product-stock" element={<ProductStock />} />
          <Route path="pricing" element={<Pricing />} />
          <Route path="calendar" element={<Calendar />} />
          <Route path="todo" element={<Todo />} />
          <Route path="contact" element={<Contact />} />
          <Route path="invoice" element={<Invoice />} />
          <Route path="ui-element" element={<UiElement />} />
          <Route path="team" element={<Team />} />
          <Route path="table" element={<Table />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        {/* Catch all - redirect to dashboard */}
        <Route path="*" element={<Navigate to={ROUTES.DASHBOARD} replace />} />
      </Routes>
    </BrowserRouter>
  );
}
