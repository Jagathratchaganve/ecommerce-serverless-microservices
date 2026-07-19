import { orderApi } from "./api";

export const orderService = {
  // Get logged-in user's orders
  getMyOrders: async () => {
    const res = await orderApi.get("/api/orders/my");
    return res.data;
  },

  // Get order by ID
  getOrderById: async (orderId) => {
    const res = await orderApi.get(`/api/orders/${orderId}`);
    return res.data;
  },

  // Create new order (Status: PENDING)
  createOrder: async (orderData) => {
    const res = await orderApi.post("/api/orders", orderData);
    return res.data;
  },

  // Update order status (Admin or Payment Service flow)
  updateOrderStatus: async (orderId, statusData) => {
    const res = await orderApi.put(`/api/orders/${orderId}/status`, statusData);
    return res.data;
  },

  // Get all orders (Admin)
  getAllOrders: async () => {
    const res = await orderApi.get("/api/orders/all");
    return res.data;
  },

  // Delete order (Admin)
  deleteOrder: async (orderId) => {
    const res = await orderApi.delete(`/api/orders/${orderId}`);
    return res.data;
  }
};
