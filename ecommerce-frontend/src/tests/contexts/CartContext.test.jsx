import React from "react";
import { describe, test, expect, vi, beforeEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { CartProvider, useCart } from "../../contexts/CartContext";
import { cartService } from "../../services/cartService";
import { useAuth } from "../../contexts/AuthContext";

vi.mock("../../services/cartService", () => ({
  cartService: {
    getMyCart: vi.fn(),
    addItemToCart: vi.fn(),
    updateCartItem: vi.fn(),
    removeCartItem: vi.fn(),
    removePurchasedItems: vi.fn()
  }
}));

vi.mock("../../contexts/AuthContext", () => ({
  useAuth: vi.fn()
}));

const CartTestComponent = () => {
  const { cart, cartItems, itemCount, subtotal, addToCart, updateQuantity, removeFromCart, clearCart } = useCart();
  return (
    <div>
      <span data-testid="cart-items-count">{cartItems.length}</span>
      <span data-testid="item-count">{itemCount}</span>
      <span data-testid="subtotal">{subtotal}</span>
      <button data-testid="add-btn" onClick={() => addToCart({ id: "p1", name: "P1", price: 100 }, 2)}>Add</button>
      <button data-testid="update-btn" onClick={() => updateQuantity("p1", 5)}>Update</button>
      <button data-testid="remove-btn" onClick={() => removeFromCart("p1")}>Remove</button>
      <button data-testid="clear-btn" onClick={() => clearCart("u1", ["p1"])}>Clear</button>
    </div>
  );
};

describe("CartContext Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("should fetch cart when authenticated", async () => {
    useAuth.mockReturnValue({ isAuthenticated: true });
    cartService.getMyCart.mockResolvedValue({
      items: [{ productId: "p1", quantity: 2, subtotal: 200 }],
      subtotal: 200
    });

    await act(async () => {
      render(
        <CartProvider>
          <CartTestComponent />
        </CartProvider>
      );
    });

    expect(screen.getByTestId("cart-items-count").textContent).toBe("1");
    expect(screen.getByTestId("item-count").textContent).toBe("2");
    expect(screen.getByTestId("subtotal").textContent).toBe("200");
  });

  test("should clear cart on logout", async () => {
    useAuth.mockReturnValue({ isAuthenticated: false });

    await act(async () => {
      render(
        <CartProvider>
          <CartTestComponent />
        </CartProvider>
      );
    });

    expect(screen.getByTestId("cart-items-count").textContent).toBe("0");
    expect(screen.getByTestId("subtotal").textContent).toBe("0");
  });

  test("should handle add to cart", async () => {
    useAuth.mockReturnValue({ isAuthenticated: true });
    cartService.getMyCart.mockResolvedValue({ items: [], subtotal: 0 });
    cartService.addItemToCart.mockResolvedValue({
      items: [{ productId: "p1", quantity: 2, price: 100, subtotal: 200 }],
      subtotal: 200
    });

    await act(async () => {
      render(
        <CartProvider>
          <CartTestComponent />
        </CartProvider>
      );
    });

    await act(async () => {
      screen.getByTestId("add-btn").click();
    });

    expect(screen.getByTestId("cart-items-count").textContent).toBe("1");
    expect(screen.getByTestId("item-count").textContent).toBe("2");
  });

  test("should block add to cart if unauthenticated", async () => {
    useAuth.mockReturnValue({ isAuthenticated: false });

    await act(async () => {
      render(
        <CartProvider>
          <CartTestComponent />
        </CartProvider>
      );
    });

    await act(async () => {
      screen.getByTestId("add-btn").click();
    });

    expect(cartService.addItemToCart).not.toHaveBeenCalled();
  });

  test("should handle update quantity", async () => {
    useAuth.mockReturnValue({ isAuthenticated: true });
    cartService.getMyCart.mockResolvedValue({ items: [{ productId: "p1", quantity: 2, subtotal: 200 }], subtotal: 200 });
    cartService.updateCartItem.mockResolvedValue({
      items: [{ productId: "p1", quantity: 5, price: 100, subtotal: 500 }],
      subtotal: 500
    });

    await act(async () => {
      render(
        <CartProvider>
          <CartTestComponent />
        </CartProvider>
      );
    });

    await act(async () => {
      screen.getByTestId("update-btn").click();
    });

    expect(screen.getByTestId("item-count").textContent).toBe("5");
    expect(screen.getByTestId("subtotal").textContent).toBe("500");
  });

  test("should handle remove from cart", async () => {
    useAuth.mockReturnValue({ isAuthenticated: true });
    cartService.getMyCart.mockResolvedValue({ items: [{ productId: "p1", quantity: 2, subtotal: 200 }], subtotal: 200 });
    cartService.removeCartItem.mockResolvedValue({ items: [], subtotal: 0 });

    await act(async () => {
      render(
        <CartProvider>
          <CartTestComponent />
        </CartProvider>
      );
    });

    await act(async () => {
      screen.getByTestId("remove-btn").click();
    });

    expect(screen.getByTestId("cart-items-count").textContent).toBe("0");
  });

  test("should handle clear cart", async () => {
    useAuth.mockReturnValue({ isAuthenticated: true });
    cartService.getMyCart.mockResolvedValue({ items: [{ productId: "p1", quantity: 2 }], subtotal: 200 });
    cartService.removePurchasedItems.mockResolvedValue({ cart: { items: [], subtotal: 0 } });

    await act(async () => {
      render(
        <CartProvider>
          <CartTestComponent />
        </CartProvider>
      );
    });

    await act(async () => {
      screen.getByTestId("clear-btn").click();
    });

    expect(screen.getByTestId("cart-items-count").textContent).toBe("0");
  });
});
