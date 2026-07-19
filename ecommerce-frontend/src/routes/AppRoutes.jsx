import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { UserLayout } from "../layouts/UserLayout";
import { AdminLayout } from "../layouts/AdminLayout";
import { ProtectedRoute } from "./ProtectedRoute";

// Public Pages
import { HomePage } from "../pages/public/HomePage";
import { ProductListingPage } from "../pages/public/ProductListingPage";
import { ProductDetailsPage } from "../pages/public/ProductDetailsPage";
import { LoginPage } from "../pages/public/LoginPage";
import { SignupPage } from "../pages/public/SignupPage";
import { ConfirmSignupPage } from "../pages/public/ConfirmSignupPage";
import { NotFoundPage } from "../pages/public/NotFoundPage";
import { ForbiddenPage } from "../pages/public/ForbiddenPage";
import { ServerErrorPage } from "../pages/public/ServerErrorPage";

// User Pages
import { CartPage } from "../pages/user/CartPage";
import { CheckoutPage } from "../pages/user/CheckoutPage";
import { OrderSuccessPage } from "../pages/user/OrderSuccessPage";
import { MyOrdersPage } from "../pages/user/MyOrdersPage";
import { OrderDetailsPage } from "../pages/user/OrderDetailsPage";
import { ProfilePage } from "../pages/user/ProfilePage";

// Admin Pages
import { AdminDashboardPage } from "../pages/admin/AdminDashboardPage";
import { AdminProductsPage } from "../pages/admin/AdminProductsPage";
import { AdminInventoryPage } from "../pages/admin/AdminInventoryPage";
import { AdminOrdersPage } from "../pages/admin/AdminOrdersPage";
import { AdminPaymentsPage } from "../pages/admin/AdminPaymentsPage";

export const AppRoutes = () => {
  return (
    <Routes>
      
      {/* Public & User Store Layout */}
      <Route path="/" element={<UserLayout />}>
        <Route index element={<HomePage />} />
        <Route path="products" element={<ProductListingPage />} />
        <Route path="products/:id" element={<ProductDetailsPage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="signup" element={<SignupPage />} />
        <Route path="confirm-signup" element={<ConfirmSignupPage />} />

        {/* User Protected Routes */}
        <Route
          path="cart"
          element={
            <ProtectedRoute>
              <CartPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="checkout"
          element={
            <ProtectedRoute>
              <CheckoutPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="order-success"
          element={
            <ProtectedRoute>
              <OrderSuccessPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="my-orders"
          element={
            <ProtectedRoute>
              <MyOrdersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="my-orders/:orderId"
          element={
            <ProtectedRoute>
              <OrderDetailsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />

        {/* Error Pages */}
        <Route path="403" element={<ForbiddenPage />} />
        <Route path="500" element={<ServerErrorPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>

      {/* Admin Operations Layout */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute requireAdmin>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboardPage />} />
        <Route path="products" element={<AdminProductsPage />} />
        <Route path="inventory" element={<AdminInventoryPage />} />
        <Route path="orders" element={<AdminOrdersPage />} />
        <Route path="payments" element={<AdminPaymentsPage />} />
      </Route>

    </Routes>
  );
};
