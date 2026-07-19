import React, { useState, useEffect } from "react";
import { CreditCard, RefreshCw } from "lucide-react";
import { paymentService } from "../../services/paymentService";
import { DataTable } from "../../components/tables/DataTable";
import { formatCurrency, formatDate, getStatusBadgeClass } from "../../utils/formatters";

export const AdminPaymentsPage = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const data = await paymentService.getAllPayments();
      setPayments(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching payments:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const columns = [
    {
      header: "Payment ID",
      key: "paymentId",
      sortable: true,
      render: (row) => (
        <span className="font-mono font-bold text-gray-900 dark:text-white">
          {row.paymentId}
        </span>
      )
    },
    {
      header: "Order ID",
      key: "orderId",
      sortable: true,
      render: (row) => (
        <span className="font-mono text-xs text-gray-500">
          {row.orderId}
        </span>
      )
    },
    {
      header: "Customer",
      key: "customerName",
      sortable: true,
      render: (row) => (
        <div>
          <p className="font-bold text-gray-800 dark:text-slate-200">{row.customerName || "Customer"}</p>
          <p className="text-[11px] text-gray-400">{row.email}</p>
        </div>
      )
    },
    {
      header: "Amount",
      key: "amount",
      sortable: true,
      render: (row) => (
        <span className="font-extrabold text-gray-900 dark:text-white">
          {formatCurrency(row.amount)}
        </span>
      )
    },
    {
      header: "Payment Method",
      key: "paymentMethod",
      sortable: true,
      render: (row) => (
        <span className="text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-2.5 py-0.5 rounded uppercase">
          {row.paymentMethod || "CARD"}
        </span>
      )
    },
    {
      header: "Status",
      key: "status",
      sortable: true,
      render: (row) => (
        <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${getStatusBadgeClass(row.status)}`}>
          ● {row.status}
        </span>
      )
    },
    {
      header: "Date",
      key: "createdAt",
      sortable: true,
      render: (row) => (
        <span className="text-xs text-gray-400">{formatDate(row.createdAt)}</span>
      )
    }
  ];

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white flex items-center">
            <CreditCard className="w-6 h-6 mr-2 text-emerald-600" /> Payment Transactions Audit
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Audit payment receipts and SNS event status across all orders
          </p>
        </div>

        <button
          onClick={fetchPayments}
          className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 hover:bg-gray-50 text-gray-700 dark:text-slate-200 font-bold px-4 py-2.5 rounded-lg text-xs flex items-center shadow-xs"
        >
          <RefreshCw className="w-4 h-4 mr-1.5" /> Refresh Payments
        </button>
      </div>

      {/* DataTable */}
      <DataTable
        columns={columns}
        data={payments}
        loading={loading}
        searchPlaceholder="Search payments by Payment ID, Order ID or customer..."
      />

    </div>
  );
};
