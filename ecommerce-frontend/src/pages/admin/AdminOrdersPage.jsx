import React, { useState, useEffect } from "react";
import { ShoppingBag, RefreshCw, Eye } from "lucide-react";
import { orderService } from "../../services/orderService";
import { DataTable } from "../../components/tables/DataTable";
import { Modal } from "../../components/common/Modal";
import { formatCurrency, formatDate, getStatusBadgeClass } from "../../utils/formatters";
import toast from "react-hot-toast";

export const AdminOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [statusLoading, setStatusLoading] = useState(false);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const data = await orderService.getAllOrders();
      setOrders(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching admin orders:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleUpdateStatus = async (orderId, newStatus) => {
    setStatusLoading(true);
    try {
      await orderService.updateOrderStatus(orderId, { status: newStatus });
      toast.success(`Order ${orderId.slice(0, 8)} status updated to ${newStatus}`);
      if (selectedOrder) {
        setSelectedOrder((prev) => ({ ...prev, status: newStatus }));
      }
      await fetchOrders();
    } catch (error) {
      toast.error(error.message || "Failed to update status");
    } finally {
      setStatusLoading(false);
    }
  };

  const columns = [
    {
      header: "Order ID",
      key: "orderId",
      sortable: true,
      render: (row) => (
        <span className="font-mono font-bold text-gray-900 dark:text-white">
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
          <p className="font-bold text-gray-900 dark:text-white">{row.customerName}</p>
          <p className="text-[11px] text-gray-400">{row.email}</p>
        </div>
      )
    },
    {
      header: "Total",
      key: "total",
      sortable: true,
      render: (row) => (
        <span className="font-extrabold text-gray-900 dark:text-white">
          {formatCurrency(row.total || row.subtotal)}
        </span>
      )
    },
    {
      header: "Status Lifecycle",
      key: "status",
      sortable: true,
      render: (row) => (
        <select
          value={row.status}
          disabled={statusLoading}
          onChange={(e) => handleUpdateStatus(row.orderId, e.target.value)}
          className={`text-xs font-bold px-2 py-1 rounded-md border focus:outline-none ${getStatusBadgeClass(
            row.status
          )}`}
        >
          <option value="PENDING">PENDING</option>
          <option value="PLACED">PLACED</option>
          <option value="SHIPPED">SHIPPED</option>
          <option value="OUT_FOR_DELIVERY">OUT_FOR_DELIVERY</option>
          <option value="DELIVERED">DELIVERED</option>
          <option value="CANCELLED">CANCELLED</option>
        </select>
      )
    },
    {
      header: "Placed At",
      key: "createdAt",
      sortable: true,
      render: (row) => (
        <span className="text-xs text-gray-400">{formatDate(row.createdAt)}</span>
      )
    },
    {
      header: "Details",
      key: "actions",
      render: (row) => (
        <button
          onClick={() => setSelectedOrder(row)}
          className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-700 rounded transition-colors flex items-center text-xs font-bold"
        >
          <Eye className="w-4 h-4 mr-1" /> View
        </button>
      )
    }
  ];

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white flex items-center">
            <ShoppingBag className="w-6 h-6 mr-2 text-purple-600" /> Customer Orders Lifecycle Manager
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Track and update fulfillment status across all customer purchases
          </p>
        </div>

        <button
          onClick={fetchOrders}
          className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 hover:bg-gray-50 text-gray-700 dark:text-slate-200 font-bold px-4 py-2.5 rounded-lg text-xs flex items-center shadow-xs"
        >
          <RefreshCw className="w-4 h-4 mr-1.5" /> Refresh Orders
        </button>
      </div>

      {/* DataTable */}
      <DataTable
        columns={columns}
        data={orders}
        loading={loading}
        searchPlaceholder="Search orders by ID, customer name or email..."
      />

      {/* View Order Modal */}
      {selectedOrder && (
        <Modal
          isOpen={!!selectedOrder}
          onClose={() => setSelectedOrder(null)}
          title={`Order Details: ${selectedOrder.orderId}`}
          maxWidth="max-w-2xl"
        >
          <div className="space-y-4">
            
            <div className="p-4 bg-gray-50 dark:bg-slate-900 rounded-xl space-y-1 text-xs">
              <p><span className="font-bold text-gray-400">Customer:</span> {selectedOrder.customerName} ({selectedOrder.email})</p>
              <p><span className="font-bold text-gray-400">Phone:</span> {selectedOrder.phone}</p>
              {selectedOrder.address && (
                <p><span className="font-bold text-gray-400">Shipping Address:</span> {selectedOrder.address.street}, {selectedOrder.address.city}, {selectedOrder.address.state} - {selectedOrder.address.zipCode}</p>
              )}
              <p><span className="font-bold text-gray-400">Current Status:</span> <span className="font-bold text-blue-600">{selectedOrder.status}</span></p>
            </div>

            <div>
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Order Items</h4>
              <div className="divide-y divide-gray-100 dark:divide-slate-700 text-xs">
                {selectedOrder.items?.map((item, idx) => (
                  <div key={idx} className="py-2 flex justify-between items-center">
                    <div>
                      <p className="font-bold text-gray-900 dark:text-white">{item.productName}</p>
                      <p className="text-gray-400">Qty: {item.quantity} × {formatCurrency(item.price)}</p>
                    </div>
                    <span className="font-bold">{formatCurrency(item.subtotal || item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-gray-100 dark:border-slate-700 flex justify-between items-center font-bold">
              <span>Total Payable</span>
              <span className="text-lg text-blue-600">{formatCurrency(selectedOrder.total || selectedOrder.subtotal)}</span>
            </div>

          </div>
        </Modal>
      )}

    </div>
  );
};
