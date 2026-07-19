import React, { useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  Boxes,
  ShoppingBag,
  CreditCard,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  Home,
  ShieldAlert
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";

export const AdminLayout = () => {
  const { user, logout, isAdmin } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900 p-4">
        <div className="bg-white dark:bg-slate-800 p-8 rounded-xl shadow-xl border border-gray-100 dark:border-slate-700 text-center max-w-md">
          <ShieldAlert className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Access Denied</h2>
          <p className="text-sm text-gray-500 dark:text-slate-400 mb-6">
            You must be an administrator to access the Admin Control Panel.
          </p>
          <Link
            to="/"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2 rounded-lg text-sm"
          >
            Return to Store
          </Link>
        </div>
      </div>
    );
  }

  const navItems = [
    { title: "Dashboard", path: "/admin/dashboard", icon: <LayoutDashboard className="w-5 h-5" /> },
    { title: "Products", path: "/admin/products", icon: <Package className="w-5 h-5" /> },
    { title: "Inventory", path: "/admin/inventory", icon: <Boxes className="w-5 h-5" /> },
    { title: "Orders", path: "/admin/orders", icon: <ShoppingBag className="w-5 h-5" /> },
    { title: "Payments", path: "/admin/payments", icon: <CreditCard className="w-5 h-5" /> }
  ];

  return (
    <div className="min-h-screen flex bg-gray-100 dark:bg-slate-950 text-gray-900 dark:text-slate-100">
      
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "w-64" : "w-20"
        } bg-slate-900 text-slate-300 border-r border-slate-800 transition-all duration-300 flex flex-col fixed top-0 bottom-0 left-0 z-40`}
      >
        {/* Sidebar Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800">
          <Link to="/admin/dashboard" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-yellow-400 text-blue-900 rounded font-black flex items-center justify-center text-lg shadow-sm">
              E
            </div>
            {sidebarOpen && (
              <span className="text-lg font-black tracking-wider text-white">
                ADMIN <span className="text-yellow-400 text-xs">Portal</span>
              </span>
            )}
          </Link>

          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1 rounded hover:bg-slate-800 text-slate-400"
          >
            {sidebarOpen ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-3 py-3 rounded-lg text-sm font-semibold transition-colors ${
                  isActive
                    ? "bg-blue-600 text-white shadow-md"
                    : "hover:bg-slate-800 text-slate-400 hover:text-white"
                }`
              }
            >
              {item.icon}
              {sidebarOpen && <span>{item.title}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-slate-800 space-y-1">
          <Link
            to="/"
            className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <Home className="w-5 h-5" />
            {sidebarOpen && <span>View Main Store</span>}
          </Link>

          <button
            onClick={() => logout()}
            className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:bg-red-900/30 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? "ml-64" : "ml-20"}`}>
        
        {/* Top Bar */}
        <header className="h-16 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs">
          <div className="flex items-center space-x-3">
            <span className="text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 px-2.5 py-1 rounded-full uppercase tracking-wider">
              Serverless Admin Console
            </span>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-600 dark:text-slate-300"
            >
              {isDarkMode ? <Sun className="w-5 h-5 text-yellow-300" /> : <Moon className="w-5 h-5" />}
            </button>

            <div className="flex items-center space-x-2 border-l border-gray-200 dark:border-slate-700 pl-4">
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-sm shadow">
                {user?.name?.[0]?.toUpperCase() || "A"}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-bold text-gray-900 dark:text-white leading-none">
                  {user?.name || "Administrator"}
                </p>
                <p className="text-[10px] text-gray-400 dark:text-slate-400">Super Admin</p>
              </div>
            </div>
          </div>
        </header>

        {/* Outlet Content */}
        <main className="p-6 flex-1 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>

    </div>
  );
};
