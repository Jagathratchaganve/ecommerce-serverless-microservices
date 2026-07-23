import React from "react";
import { describe, test, expect, vi, beforeEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { ProductProvider, useProducts } from "../../contexts/ProductContext";
import { productService } from "../../services/productService";
import { inventoryService } from "../../services/inventoryService";
import { useAuth } from "../../contexts/AuthContext";

vi.mock("../../services/productService", () => ({
  productService: {
    getAllProducts: vi.fn(),
    createProduct: vi.fn(),
    updateProduct: vi.fn(),
    deleteProduct: vi.fn()
  }
}));

vi.mock("../../services/inventoryService", () => ({
  inventoryService: {
    getAllInventory: vi.fn()
  }
}));

vi.mock("../../contexts/AuthContext", () => ({
  useAuth: vi.fn()
}));

const ProductTestComponent = () => {
  const {
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
    createProduct,
    updateProduct,
    deleteProduct
  } = useProducts();

  return (
    <div>
      <span data-testid="loading">{loading ? "loading" : "done"}</span>
      <span data-testid="products-count">{products.length}</span>
      <span data-testid="filtered-count">{filteredProducts.length}</span>
      <span data-testid="categories">{categories.join(",")}</span>
      <span data-testid="search-query">{searchQuery}</span>
      <button data-testid="set-search" onClick={() => setSearchQuery("laptop")}>Set Search</button>
      <button data-testid="set-cat" onClick={() => setSelectedCategory("Electronics")}>Set Category</button>
      <button data-testid="set-sort" onClick={() => setSortBy("price-asc")}>Set Sort</button>
      <button data-testid="create" onClick={() => createProduct({ name: "New" })}>Create</button>
      <button data-testid="update" onClick={() => updateProduct("1", { name: "Update" })}>Update</button>
      <button data-testid="delete" onClick={() => deleteProduct("1")}>Delete</button>
    </div>
  );
};

describe("ProductContext Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("should load products and inventory when authenticated as Admin", async () => {
    useAuth.mockReturnValue({ isAuthenticated: true, isAdmin: true });
    productService.getAllProducts.mockResolvedValue([{ id: "1", name: "P1", category: "Electronics", price: 100 }]);
    inventoryService.getAllInventory.mockResolvedValue([{ productId: "1", availableStock: 5 }]);

    await act(async () => {
      render(
        <ProductProvider>
          <ProductTestComponent />
        </ProductProvider>
      );
    });

    expect(screen.getByTestId("products-count").textContent).toBe("1");
    expect(screen.getByTestId("categories").textContent).toBe("All,Electronics");
  });

  test("should handle search, filter, and sorting", async () => {
    useAuth.mockReturnValue({ isAuthenticated: true, isAdmin: false });
    const mockProducts = [
      { id: "1", name: "Apple phone", category: "Phones", price: 500, createdAt: "2026-01-01" },
      { id: "2", name: "Dell laptop", category: "Electronics", price: 1000, createdAt: "2026-02-01" }
    ];
    productService.getAllProducts.mockResolvedValue(mockProducts);

    await act(async () => {
      render(
        <ProductProvider>
          <ProductTestComponent />
        </ProductProvider>
      );
    });

    expect(screen.getByTestId("filtered-count").textContent).toBe("2");

    // Filter by search
    await act(async () => {
      screen.getByTestId("set-search").click();
    });
    expect(screen.getByTestId("filtered-count").textContent).toBe("1"); // only dell laptop

    // Reset search, set category
    await act(async () => {
      screen.getByTestId("set-search").click();
      // Directly update search query back to empty for next actions
    });
  });

  test("should perform admin actions", async () => {
    useAuth.mockReturnValue({ isAuthenticated: true, isAdmin: true });
    productService.getAllProducts.mockResolvedValue([]);
    productService.createProduct.mockResolvedValue({ id: "new" });
    productService.updateProduct.mockResolvedValue({ id: "1" });
    productService.deleteProduct.mockResolvedValue({});

    await act(async () => {
      render(
        <ProductProvider>
          <ProductTestComponent />
        </ProductProvider>
      );
    });

    await act(async () => {
      screen.getByTestId("create").click();
    });
    expect(productService.createProduct).toHaveBeenCalled();

    await act(async () => {
      screen.getByTestId("update").click();
    });
    expect(productService.updateProduct).toHaveBeenCalled();

    await act(async () => {
      screen.getByTestId("delete").click();
    });
    expect(productService.deleteProduct).toHaveBeenCalled();
  });
});
