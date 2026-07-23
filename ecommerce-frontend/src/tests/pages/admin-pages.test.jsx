import React from "react";
import { describe, test, expect, vi, beforeEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import userEvent from "@testing-library/user-event";

import { AdminDashboardPage } from "../../pages/admin/AdminDashboardPage";
import { AdminInventoryPage } from "../../pages/admin/AdminInventoryPage";
import { AdminOrdersPage } from "../../pages/admin/AdminOrdersPage";
import { AdminPaymentsPage } from "../../pages/admin/AdminPaymentsPage";
import { AdminProductsPage } from "../../pages/admin/AdminProductsPage";

import { useProducts } from "../../contexts/ProductContext";
import { productService } from "../../services/productService";
import { inventoryService } from "../../services/inventoryService";
import { orderService } from "../../services/orderService";
import { paymentService } from "../../services/paymentService";

vi.mock("../../contexts/ProductContext", () => ({
  useProducts: vi.fn()
}));

vi.mock("../../services/productService", () => ({
  productService: {
    getAllProducts: vi.fn()
  }
}));

vi.mock("../../services/inventoryService", () => ({
  inventoryService: {
    getAllInventory: vi.fn(),
    updateInventory: vi.fn()
  }
}));

vi.mock("../../services/orderService", () => ({
  orderService: {
    getAllOrders: vi.fn(),
    updateOrderStatus: vi.fn()
  }
}));

vi.mock("../../services/paymentService", () => ({
  paymentService: {
    getAllPayments: vi.fn()
  }
}));

describe("Admin Pages Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("AdminDashboardPage renders statistics correctly", async () => {
    productService.getAllProducts.mockResolvedValue([{ id: "1" }, { id: "2" }]);
    inventoryService.getAllInventory.mockResolvedValue([{ productId: "1", totalStock: 10 }]);
    orderService.getAllOrders.mockResolvedValue([{ orderId: "o1", total: 150, status: "PLACED" }]);
    paymentService.getAllPayments.mockResolvedValue([{ paymentId: "p1", status: "SUCCESS", amount: 150 }]);

    await act(async () => {
      render(
        <MemoryRouter>
          <AdminDashboardPage />
        </MemoryRouter>
      );
    });

    expect(await screen.findByText("Active Products")).toBeInTheDocument();
    expect(await screen.findByText("Total Revenue")).toBeInTheDocument();
  });

  test("AdminInventoryPage displays and handles stock updates", async () => {
    inventoryService.getAllInventory.mockResolvedValue([
      { productId: "p1", productName: "Laptop", availableStock: 5, totalStock: 10 }
    ]);
    inventoryService.updateInventory.mockResolvedValue({ success: true });

    await act(async () => {
      render(
        <MemoryRouter>
          <AdminInventoryPage />
        </MemoryRouter>
      );
    });

    expect(await screen.findByText("p1")).toBeInTheDocument();
    expect(await screen.findByText("5 units")).toBeInTheDocument();
  });

  test("AdminOrdersPage displays orders and handles status changes", async () => {
    const mockUpdateStatus = vi.fn().mockResolvedValue({});
    orderService.getAllOrders.mockResolvedValue([
      { orderId: "o1", customerName: "Bob", total: 100, status: "PLACED", createdAt: "2026-07-22" }
    ]);
    orderService.updateOrderStatus.mockImplementation(mockUpdateStatus);

    await act(async () => {
      render(
        <MemoryRouter>
          <AdminOrdersPage />
        </MemoryRouter>
      );
    });

    expect(await screen.findByText("Bob")).toBeInTheDocument();
    expect(await screen.findByText("o1")).toBeInTheDocument();
  });

  test("AdminPaymentsPage displays payment transaction logs", async () => {
    paymentService.getAllPayments.mockResolvedValue([
      { paymentId: "pay1", orderId: "o1", customerName: "Alice", email: "a@a.com", paymentMethod: "CARD", amount: 200, status: "SUCCESS", createdAt: "2026-07-22" }
    ]);

    await act(async () => {
      render(
        <MemoryRouter>
          <AdminPaymentsPage />
        </MemoryRouter>
      );
    });

    expect(await screen.findByText("pay1")).toBeInTheDocument();
    expect(await screen.findByText("Alice")).toBeInTheDocument();
  });

  test("AdminProductsPage handles add/edit product action dialogs", async () => {
    useProducts.mockReturnValue({
      products: [{ id: "1", name: "Dell", category: "Laptops", price: 800 }],
      createProduct: vi.fn(),
      updateProduct: vi.fn(),
      deleteProduct: vi.fn(),
      loading: false
    });

    await act(async () => {
      render(
        <MemoryRouter>
          <AdminProductsPage />
        </MemoryRouter>
      );
    });

    expect(await screen.findByText("Dell")).toBeInTheDocument();
    expect(await screen.findByText("Add New Product")).toBeInTheDocument();
  });
});
