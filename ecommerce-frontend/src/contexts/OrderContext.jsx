import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { orderService } from "../services/orderService";
import { paymentService } from "../services/paymentService";
import { useAuth } from "./AuthContext";
import { useCart } from "./CartContext";
import toast from "react-hot-toast";

const OrderContext = createContext(null);

export const OrderProvider = ({ children }) => {
  const { isAuthenticated, isAdmin, user } = useAuth();
  const { clearCart } = useCart();
  const [orders, setOrders] = useState([]);
  const [allAdminOrders, setAllAdminOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch logged in user's orders
  const fetchMyOrders = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      const data = await orderService.getMyOrders();
      setOrders(Array.isArray(data) ? data : []);

      if (isAdmin) {
        const adminData = await orderService.getAllOrders();
        setAllAdminOrders(Array.isArray(adminData) ? adminData : []);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, isAdmin]);

  useEffect(() => {
    fetchMyOrders();
  }, [fetchMyOrders]);

  // Create Order (Status: PENDING)
  const createOrder = async (orderPayload) => {
    setLoading(true);
    try {
      const newOrder = await orderService.createOrder(orderPayload);
      toast.success("Order created successfully! Proceeding to payment...");
      return newOrder;
    } catch (error) {
      const msg = error.response?.data?.message || error.message || "Failed to create order.";
      toast.error(msg);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Complete Payment & Trigger Event-Driven Backend Workflow
  const processPaymentAndCompleteOrder = async (order, paymentMethod = "CARD") => {
    setLoading(true);
    try {
      // 1. Create Payment Record (PENDING)
      const paymentPayload = {
        orderId: order.orderId,
        amount: order.total || order.subtotal,
        customerName: order.customerName || user?.name || "Customer",
        email: order.email || user?.email || "",
        phone: order.phone || "",
        items: order.items || [],
        paymentMethod
      };

      const newPayment = await paymentService.createPayment(paymentPayload);

      // 2. Confirm Payment Success (Executes Backend HTTP updates & SNS event)
      const confirmRes = await paymentService.confirmPaymentSuccess(newPayment.paymentId);

      // 3. Clear Purchased Items from Cart
      const productIds = order.items ? order.items.map((i) => i.productId) : [];
      await clearCart(user?.userId, productIds);

      // 4. Refresh Orders List
      await fetchMyOrders();

      toast.success("Payment successful! Your order has been placed.");
      return {
        payment: confirmRes.payment || newPayment,
        order
      };
    } catch (error) {
      const msg = error.response?.data?.message || error.message || "Payment processing failed.";
      toast.error(msg);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Admin: Update Order Lifecycle Status
  const updateOrderStatus = async (orderId, newStatus) => {
    setLoading(true);
    try {
      const updated = await orderService.updateOrderStatus(orderId, { status: newStatus });
      toast.success(`Order status updated to ${newStatus}`);
      await fetchMyOrders();
      return updated;
    } catch (error) {
      toast.error(error.message || "Failed to update order status");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <OrderContext.Provider
      value={{
        orders,
        allAdminOrders,
        loading,
        createOrder,
        processPaymentAndCompleteOrder,
        updateOrderStatus,
        refreshOrders: fetchMyOrders
      }}
    >
      {children}
    </OrderContext.Provider>
  );
};

export const useOrders = () => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error("useOrders must be used within an OrderProvider");
  }
  return context;
};

export const useOrder = useOrders;
