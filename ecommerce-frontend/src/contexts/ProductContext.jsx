import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { productService } from "../services/productService";
import { inventoryService } from "../services/inventoryService";
import { useAuth } from "./AuthContext";
import toast from "react-hot-toast";

const ProductContext = createContext(null);

export const ProductProvider = ({ children }) => {
  const { isAuthenticated, isAdmin } = useAuth();
  const [products, setProducts] = useState([]);
  const [inventoryMap, setInventoryMap] = useState({});
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("relevance");

  // Fetch all products
  const fetchProducts = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      const data = await productService.getAllProducts();
      setProducts(Array.isArray(data) ? data : []);

      // If Admin, also fetch complete inventory stock levels
      if (isAdmin) {
        try {
          const invList = await inventoryService.getAllInventory();
          if (Array.isArray(invList)) {
            const map = {};
            invList.forEach((item) => {
              map[item.productId] = item;
            });
            setInventoryMap(map);
          }
        } catch (invErr) {
          console.warn("Inventory fetch warning:", invErr);
        }
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, isAdmin]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Derive available categories dynamically
  const categories = React.useMemo(() => {
    const set = new Set(["All"]);
    products.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return Array.from(set);
  }, [products]);

  // Derived filtered & sorted products
  const filteredProducts = React.useMemo(() => {
    let result = [...products];

    // Filter by Category
    if (selectedCategory !== "All") {
      result = result.filter(
        (p) => p.category?.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    // Filter by Search Query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name?.toLowerCase().includes(query) ||
          p.brand?.toLowerCase().includes(query) ||
          p.category?.toLowerCase().includes(query) ||
          p.description?.toLowerCase().includes(query)
      );
    }

    // Sorting
    if (sortBy === "price-asc") {
      result.sort((a, b) => Number(a.price || 0) - Number(b.price || 0));
    } else if (sortBy === "price-desc") {
      result.sort((a, b) => Number(b.price || 0) - Number(a.price || 0));
    } else if (sortBy === "newest") {
      result.sort(
        (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
      );
    } else if (sortBy === "discount") {
      result.sort((a, b) => {
        const discA = a.price && a.discountPrice ? ((a.price - a.discountPrice) / a.price) : 0;
        const discB = b.price && b.discountPrice ? ((b.price - b.discountPrice) / b.price) : 0;
        return discB - discA;
      });
    }

    return result;
  }, [products, selectedCategory, searchQuery, sortBy]);

  // Admin CRUD Wrappers
  const createProduct = async (productData) => {
    try {
      const newProduct = await productService.createProduct(productData);
      toast.success("Product created successfully!");
      await fetchProducts();
      return newProduct;
    } catch (error) {
      toast.error(error.message || "Failed to create product");
      throw error;
    }
  };

  const updateProduct = async (id, updatedData) => {
    try {
      const updated = await productService.updateProduct(id, updatedData);
      toast.success("Product updated successfully!");
      await fetchProducts();
      return updated;
    } catch (error) {
      toast.error(error.message || "Failed to update product");
      throw error;
    }
  };

  const deleteProduct = async (id) => {
    try {
      await productService.deleteProduct(id);
      toast.success("Product deleted successfully!");
      await fetchProducts();
    } catch (error) {
      toast.error(error.message || "Failed to delete product");
      throw error;
    }
  };

  return (
    <ProductContext.Provider
      value={{
        products,
        filteredProducts,
        categories,
        inventoryMap,
        loading,
        searchQuery,
        setSearchQuery,
        selectedCategory,
        setSelectedCategory,
        sortBy,
        setSortBy,
        refreshProducts: fetchProducts,
        createProduct,
        updateProduct,
        deleteProduct
      }}
    >
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = () => {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error("useProducts must be used within a ProductProvider");
  }
  return context;
};
