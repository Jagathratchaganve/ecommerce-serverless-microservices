import { cartApi } from "./api";

export const cartService = {
  // Get logged-in user's cart
  getMyCart: async () => {
    const res = await cartApi.get("/api/cart");
    return res.data;
  },

  // Create empty cart
  createCart: async () => {
    const res = await cartApi.post("/api/cart");
    return res.data;
  },

  // Add item to cart
  addItemToCart: async ({ productId, quantity, productName, imageUrl, price }) => {
    const res = await cartApi.post("/api/cart/items", {
      productId,
      quantity,
      productName,
      imageUrl,
      price
    });
    return res.data;
  },

  // Update item quantity
  updateCartItem: async (productId, quantity) => {
    const res = await cartApi.put(`/api/cart/items/${productId}`, { quantity });
    return res.data;
  },

  // Remove item from cart
  removeCartItem: async (productId) => {
    const res = await cartApi.delete(`/api/cart/items/${productId}`);
    return res.data;
  },

  // Clear / remove purchased items post-checkout
  removePurchasedItems: async (userId, productIds = []) => {
    const res = await cartApi.post("/api/cart/clear", { userId, productIds });
    return res.data;
  },

  // Get all carts (Admin)
  getAllCarts: async () => {
    const res = await cartApi.get("/api/cart/all");
    return res.data;
  },

  // Delete cart
  deleteCart: async () => {
    const res = await cartApi.delete("/api/cart");
    return res.data;
  }
};
