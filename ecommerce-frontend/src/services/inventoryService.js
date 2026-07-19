import { inventoryApi } from "./api";

export const inventoryService = {
  // Get all inventory items (Admin)
  getAllInventory: async () => {
    const res = await inventoryApi.get("/api/inventory");
    return res.data;
  },

  // Get inventory by product ID
  getInventoryByProductId: async (productId) => {
    const res = await inventoryApi.get(`/api/inventory/${productId}`);
    return res.data;
  },

  // Create inventory entry (Admin)
  createInventory: async (inventoryData) => {
    const res = await inventoryApi.post("/api/inventory", inventoryData);
    return res.data;
  },

  // Update inventory levels (Admin)
  updateInventory: async (productId, updatedData) => {
    const res = await inventoryApi.put(`/api/inventory/${productId}`, updatedData);
    return res.data;
  },

  // Delete inventory (Admin)
  deleteInventory: async (productId) => {
    const res = await inventoryApi.delete(`/api/inventory/${productId}`);
    return res.data;
  }
};
