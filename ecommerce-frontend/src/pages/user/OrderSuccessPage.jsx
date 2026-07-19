import React from "react";
import { useLocation, Link, Navigate } from "react-router-dom";
import { CheckCircle2, Package, ArrowRight, ShieldCheck, Mail, Sparkles } from "lucide-react";
import { formatCurrency, formatDate } from "../../utils/formatters";

export const OrderSuccessPage = () => {
  const location = useLocation();
  const order = location.state?.order;
  const payment = location.state?.payment;

  if (!order) {
    return <Navigate to="/my-orders" replace />;
  }

  return (
    <div className="max-w-2xl mx-auto py-12 px-4 text-center">
      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-gray-100 dark:border-slate-700/80 shadow-2xl p-8 sm:p-12 space-y-6">
        
        {/* Success Icon */}
        <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto shadow-inner animate-bounce">
          <CheckCircle2 className="w-12 h-12" />
        </div>

        <div className="space-y-2">
          <span className="inline-flex items-center text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1 rounded-full">
            <Sparkles className="w-3.5 h-3.5 mr-1" /> Payment & Order Confirmed
          </span>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white">
            Thank You For Your Order!
          </h1>
          <p className="text-sm text-gray-500 dark:text-slate-400">
            We've received your payment. Your order has been placed successfully.
          </p>
        </div>

        {/* Order Details Summary Box */}
        <div className="bg-gray-50 dark:bg-slate-900/60 p-6 rounded-2xl border border-gray-200/60 dark:border-slate-700 text-left space-y-3">
          
          <div className="flex justify-between items-center text-xs border-b border-gray-200 dark:border-slate-700 pb-2">
            <span className="text-gray-400 font-bold">ORDER ID</span>
            <span className="font-mono font-bold text-gray-900 dark:text-white">{order.orderId}</span>
          </div>

          {payment?.paymentId && (
            <div className="flex justify-between items-center text-xs border-b border-gray-200 dark:border-slate-700 pb-2">
              <span className="text-gray-400 font-bold">TRANSACTION ID</span>
              <span className="font-mono font-bold text-gray-900 dark:text-white">{payment.paymentId}</span>
            </div>
          )}

          <div className="flex justify-between items-center text-xs border-b border-gray-200 dark:border-slate-700 pb-2">
            <span className="text-gray-400 font-bold">DATE & TIME</span>
            <span className="font-bold text-gray-900 dark:text-white">{formatDate(order.createdAt || new Date())}</span>
          </div>

          <div className="flex justify-between items-center text-xs">
            <span className="text-gray-400 font-bold">AMOUNT PAID</span>
            <span className="text-base font-black text-blue-600 dark:text-blue-400">
              {formatCurrency(order.total || order.subtotal)}
            </span>
          </div>

        </div>

        {/* Serverless Fan-Out Info */}
        <div className="p-4 bg-blue-50 dark:bg-blue-950/40 rounded-xl text-xs text-blue-800 dark:text-blue-300 font-medium flex items-center text-left">
          <Mail className="w-5 h-5 mr-3 shrink-0 text-blue-600" />
          <p>
            An automated confirmation email has been dispatched via AWS SNS & SQS fan-out queues to{" "}
            <span className="font-bold">{order.email}</span>. Your cart has been cleared and inventory updated.
          </p>
        </div>

        {/* Buttons */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/my-orders"
            className="w-full sm:w-auto bg-[#2874f0] hover:bg-blue-700 text-white font-extrabold px-8 py-3 rounded-lg text-sm shadow-md transition-all flex items-center justify-center"
          >
            <Package className="w-4 h-4 mr-2" /> View My Orders
          </Link>
          <Link
            to="/products"
            className="w-full sm:w-auto bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 text-gray-800 dark:text-white font-extrabold px-8 py-3 rounded-lg text-sm transition-all flex items-center justify-center"
          >
            Continue Shopping <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </div>

      </div>
    </div>
  );
};
