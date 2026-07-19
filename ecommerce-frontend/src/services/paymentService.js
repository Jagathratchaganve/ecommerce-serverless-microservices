import { paymentApi } from "./api";

export const paymentService = {
  // Create payment record (Status: PENDING)
  createPayment: async (paymentData) => {
    const res = await paymentApi.post("/api/payments", paymentData);
    return res.data;
  },

  // Confirm payment success (Triggers Order update to PLACED, Cart clear, and SNS event)
  confirmPaymentSuccess: async (paymentId) => {
    const res = await paymentApi.post(`/api/payments/${paymentId}/success`);
    return res.data;
  },

  // Get payment details by ID
  getPaymentById: async (paymentId) => {
    const res = await paymentApi.get(`/api/payments/${paymentId}`);
    return res.data;
  },

  // Get all payments (Admin / User)
  getAllPayments: async () => {
    const res = await paymentApi.get("/api/payments");
    return res.data;
  },

  // Update payment status (Admin)
  updatePayment: async (paymentId, statusData) => {
    const res = await paymentApi.put(`/api/payments/${paymentId}`, statusData);
    return res.data;
  },

  // Delete payment (Admin)
  deletePayment: async (paymentId) => {
    const res = await paymentApi.delete(`/api/payments/${paymentId}`);
    return res.data;
  }
};
