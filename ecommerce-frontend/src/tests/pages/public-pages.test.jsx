import React from "react";
import { describe, test, expect, vi, beforeEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import userEvent from "@testing-library/user-event";

import { LoginPage } from "../../pages/public/LoginPage";
import { SignupPage } from "../../pages/public/SignupPage";
import { ConfirmSignupPage } from "../../pages/public/ConfirmSignupPage";
import { HomePage } from "../../pages/public/HomePage";
import { ProductListingPage } from "../../pages/public/ProductListingPage";
import { ProductDetailsPage } from "../../pages/public/ProductDetailsPage";
import { NotFoundPage } from "../../pages/public/NotFoundPage";

import { useAuth } from "../../contexts/AuthContext";
import { useProducts } from "../../contexts/ProductContext";
import { useCart } from "../../contexts/CartContext";
import { productService } from "../../services/productService";

vi.mock("../../contexts/AuthContext", () => ({
  useAuth: vi.fn()
}));

vi.mock("../../contexts/ProductContext", () => ({
  useProducts: vi.fn()
}));

vi.mock("../../contexts/CartContext", () => {
  const mockUse = vi.fn(() => ({
    addToCart: vi.fn()
  }));
  return {
    useCart: mockUse
  };
});

vi.mock("../../services/productService", () => ({
  productService: {
    getProductById: vi.fn()
  }
}));

vi.mock("../../services/inventoryService", () => ({
  inventoryService: {
    getInventoryByProductId: vi.fn().mockResolvedValue({ availableStock: 5 })
  }
}));

describe("Public Pages Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("LoginPage handles form submit and navigation", async () => {
    const mockLogin = vi.fn().mockResolvedValue({ success: true, user: { name: "Bob" } });
    useAuth.mockReturnValue({ login: mockLogin });

    const { container } = render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );

    const emailInput = container.querySelector('input[name="email"]');
    const passwordInput = container.querySelector('input[name="password"]');
    const submitBtn = screen.getByRole("button", { name: /Login/i });

    await userEvent.type(emailInput, "test@example.com");
    await userEvent.type(passwordInput, "password123");

    await act(async () => {
      await userEvent.click(submitBtn);
    });

    expect(mockLogin).toHaveBeenCalledWith("test@example.com", "password123");
  });

  test("SignupPage handles registration form submit", async () => {
    const mockSignup = vi.fn().mockResolvedValue({ success: true });
    useAuth.mockReturnValue({ signup: mockSignup });

    const { container } = render(
      <MemoryRouter>
        <SignupPage />
      </MemoryRouter>
    );

    const nameInput = container.querySelector('input[name="name"]');
    const emailInput = container.querySelector('input[name="email"]');
    const passwordInput = container.querySelector('input[name="password"]');
    const submitBtn = screen.getByRole("button", { name: /Continue/i });

    await userEvent.type(nameInput, "Alice");
    await userEvent.type(emailInput, "alice@example.com");
    await userEvent.type(passwordInput, "password123");

    await act(async () => {
      await userEvent.click(submitBtn);
    });

    expect(mockSignup).toHaveBeenCalledWith("Alice", "alice@example.com", "password123");
  });

  test("ConfirmSignupPage handles verification code submit", async () => {
    const mockConfirm = vi.fn().mockResolvedValue({ success: true });
    useAuth.mockReturnValue({ confirmSignup: mockConfirm });

    const { container } = render(
      <MemoryRouter>
        <ConfirmSignupPage />
      </MemoryRouter>
    );

    const codeInput = container.querySelector('input[name="confirmationCode"]');
    const emailInput = container.querySelector('input[name="email"]');
    const submitBtn = screen.getByRole("button", { name: /Verify & Activate/i });

    await userEvent.type(emailInput, "alice@example.com");
    await userEvent.type(codeInput, "123456");

    await act(async () => {
      await userEvent.click(submitBtn);
    });

    expect(mockConfirm).toHaveBeenCalledWith("alice@example.com", "123456");
  });

  test("HomePage renders categories and trending products", () => {
    const products = [{ id: "1", name: "Super Laptop", price: 1000, category: "Laptops" }];
    useProducts.mockReturnValue({
      products,
      filteredProducts: products,
      inventoryMap: { "1": { availableStock: 5 } },
      loading: false
    });

    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    );

    expect(screen.getByText("Super Laptop")).toBeInTheDocument();
    expect(screen.getByText("Trending Products")).toBeInTheDocument();
  });

  test("ProductListingPage lists products and handles search", async () => {
    const products = [{ id: "1", name: "Super Laptop", price: 1000, category: "Laptops" }];
    useProducts.mockReturnValue({
      products,
      filteredProducts: products,
      inventoryMap: { "1": { availableStock: 5 } },
      categories: ["All", "Laptops"],
      searchQuery: "",
      setSearchQuery: vi.fn(),
      loading: false
    });

    render(
      <MemoryRouter>
        <ProductListingPage />
      </MemoryRouter>
    );

    expect(screen.getByText("Super Laptop")).toBeInTheDocument();
  });

  test("ProductDetailsPage shows product and handles addToCart", async () => {
    productService.getProductById.mockResolvedValue({
      id: "1", name: "Super Laptop", price: 1200, category: "Electronics", description: "Nice laptop", rating: 4.8
    });

    useProducts.mockReturnValue({
      inventoryMap: { "1": { availableStock: 5 } }
    });

    const mockAddToCart = vi.fn();
    useCart.mockReturnValue({
      addToCart: mockAddToCart
    });

    await act(async () => {
      render(
        <MemoryRouter initialEntries={["/product/1"]}>
          <Routes>
            <Route path="/product/:id" element={<ProductDetailsPage />} />
          </Routes>
        </MemoryRouter>
      );
    });

    expect(screen.getByText("Super Laptop")).toBeInTheDocument();
    expect(screen.getByText("Nice laptop")).toBeInTheDocument();
    expect(screen.getByText(/Only 5 items left/i)).toBeInTheDocument();

    const addBtn = screen.getByRole("button", { name: /Add to Cart/i });
    await act(async () => {
      await userEvent.click(addBtn);
    });

    expect(mockAddToCart).toHaveBeenCalled();
  });

  test("NotFoundPage renders correctly", () => {
    render(
      <MemoryRouter>
        <NotFoundPage />
      </MemoryRouter>
    );

    expect(screen.getByText("Page Not Found")).toBeInTheDocument();
  });
});
