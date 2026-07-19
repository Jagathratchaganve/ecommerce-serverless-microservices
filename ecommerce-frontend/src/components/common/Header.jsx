import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Search,
  ShoppingCart,
  User,
  LogOut,
  LayoutDashboard,
  Package,
  Boxes,
  Sun,
  Moon,
  ChevronDown,
  Menu,
  X,
  ShieldAlert
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { useCart } from "../../contexts/CartContext";
import { useProducts } from "../../contexts/ProductContext";
import { useTheme } from "../../contexts/ThemeContext";

export const Header = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { itemCount } = useCart();
  const { searchQuery, setSearchQuery } = useProducts();
  const { isDarkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    navigate("/products");
  };

  return (
    <header className="sticky top-0 z-50 bg-[#2874f0] text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Brand Logo (Flipkart-Inspired) */}
          <Link to="/" className="flex flex-col items-start leading-none group">
            <span className="text-2xl font-black italic tracking-wider text-white flex items-center">
              E-BUY
              <span className="text-[#ffe500] text-xs font-bold not-italic ml-1 bg-white/10 px-1.5 py-0.5 rounded">
                Plus
              </span>
            </span>
            <span className="text-[10px] text-blue-100 italic font-medium group-hover:text-yellow-300 transition-colors">
              Explore <span className="text-[#ffe500] font-bold">Plus ✦</span>
            </span>
          </Link>

          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="flex-1 max-w-2xl relative">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for products, brands and more"
                className="w-full bg-white text-gray-900 rounded-sm py-2 pl-4 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 placeholder-gray-500 shadow-inner"
              />
              <button
                type="submit"
                aria-label="Search button"
                className="absolute right-0 top-0 bottom-0 px-3 text-[#2874f0] hover:text-blue-800 flex items-center"
              >
                <Search className="w-5 h-5" />
              </button>
            </div>
          </form>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-6">
            
            {/* Dark Mode Toggle */}
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="p-1.5 rounded-full hover:bg-white/10 transition-colors"
              title="Toggle Theme"
            >
              {isDarkMode ? <Sun className="w-5 h-5 text-yellow-300" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* Auth Dropdown / Login Link */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center space-x-1.5 font-semibold text-sm hover:bg-white/10 px-3 py-1.5 rounded transition-colors"
                >
                  <User className="w-4 h-4" />
                  <span>{user?.name || "Account"}</span>
                  {isAdmin && (
                    <span className="bg-yellow-400 text-blue-900 text-[10px] px-1.5 py-0.2 rounded font-extrabold uppercase">
                      Admin
                    </span>
                  )}
                  <ChevronDown className="w-4 h-4" />
                </button>

                {/* Dropdown Menu */}
                {dropdownOpen && (
                  <div
                    onMouseLeave={() => setDropdownOpen(false)}
                    className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 text-gray-800 dark:text-slate-100 rounded-md shadow-xl border border-gray-100 dark:border-slate-700 py-1 z-50 animate-in fade-in slide-in-from-top-2"
                  >
                    <div className="px-4 py-2 border-b border-gray-100 dark:border-slate-700">
                      <p className="text-xs text-gray-500 dark:text-slate-400">Signed in as</p>
                      <p className="text-sm font-bold truncate">{user?.email}</p>
                    </div>

                    <Link
                      to="/profile"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center px-4 py-2 text-sm hover:bg-blue-50 dark:hover:bg-slate-700"
                    >
                      <User className="w-4 h-4 mr-2 text-blue-600" /> My Profile
                    </Link>

                    <Link
                      to="/my-orders"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center px-4 py-2 text-sm hover:bg-blue-50 dark:hover:bg-slate-700"
                    >
                      <Package className="w-4 h-4 mr-2 text-blue-600" /> Orders & Refunds
                    </Link>

                    {isAdmin && (
                      <>
                        <div className="border-t border-gray-100 dark:border-slate-700 my-1"></div>
                        <p className="px-4 py-1 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                          Admin Operations
                        </p>
                        <Link
                          to="/admin/dashboard"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center px-4 py-2 text-sm hover:bg-yellow-50 dark:hover:bg-slate-700 text-amber-700 dark:text-amber-400 font-semibold"
                        >
                          <LayoutDashboard className="w-4 h-4 mr-2" /> Admin Dashboard
                        </Link>
                        <Link
                          to="/admin/products"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center px-4 py-2 text-sm hover:bg-yellow-50 dark:hover:bg-slate-700"
                        >
                          <Package className="w-4 h-4 mr-2" /> Manage Products
                        </Link>
                        <Link
                          to="/admin/inventory"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center px-4 py-2 text-sm hover:bg-yellow-50 dark:hover:bg-slate-700"
                        >
                          <Boxes className="w-4 h-4 mr-2" /> Manage Inventory
                        </Link>
                      </>
                    )}

                    <div className="border-t border-gray-100 dark:border-slate-700 my-1"></div>
                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        logout();
                      }}
                      className="w-full text-left flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30"
                    >
                      <LogOut className="w-4 h-4 mr-2" /> Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="bg-white text-[#2874f0] font-semibold text-sm px-6 py-1.5 rounded-sm hover:bg-blue-50 transition-all shadow-sm"
              >
                Login
              </Link>
            )}

            {/* Cart Button */}
            <Link
              to="/cart"
              className="flex items-center space-x-1.5 font-semibold text-sm hover:bg-white/10 px-3 py-1.5 rounded relative transition-colors"
            >
              <ShoppingCart className="w-5 h-5" />
              <span>Cart</span>
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center border-2 border-[#2874f0]">
                  {itemCount}
                </span>
              )}
            </Link>

          </div>

          {/* Mobile Hamburger Menu */}
          <div className="flex md:hidden items-center space-x-3">
            <Link to="/cart" className="relative p-1">
              <ShoppingCart className="w-6 h-6" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation menu"
              className="p-1 rounded hover:bg-white/10"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#1f5cc0] text-white px-4 pt-2 pb-4 space-y-3 border-t border-blue-400">
          <div className="flex justify-between items-center py-2 border-b border-blue-400">
            <span className="text-sm font-medium">Dark Theme</span>
            <button onClick={toggleTheme} className="p-1 bg-white/10 rounded">
              {isDarkMode ? <Sun className="w-5 h-5 text-yellow-300" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>

          {isAuthenticated ? (
            <>
              <div className="py-2">
                <p className="text-xs text-blue-200">Logged in as</p>
                <p className="font-bold text-sm">{user?.name} ({user?.role})</p>
              </div>

              <Link
                to="/products"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-sm font-medium hover:text-yellow-300"
              >
                Browse Products
              </Link>
              <Link
                to="/my-orders"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-sm font-medium hover:text-yellow-300"
              >
                My Orders
              </Link>
              <Link
                to="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-sm font-medium hover:text-yellow-300"
              >
                Profile
              </Link>

              {isAdmin && (
                <div className="pt-2 border-t border-blue-400">
                  <p className="text-xs font-bold text-yellow-300 uppercase mb-1">Admin Panel</p>
                  <Link
                    to="/admin/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block py-1.5 text-sm font-medium hover:text-yellow-200"
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/admin/products"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block py-1.5 text-sm font-medium hover:text-yellow-200"
                  >
                    Products Manager
                  </Link>
                  <Link
                    to="/admin/inventory"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block py-1.5 text-sm font-medium hover:text-yellow-200"
                  >
                    Inventory Manager
                  </Link>
                </div>
              )}

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  logout();
                }}
                className="w-full text-left py-2 text-sm text-red-200 font-bold hover:text-red-100"
              >
                Logout
              </button>
            </>
          ) : (
            <Link
              to="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-center bg-white text-[#2874f0] font-bold py-2 rounded shadow"
            >
              Login / Signup
            </Link>
          )}
        </div>
      )}
    </header>
  );
};
