import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import TopNav from "../components/TopNav";

export default function DashboardLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-[#f5f5f7] dark:bg-[#1e2129] transition-colors duration-300">
      <Sidebar
        isCollapsed={sidebarCollapsed}
        onCollapsedChange={setSidebarCollapsed}
      />
      <TopNav sidebarCollapsed={sidebarCollapsed} />

      <main
        className={`transition-all duration-300 pt-16 ${
          sidebarCollapsed ? "ml-20" : "ml-64"
        }`}
      >
        <Outlet />
      </main>
    </div>
  );
}
