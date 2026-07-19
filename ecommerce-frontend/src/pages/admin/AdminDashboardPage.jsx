import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Package,
  Boxes,
  ShoppingBag,
  CreditCard,
  Plus,
  RefreshCw,
  TrendingUp,
  DollarSign
} from "lucide-react";
import { StatCard } from "../../components/cards/StatCard";
import { productService } from "../../services/productService";
import { inventoryService } from "../../services/inventoryService";
import { orderService } from "../../services/orderService";
import { paymentService } from "../../services/paymentService";
import { formatCurrency, formatDate, getStatusBadgeClass } from "../../utils/formatters";
import { LoadingSpinner } from "../../components/common/LoadingSpinner";

export const AdminDashboardPage = () => {
  const [stats, setStats] = useState({
    productsCount: 0,
    inventoryCount: 0,
    ordersCount: 0,
    totalRevenue: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [prods, invs, ords, pymts] = await Promise.allSettled([
        productService.getAllProducts(),
        inventoryService.getAllInventory(),
        orderService.getAllOrders(),
        paymentService.getAllPayments()
      ]);

      const productList = prods.status === "fulfilled" && Array.isArray(prods.value) ? prods.value : [];
      const inventoryList = invs.status === "fulfilled" && Array.isArray(invs.value) ? invs.value : [];
      const orderList = ords.status === "fulfilled" && Array.isArray(ords.value) ? ords.value : [];
      const paymentList = pymts.status === "fulfilled" && Array.isArray(pymts.value) ? pymts.value : [];

      const revenue = paymentList
        .filter((p) => p.status === "SUCCESS")
        .reduce((sum, p) => sum + Number(p.amount || 0), 0);

      setStats({
        productsCount: productList.length,
        inventoryCount: inventoryList.length,
        ordersCount: orderList.length,
        totalRevenue: revenue
      });

      setRecentOrders(orderList.slice(0, 5));
    } catch (error) {
      console.error("Dashboard error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <LoadingSpinner size="lg" text="Gathering Admin Metrics..." />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      
      {/* Top Welcome Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white">
            System Overview & Analytics
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Real-time status across deployed serverless microservices
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={fetchDashboardData}
            className="p-2.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-xs font-bold text-gray-700 dark:text-slate-200 hover:bg-gray-50 flex items-center"
          >
            <RefreshCw className="w-4 h-4 mr-1.5" /> Refresh Data
          </button>

          <Link
            to="/admin/products"
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2.5 rounded-lg flex items-center shadow-md"
          >
            <Plus className="w-4 h-4 mr-1.5" /> Add Product
          </Link>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Revenue"
          value={formatCurrency(stats.totalRevenue)}
          change="● Verified Payments"
          icon={<DollarSign className="w-6 h-6" />}
          color="emerald"
        />
        <StatCard
          title="Active Products"
          value={stats.productsCount}
          change="● Catalog Size"
          icon={<Package className="w-6 h-6" />}
          color="blue"
        />
        <StatCard
          title="Total Orders"
          value={stats.ordersCount}
          change="● Lifetime Orders"
          icon={<ShoppingBag className="w-6 h-6" />}
          color="purple"
        />
        <StatCard
          title="Inventory Items"
          value={stats.inventoryCount}
          change="● DynamoDB Items"
          icon={<Boxes className="w-6 h-6" />}
          color="amber"
        />
      </div>

      {/* Recent Orders Overview */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700/80 shadow-xs p-6">
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-slate-700 pb-4 mb-4">
          <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wider">
            Recent Activity Stream
          </h3>
          <Link
            to="/admin/orders"
            className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
          >
            Manage All Orders →
          </Link>
        </div>

        {recentOrders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 dark:bg-slate-900 text-gray-400 uppercase font-bold">
                <tr>
                  <th className="p-3">Order ID</th>
                  <th className="p-3">Customer</th>
                  <th className="p-3">Date</th>
                  <th className="p-3">Total Amount</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                {recentOrders.map((ord) => (
                  <tr key={ord.orderId} className="hover:bg-gray-50/50 dark:hover:bg-slate-700/30">
                    <td className="p-3 font-mono font-bold text-gray-900 dark:text-white">
                      {ord.orderId.slice(0, 8)}...
                    </td>
                    <td className="p-3 font-bold text-gray-800 dark:text-slate-200">
                      {ord.customerName}
                    </td>
                    <td className="p-3 text-gray-500">{formatDate(ord.createdAt)}</td>
                    <td className="p-3 font-extrabold text-gray-900 dark:text-white">
                      {formatCurrency(ord.total || ord.subtotal)}
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-full font-bold border ${getStatusBadgeClass(ord.status)}`}>
                        {ord.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-xs text-gray-400 text-center py-6">No recent order activity found.</p>
        )}
      </div>

    </div>
  );
};
