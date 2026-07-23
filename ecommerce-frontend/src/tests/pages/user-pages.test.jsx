import React from "react";
import { describe, test, expect, vi, beforeEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import userEvent from "@testing-library/user-event";

import { CartPage } from "../../pages/user/CartPage";
import { CheckoutPage } from "../../pages/user/CheckoutPage";
import { MyOrdersPage } from "../../pages/user/MyOrdersPage";
import { OrderDetailsPage } from "../../pages/user/OrderDetailsPage";
import { OrderSuccessPage } from "../../pages/user/OrderSuccessPage";
import { ProfilePage } from "../../pages/user/ProfilePage";

import { useAuth } from "../../contexts/AuthContext";
import { useCart } from "../../contexts/CartContext";
import { useOrders } from "../../contexts/OrderContext";
import { orderService } from "../../services/orderService";

vi.mock("../../contexts/AuthContext", () => ({
  useAuth: vi.fn()
}));

vi.mock("../../contexts/CartContext", () => ({
  useCart: vi.fn()
}));

vi.mock("../../contexts/OrderContext", () => {
  const mockUse = vi.fn();
  return {
    useOrders: mockUse,
    useOrder: mockUse
  };
});

vi.mock("../../services/orderService", () => ({
  orderService: {
    getOrderById: vi.fn(),
    getMyOrders: vi.fn(),
    getAllOrders: vi.fn(),
    createOrder: vi.fn(),
    updateOrderStatus: vi.fn()
  }
}));

vi.mock("../../components/forms/AddressForm", () => ({
  AddressForm: ({ onSubmit }) => (
    <button
      data-testid="mock-address-submit"
      onClick={() => onSubmit({
        customerName: "John Doe",
        email: "john@example.com",
        phone: "1234567890",
        country: "India",
        street: "123 Main St",
        city: "Bangalore",
        state: "Karnataka",
        zipCode: "560001"
      })}
    >
      Deliver to this Address
    </button>
  )
}));

describe("User Pages Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("CartPage renders list of cart items and handles delete / update quantity", async () => {
    const mockUpdateQuantity = vi.fn();
    const mockRemoveFromCart = vi.fn();

    useCart.mockReturnValue({
      cartItems: [
        { productId: "p1", productName: "Item A", price: 10, quantity: 2, subtotal: 20, imageUrl: "" }
      ],
      subtotal: 20,
      updateQuantity: mockUpdateQuantity,
      removeFromCart: mockRemoveFromCart,
      loading: false
    });

    render(
      <MemoryRouter>
        <CartPage />
      </MemoryRouter>
    );

    expect(screen.getByText("Item A")).toBeInTheDocument();
    expect(screen.getAllByText("₹20").length).toBeGreaterThan(0);

    const removeBtn = screen.getByRole("button", { name: /Remove/i });
    await act(async () => {
      await userEvent.click(removeBtn);
    });
    expect(mockRemoveFromCart).toHaveBeenCalledWith("p1");
  });

  test("CheckoutPage renders form and handles order submission and payment complete", async () => {
    useAuth.mockReturnValue({
      user: { name: "John", email: "john@example.com" }
    });

    useCart.mockReturnValue({
      cartItems: [{ productId: "p1", productName: "Item A", price: 10, quantity: 2, subtotal: 20 }],
      subtotal: 20
    });

    const mockCreateOrder = vi.fn().mockResolvedValue({ orderId: "o123", total: 20 });
    const mockProcessPayment = vi.fn().mockResolvedValue({ success: true, order: { orderId: "o123" } });

    useOrders.mockReturnValue({
      createOrder: mockCreateOrder,
      processPaymentAndCompleteOrder: mockProcessPayment,
      loading: false
    });

    render(
      <MemoryRouter>
        <CheckoutPage />
      </MemoryRouter>
    );

    expect(screen.getByText("Item A")).toBeInTheDocument();

    // Trigger mock address form submit to proceed to step 2
    const deliverBtn = screen.getByTestId("mock-address-submit");
    await act(async () => {
      await userEvent.click(deliverBtn);
    });

    // Step 2: Click Payment button
    const submitBtn = screen.getByRole("button", { name: /Complete Order/i });
    await act(async () => {
      await userEvent.click(submitBtn);
    });

    expect(mockCreateOrder).toHaveBeenCalled();
  });

  test("MyOrdersPage lists user orders", () => {
    useOrders.mockReturnValue({
      orders: [
        { orderId: "o1", total: 100, status: "PLACED", createdAt: "2026-07-22T00:00:00.000Z" }
      ],
      loading: false
    });

    render(
      <MemoryRouter>
        <MyOrdersPage />
      </MemoryRouter>
    );

    expect(screen.getByText("o1")).toBeInTheDocument();
    expect(screen.getByText("₹100")).toBeInTheDocument();
  });

  test("OrderDetailsPage displays order details", async () => {
    useOrders.mockReturnValue({
      orders: [],
      loading: false
    });

    orderService.getOrderById.mockResolvedValue({
      orderId: "o1",
      total: 100,
      status: "PLACED",
      shippingAddress: "123 St",
      phone: "999999",
      createdAt: "2026-07-22T00:00:00.000Z",
      items: [{ productId: "p1", productName: "Item A", quantity: 2, price: 50, subtotal: 100 }]
    });

    await act(async () => {
      render(
        <MemoryRouter initialEntries={["/order/o1"]}>
          <Routes>
            <Route path="/order/:orderId" element={<OrderDetailsPage />} />
          </Routes>
        </MemoryRouter>
      );
    });

    expect(screen.getByText("o1")).toBeInTheDocument();
    expect(screen.getByText("Item A")).toBeInTheDocument();
  });

  test("OrderSuccessPage displays success info", () => {
    render(
      <MemoryRouter initialEntries={[{ state: { order: { orderId: "o123" } } }]}>
        <OrderSuccessPage />
      </MemoryRouter>
    );

    expect(screen.getByText("o123")).toBeInTheDocument();
  });

  test("ProfilePage displays profile details", () => {
    useAuth.mockReturnValue({
      user: { name: "Jane Doe", email: "jane@example.com", role: "User" }
    });

    render(
      <MemoryRouter>
        <ProfilePage />
      </MemoryRouter>
    );

    expect(screen.getByText("Jane Doe")).toBeInTheDocument();
    expect(screen.getByText("jane@example.com")).toBeInTheDocument();
  });
});
