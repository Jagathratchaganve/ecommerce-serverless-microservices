import { productApi } from "./api";

export const productService = {
  // Get all products
  getAllProducts: async () => {
    const res = await productApi.get("/api/products");
    return res.data;
  },

  // Get product by ID
  getProductById: async (id) => {
    const res = await productApi.get(`/api/products/${id}`);
    return res.data;
  },

  // Create product (Admin)
  createProduct: async (productData) => {
    const res = await productApi.post("/api/products", productData);
    return res.data;
  },

  // Update product (Admin)
  updateProduct: async (id, updatedData) => {
    const res = await productApi.put(`/api/products/${id}`, updatedData);
    return res.data;
  },

  // Delete product (Admin)
  deleteProduct: async (id) => {
    const res = await productApi.delete(`/api/products/${id}`);
    return res.data;
  }
};
