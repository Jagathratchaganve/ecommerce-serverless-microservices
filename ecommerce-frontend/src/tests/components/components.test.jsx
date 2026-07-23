import React from "react";
import { describe, test, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";

import { CartItemCard } from "../../components/cards/CartItemCard";
import { OrderCard } from "../../components/cards/OrderCard";
import { ProductCard } from "../../components/cards/ProductCard";
import { StatCard } from "../../components/cards/StatCard";
import { InventoryFormModal } from "../../components/forms/InventoryFormModal";
import { ProductFormModal } from "../../components/forms/ProductFormModal";
import { DataTable } from "../../components/tables/DataTable";

import { useCart } from "../../contexts/CartContext";
import { useAuth } from "../../contexts/AuthContext";

vi.mock("../../contexts/CartContext", () => {
  const mockUse = vi.fn(() => ({
    updateQuantity: vi.fn(),
    removeFromCart: vi.fn(),
    addToCart: vi.fn()
  }));
  return {
    useCart: mockUse
  };
});

vi.mock("../../contexts/AuthContext", () => ({
  useAuth: vi.fn(() => ({
    isAuthenticated: true
  }))
}));

describe("Component Unit Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("CartItemCard", () => {
    const item = {
      productId: "p1",
      productName: "Laptop",
      price: 100,
      quantity: 2,
      subtotal: 200,
      imageUrl: ""
    };

    test("renders item details and handles increment/decrement", () => {
      const mockUpdate = vi.fn();
      const mockRemove = vi.fn();
      useCart.mockReturnValue({
        updateQuantity: mockUpdate,
        removeFromCart: mockRemove
      });

      render(<CartItemCard item={item} />);

      expect(screen.getByText("Laptop")).toBeInTheDocument();
      
      // Click increment
      fireEvent.click(screen.getByTitle("Increase quantity"));
      expect(mockUpdate).toHaveBeenCalledWith("p1", 3);

      // Click decrement
      fireEvent.click(screen.getByTitle("Decrease quantity"));
      expect(mockUpdate).toHaveBeenCalledWith("p1", 1);
    });

    test("handles decrement to zero (remove item)", () => {
      const mockUpdate = vi.fn();
      const mockRemove = vi.fn();
      useCart.mockReturnValue({
        updateQuantity: mockUpdate,
        removeFromCart: mockRemove
      });

      const singleItem = { ...item, quantity: 1 };
      render(<CartItemCard item={singleItem} />);

      fireEvent.click(screen.getByTitle("Decrease quantity"));
      expect(mockRemove).toHaveBeenCalledWith("p1");
    });
  });

  describe("OrderCard", () => {
    const order = {
      orderId: "o1",
      createdAt: "2026-07-22",
      status: "PLACED",
      total: 150,
      items: [
        { productName: "Mouse", quantity: 1 }
      ]
    };

    test("renders order details", () => {
      render(
        <BrowserRouter>
          <OrderCard order={order} />
        </BrowserRouter>
      );
      expect(screen.getByText("o1")).toBeInTheDocument();
      expect(screen.getByText("● PLACED")).toBeInTheDocument();
    });
  });

  describe("ProductCard", () => {
    const product = {
      id: "p1",
      name: "Super Phone",
      price: 500,
      discountPrice: 400,
      status: "ACTIVE",
      brand: "BrandX",
      imageUrl: ""
    };

    test("renders product card and handles actions", async () => {
      const mockAdd = vi.fn();
      useCart.mockReturnValue({ addToCart: mockAdd });
      useAuth.mockReturnValue({ isAuthenticated: true });

      render(
        <BrowserRouter>
          <ProductCard product={product} stockInfo={{ availableStock: 10 }} />
        </BrowserRouter>
      );

      expect(screen.getByText("Super Phone")).toBeInTheDocument();
      expect(screen.getByText("BrandX")).toBeInTheDocument();

      // Click Add to Cart
      await act(async () => {
        fireEvent.click(screen.getByRole("button", { name: /Cart/i }));
      });
      expect(mockAdd).toHaveBeenCalledWith(product, 1);
    });
  });

  describe("StatCard", () => {
    test("renders stat details", () => {
      render(<StatCard title="Total Revenue" value="$1000" change="+10%" color="emerald" />);
      expect(screen.getByText("Total Revenue")).toBeInTheDocument();
      expect(screen.getByText("$1000")).toBeInTheDocument();
    });
  });

  describe("InventoryFormModal", () => {
    test("renders when open and handles submit", async () => {
      const mockSubmit = vi.fn();
      const mockClose = vi.fn();
      const inventoryData = { productId: "p1", availableStock: 10, totalStock: 20 };

      render(
        <InventoryFormModal
          isOpen={true}
          onClose={mockClose}
          onSubmit={mockSubmit}
          inventoryData={inventoryData}
        />
      );

      expect(screen.getByText("Manage Inventory: p1")).toBeInTheDocument();
      
      // Submit form
      fireEvent.submit(screen.getByRole("button", { name: /Update Stock/i }).closest("form"));
      
      await vi.waitFor(() => {
        expect(mockSubmit).toHaveBeenCalled();
      });
    });
  });

  describe("ProductFormModal", () => {
    test("renders when open and handles submit", async () => {
      const mockSubmit = vi.fn();
      const mockClose = vi.fn();

      const { container } = render(
        <ProductFormModal
          isOpen={true}
          onClose={mockClose}
          onSubmit={mockSubmit}
        />
      );

      expect(screen.getByText("Add New Product")).toBeInTheDocument();
      
      // Fill form and submit
      fireEvent.change(container.querySelector('input[name="name"]'), { target: { value: "New Item" } });
      fireEvent.change(container.querySelector('input[name="brand"]'), { target: { value: "Apple" } });
      fireEvent.change(container.querySelector('input[name="price"]'), { target: { value: "100" } });
      fireEvent.change(container.querySelector('input[name="imageUrl"]'), { target: { value: "https://example.com/img.png" } });
      fireEvent.change(container.querySelector('select[name="category"]'), { target: { value: "Mobiles" } });
      
      fireEvent.submit(container.querySelector("form"));
      
      await vi.waitFor(() => {
        expect(mockSubmit).toHaveBeenCalled();
      });
    });
  });

  describe("DataTable", () => {
    test("renders items in list and table format", () => {
      const columns = [
        { header: "Name", key: "name" }
      ];
      const data = [
        { name: "Row A" }
      ];

      render(<DataTable columns={columns} data={data} searchPlaceholder="Search..." />);
      expect(screen.getByText("Row A")).toBeInTheDocument();
    });
  });
});
