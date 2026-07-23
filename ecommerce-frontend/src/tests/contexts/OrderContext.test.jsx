import React from "react";
import { describe, test, expect, vi, beforeEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { OrderProvider, useOrders } from "../../contexts/OrderContext";
import { orderService } from "../../services/orderService";
import { paymentService } from "../../services/paymentService";
import { useAuth } from "../../contexts/AuthContext";
import { useCart } from "../../contexts/CartContext";

vi.mock("../../services/orderService", () => ({
  orderService: {
    getMyOrders: vi.fn(),
    getAllOrders: vi.fn(),
    createOrder: vi.fn(),
    updateOrderStatus: vi.fn()
  }
}));

vi.mock("../../services/paymentService", () => ({
  paymentService: {
    createPayment: vi.fn(),
    confirmPaymentSuccess: vi.fn()
  }
}));

vi.mock("../../contexts/AuthContext", () => ({
  useAuth: vi.fn()
}));

vi.mock("../../contexts/CartContext", () => ({
  useCart: vi.fn()
}));

const OrderTestComponent = () => {
  const { orders, allAdminOrders, createOrder, processPaymentAndCompleteOrder, updateOrderStatus } = useOrders();
  return (
    <div>
      <span data-testid="orders-count">{orders.length}</span>
      <span data-testid="admin-orders-count">{allAdminOrders.length}</span>
      <button data-testid="create-btn" onClick={() => createOrder({ total: 100 })}>Create</button>
      <button
        data-testid="pay-btn"
        onClick={() =>
          processPaymentAndCompleteOrder({
            orderId: "o1",
            total: 100,
            items: [{ productId: "p1", quantity: 2 }]
          })
        }
      >
        Pay
      </button>
      <button data-testid="status-btn" onClick={() => updateOrderStatus("o1", "SHIPPED")}>Status</button>
    </div>
  );
};

describe("OrderContext Tests", () => {
  let mockClearCart;

  beforeEach(() => {
    vi.clearAllMocks();
    mockClearCart = vi.fn();
    useCart.mockReturnValue({ clearCart: mockClearCart });
  });

  test("should fetch user orders and admin orders when admin is logged in", async () => {
    useAuth.mockReturnValue({ isAuthenticated: true, isAdmin: true, user: { userId: "u1" } });
    orderService.getMyOrders.mockResolvedValue([{ orderId: "o1" }]);
    orderService.getAllOrders.mockResolvedValue([{ orderId: "o1" }, { orderId: "o2" }]);

    await act(async () => {
      render(
        <OrderProvider>
          <OrderTestComponent />
        </OrderProvider>
      );
    });

    expect(screen.getByTestId("orders-count").textContent).toBe("1");
    expect(screen.getByTestId("admin-orders-count").textContent).toBe("2");
  });

  test("should handle order creation", async () => {
    useAuth.mockReturnValue({ isAuthenticated: true, isAdmin: false, user: { userId: "u1" } });
    orderService.createOrder.mockResolvedValue({ orderId: "new-order" });

    await act(async () => {
      render(
        <OrderProvider>
          <OrderTestComponent />
        </OrderProvider>
      );
    });

    await act(async () => {
      screen.getByTestId("create-btn").click();
    });

    expect(orderService.createOrder).toHaveBeenCalledWith({ total: 100 });
  });

  test("should handle complete payment workflow", async () => {
    useAuth.mockReturnValue({ isAuthenticated: true, isAdmin: false, user: { userId: "u1", name: "Alice", email: "a@a.com" } });
    paymentService.createPayment.mockResolvedValue({ paymentId: "pay1" });
    paymentService.confirmPaymentSuccess.mockResolvedValue({ payment: { status: "SUCCESS" } });

    await act(async () => {
      render(
        <OrderProvider>
          <OrderTestComponent />
        </OrderProvider>
      );
    });

    await act(async () => {
      screen.getByTestId("pay-btn").click();
    });

    expect(paymentService.createPayment).toHaveBeenCalled();
    expect(paymentService.confirmPaymentSuccess).toHaveBeenCalledWith("pay1");
    expect(mockClearCart).toHaveBeenCalledWith("u1", ["p1"]);
  });

  test("should handle updating order status", async () => {
    useAuth.mockReturnValue({ isAuthenticated: true, isAdmin: true, user: { userId: "u1" } });
    orderService.updateOrderStatus.mockResolvedValue({ orderId: "o1", status: "SHIPPED" });

    await act(async () => {
      render(
        <OrderProvider>
          <OrderTestComponent />
        </OrderProvider>
      );
    });

    await act(async () => {
      screen.getByTestId("status-btn").click();
    });

    expect(orderService.updateOrderStatus).toHaveBeenCalledWith("o1", { status: "SHIPPED" });
  });
});
