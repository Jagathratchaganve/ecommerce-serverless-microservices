import React from "react";
import { Link } from "react-router-dom";
import { Package, ChevronRight, Calendar, CreditCard } from "lucide-react";
import { formatCurrency, formatDate, getStatusBadgeClass } from "../../utils/formatters";

export const OrderCard = ({ order }) => {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-100 dark:border-slate-700/80 shadow-xs p-5 mb-4 hover:border-blue-300 dark:hover:border-blue-700 transition-all">
      
      {/* Header Info */}
      <div className="flex flex-wrap items-center justify-between border-b border-gray-100 dark:border-slate-700/60 pb-3 gap-2">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-gray-400">ORDER ID:</span>
            <span className="text-xs font-mono font-bold text-gray-900 dark:text-white">
              {order.orderId}
            </span>
          </div>
          <p className="text-[11px] text-gray-400 dark:text-slate-400 mt-0.5 flex items-center">
            <Calendar className="w-3 h-3 mr-1" /> {formatDate(order.createdAt)}
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <span
            className={`text-xs font-bold px-2.5 py-1 rounded-full border ${getStatusBadgeClass(
              order.status
            )}`}
          >
            ● {order.status}
          </span>
          <span className="text-base font-extrabold text-gray-900 dark:text-white">
            {formatCurrency(order.total || order.subtotal)}
          </span>
        </div>
      </div>

      {/* Item Thumbnails Preview */}
      <div className="py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3 overflow-x-auto no-scrollbar">
          {order.items && order.items.slice(0, 4).map((item, idx) => (
            <div key={idx} className="flex items-center space-x-2 shrink-0 bg-gray-50 dark:bg-slate-900 p-1.5 rounded">
              <img
                src={item.imageUrl || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100"}
                alt={item.productName}
                className="w-10 h-10 object-contain"
                onError={(e) => {
                  e.target.src = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100";
                }}
              />
              <div className="text-xs pr-2 hidden sm:block">
                <p className="font-semibold text-gray-800 dark:text-slate-200 line-clamp-1 w-28">
                  {item.productName}
                </p>
                <p className="text-gray-400">Qty: {item.quantity}</p>
              </div>
            </div>
          ))}
          {order.items && order.items.length > 4 && (
            <span className="text-xs font-bold text-gray-400 px-2">
              +{order.items.length - 4} more
            </span>
          )}
        </div>

        <Link
          to={`/my-orders/${order.orderId}`}
          className="inline-flex items-center text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 ml-4 shrink-0"
        >
          View Details <ChevronRight className="w-4 h-4 ml-0.5" />
        </Link>
      </div>

    </div>
  );
};
