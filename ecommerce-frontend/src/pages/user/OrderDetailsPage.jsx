import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Package, Calendar, MapPin, CreditCard, ArrowLeft, CheckCircle } from "lucide-react";
import { orderService } from "../../services/orderService";
import { formatCurrency, formatDate, getStatusBadgeClass } from "../../utils/formatters";
import { LoadingSpinner } from "../../components/common/LoadingSpinner";
import toast from "react-hot-toast";

export const OrderDetailsPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      setLoading(true);
      try {
        const data = await orderService.getOrderById(orderId);
        if (data) {
          setOrder(data);
        } else {
          toast.error("Order not found");
        }
      } catch (error) {
        console.error("Error fetching order:", error);
      } finally {
        setLoading(false);
      }
    };

    if (orderId) fetchOrder();
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading order details..." />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-16">
        <h2 className="text-2xl font-bold mb-4">Order Not Found</h2>
        <Link to="/my-orders" className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-bold">
          Back to My Orders
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      
      {/* Back Button */}
      <button
        onClick={() => navigate("/my-orders")}
        className="inline-flex items-center text-xs font-bold text-gray-500 hover:text-gray-900 dark:text-slate-400 dark:hover:text-white"
      >
        <ArrowLeft className="w-4 h-4 mr-1" /> Back to Orders
      </button>

      {/* Main Order Card */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700/80 shadow-md p-6 lg:p-8 space-y-6">
        
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between border-b border-gray-100 dark:border-slate-700 pb-4 gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-gray-400">ORDER ID:</span>
              <span className="text-sm font-mono font-black text-gray-900 dark:text-white">
                {order.orderId}
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-1 flex items-center">
              <Calendar className="w-3.5 h-3.5 mr-1" /> Placed on {formatDate(order.createdAt)}
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <span
              className={`text-xs font-bold px-3 py-1 rounded-full border ${getStatusBadgeClass(
                order.status
              )}`}
            >
              ● {order.status}
            </span>
          </div>
        </div>

        {/* Delivery Address & Customer Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 dark:bg-slate-900/60 p-5 rounded-xl border border-gray-100 dark:border-slate-800">
          
          <div>
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center">
              <MapPin className="w-4 h-4 mr-1 text-blue-600" /> Delivery Address
            </h4>
            <p className="text-sm font-bold text-gray-900 dark:text-white">{order.customerName}</p>
            {order.address && (
              <p className="text-xs text-gray-600 dark:text-slate-300 mt-1 leading-relaxed">
                {order.address.street}, {order.address.city}, {order.address.state} - {order.address.zipCode}, {order.address.country}
              </p>
            )}
            <p className="text-xs text-gray-400 mt-1">Phone: {order.phone}</p>
          </div>

          <div>
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center">
              <CreditCard className="w-4 h-4 mr-1 text-emerald-600" /> Payment & Status
            </h4>
            <p className="text-xs text-gray-600 dark:text-slate-300">
              Payment Status: <span className="font-bold text-emerald-600">PAID (Success)</span>
            </p>
            {order.paymentId && (
              <p className="text-xs text-gray-400 mt-1">
                Payment Ref: <span className="font-mono text-gray-700 dark:text-slate-300">{order.paymentId}</span>
              </p>
            )}
            <p className="text-xs text-gray-400 mt-1">Customer Email: {order.email}</p>
          </div>

        </div>

        {/* Ordered Items List */}
        <div>
          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
            Ordered Items ({order.items?.length || 0})
          </h4>
          <div className="divide-y divide-gray-100 dark:divide-slate-700">
            {order.items?.map((item, idx) => (
              <div key={idx} className="py-3 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <img
                    src={item.imageUrl || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100"}
                    alt={item.productName}
                    className="w-12 h-12 object-contain bg-gray-50 dark:bg-slate-900 rounded p-1"
                  />
                  <div>
                    <h5 className="text-sm font-bold text-gray-900 dark:text-white">
                      {item.productName}
                    </h5>
                    <p className="text-xs text-gray-400">
                      Quantity: {item.quantity} × {formatCurrency(item.price)}
                    </p>
                  </div>
                </div>
                <span className="text-sm font-extrabold text-gray-900 dark:text-white">
                  {formatCurrency(item.subtotal || item.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Total Price Summary */}
        <div className="pt-4 border-t border-gray-100 dark:border-slate-700 flex justify-between items-center">
          <span className="text-sm font-bold text-gray-500">Grand Total</span>
          <span className="text-2xl font-black text-blue-600 dark:text-blue-400">
            {formatCurrency(order.total || order.subtotal)}
          </span>
        </div>

      </div>

    </div>
  );
};
