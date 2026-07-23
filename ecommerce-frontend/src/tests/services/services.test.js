import { describe, test, expect, vi, beforeEach } from "vitest";
import { authService } from "../../services/authService";
import { productService } from "../../services/productService";
import { inventoryService } from "../../services/inventoryService";
import { cartService } from "../../services/cartService";
import { orderService } from "../../services/orderService";
import { paymentService } from "../../services/paymentService";

const mockGet = vi.fn();
const mockPost = vi.fn();
const mockPut = vi.fn();
const mockDelete = vi.fn();

vi.mock("../../services/api", () => {
  const mockInstance = {
    get: (...args) => mockGet(...args),
    post: (...args) => mockPost(...args),
    put: (...args) => mockPut(...args),
    delete: (...args) => mockDelete(...args)
  };
  return {
    authApi: mockInstance,
    productApi: mockInstance,
    inventoryApi: mockInstance,
    cartApi: mockInstance,
    orderApi: mockInstance,
    paymentApi: mockInstance
  };
});

describe("Frontend Services Tests", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe("authService", () => {
    test("healthCheck", async () => {
      mockGet.mockResolvedValueOnce({ data: { success: true } });
      const res = await authService.healthCheck();
      expect(mockGet).toHaveBeenCalledWith("/api/auth/health");
      expect(res).toEqual({ success: true });
    });

    test("signUp", async () => {
      mockPost.mockResolvedValueOnce({ data: { success: true } });
      await authService.signUp({ name: "A", email: "a@a.com", password: "pwd" });
      expect(mockPost).toHaveBeenCalledWith("/api/auth/signup", { name: "A", email: "a@a.com", password: "pwd" });
    });

    test("confirmSignUp", async () => {
      mockPost.mockResolvedValueOnce({ data: { success: true } });
      await authService.confirmSignUp({ email: "a@a.com", confirmationCode: "123" });
      expect(mockPost).toHaveBeenCalledWith("/api/auth/confirm-signup", { email: "a@a.com", confirmationCode: "123" });
    });

    test("login", async () => {
      mockPost.mockResolvedValueOnce({ data: { token: "1" } });
      await authService.login({ email: "a@a.com", password: "pwd" });
      expect(mockPost).toHaveBeenCalledWith("/api/auth/login", { email: "a@a.com", password: "pwd" });
    });

    test("adminCreateUser", async () => {
      mockPost.mockResolvedValueOnce({ data: {} });
      await authService.adminCreateUser({ name: "A", email: "a@a.com", password: "pwd", role: "Admin" });
      expect(mockPost).toHaveBeenCalledWith("/api/auth/admin/create-user", { name: "A", email: "a@a.com", password: "pwd", role: "Admin" });
    });
  });

  describe("productService", () => {
    test("getAllProducts", async () => {
      mockGet.mockResolvedValueOnce({ data: [] });
      await productService.getAllProducts();
      expect(mockGet).toHaveBeenCalledWith("/api/products");
    });

    test("getProductById", async () => {
      mockGet.mockResolvedValueOnce({ data: {} });
      await productService.getProductById("123");
      expect(mockGet).toHaveBeenCalledWith("/api/products/123");
    });

    test("createProduct", async () => {
      mockPost.mockResolvedValueOnce({ data: {} });
      await productService.createProduct({ name: "P1" });
      expect(mockPost).toHaveBeenCalledWith("/api/products", { name: "P1" });
    });

    test("updateProduct", async () => {
      mockPut.mockResolvedValueOnce({ data: {} });
      await productService.updateProduct("123", { name: "P2" });
      expect(mockPut).toHaveBeenCalledWith("/api/products/123", { name: "P2" });
    });

    test("deleteProduct", async () => {
      mockDelete.mockResolvedValueOnce({ data: {} });
      await productService.deleteProduct("123");
      expect(mockDelete).toHaveBeenCalledWith("/api/products/123");
    });
  });

  describe("inventoryService", () => {
    test("getAllInventory", async () => {
      mockGet.mockResolvedValueOnce({ data: [] });
      await inventoryService.getAllInventory();
      expect(mockGet).toHaveBeenCalledWith("/api/inventory");
    });

    test("getInventoryByProductId", async () => {
      mockGet.mockResolvedValueOnce({ data: {} });
      await inventoryService.getInventoryByProductId("p1");
      expect(mockGet).toHaveBeenCalledWith("/api/inventory/p1");
    });

    test("createInventory", async () => {
      mockPost.mockResolvedValueOnce({ data: {} });
      await inventoryService.createInventory({ totalStock: 10 });
      expect(mockPost).toHaveBeenCalledWith("/api/inventory", { totalStock: 10 });
    });

    test("updateInventory", async () => {
      mockPut.mockResolvedValueOnce({ data: {} });
      await inventoryService.updateInventory("p1", { totalStock: 10 });
      expect(mockPut).toHaveBeenCalledWith("/api/inventory/p1", { totalStock: 10 });
    });

    test("deleteInventory", async () => {
      mockDelete.mockResolvedValueOnce({ data: {} });
      await inventoryService.deleteInventory("p1");
      expect(mockDelete).toHaveBeenCalledWith("/api/inventory/p1");
    });
  });

  describe("cartService", () => {
    test("getMyCart", async () => {
      mockGet.mockResolvedValueOnce({ data: {} });
      await cartService.getMyCart();
      expect(mockGet).toHaveBeenCalledWith("/api/cart");
    });

    test("createCart", async () => {
      mockPost.mockResolvedValueOnce({ data: {} });
      await cartService.createCart();
      expect(mockPost).toHaveBeenCalledWith("/api/cart");
    });

    test("addItemToCart", async () => {
      mockPost.mockResolvedValueOnce({ data: {} });
      await cartService.addItemToCart({ productId: "p1", quantity: 2 });
      expect(mockPost).toHaveBeenCalledWith("/api/cart/items", { productId: "p1", quantity: 2 });
    });

    test("updateCartItem", async () => {
      mockPut.mockResolvedValueOnce({ data: {} });
      await cartService.updateCartItem("p1", 5);
      expect(mockPut).toHaveBeenCalledWith("/api/cart/items/p1", { quantity: 5 });
    });

    test("removeCartItem", async () => {
      mockDelete.mockResolvedValueOnce({ data: {} });
      await cartService.removeCartItem("p1");
      expect(mockDelete).toHaveBeenCalledWith("/api/cart/items/p1");
    });

    test("removePurchasedItems", async () => {
      mockPost.mockResolvedValueOnce({ data: {} });
      await cartService.removePurchasedItems("u1", ["p1"]);
      expect(mockPost).toHaveBeenCalledWith("/api/cart/clear", { userId: "u1", productIds: ["p1"] });
    });

    test("getAllCarts", async () => {
      mockGet.mockResolvedValueOnce({ data: [] });
      await cartService.getAllCarts();
      expect(mockGet).toHaveBeenCalledWith("/api/cart/all");
    });

    test("deleteCart", async () => {
      mockDelete.mockResolvedValueOnce({ data: {} });
      await cartService.deleteCart();
      expect(mockDelete).toHaveBeenCalledWith("/api/cart");
    });
  });

  describe("orderService", () => {
    test("getAllOrders", async () => {
      mockGet.mockResolvedValueOnce({ data: [] });
      await orderService.getAllOrders();
      expect(mockGet).toHaveBeenCalledWith("/api/orders/all");
    });

    test("getMyOrders", async () => {
      mockGet.mockResolvedValueOnce({ data: [] });
      await orderService.getMyOrders();
      expect(mockGet).toHaveBeenCalledWith("/api/orders/my");
    });

    test("getOrderById", async () => {
      mockGet.mockResolvedValueOnce({ data: {} });
      await orderService.getOrderById("o1");
      expect(mockGet).toHaveBeenCalledWith("/api/orders/o1");
    });

    test("createOrder", async () => {
      mockPost.mockResolvedValueOnce({ data: {} });
      await orderService.createOrder({ items: [] });
      expect(mockPost).toHaveBeenCalledWith("/api/orders", { items: [] });
    });

    test("updateOrderStatus", async () => {
      mockPut.mockResolvedValueOnce({ data: {} });
      await orderService.updateOrderStatus("o1", { status: "SHIPPED" });
      expect(mockPut).toHaveBeenCalledWith("/api/orders/o1/status", { status: "SHIPPED" });
    });

    test("deleteOrder", async () => {
      mockDelete.mockResolvedValueOnce({ data: {} });
      await orderService.deleteOrder("o1");
      expect(mockDelete).toHaveBeenCalledWith("/api/orders/o1");
    });
  });

  describe("paymentService", () => {
    test("getAllPayments", async () => {
      mockGet.mockResolvedValueOnce({ data: [] });
      await paymentService.getAllPayments();
      expect(mockGet).toHaveBeenCalledWith("/api/payments");
    });

    test("createPayment", async () => {
      mockPost.mockResolvedValueOnce({ data: {} });
      await paymentService.createPayment({ amount: 100 });
      expect(mockPost).toHaveBeenCalledWith("/api/payments", { amount: 100 });
    });

    test("confirmPaymentSuccess", async () => {
      mockPost.mockResolvedValueOnce({ data: {} });
      await paymentService.confirmPaymentSuccess("pay1");
      expect(mockPost).toHaveBeenCalledWith("/api/payments/pay1/success");
    });

    test("getPaymentById", async () => {
      mockGet.mockResolvedValueOnce({ data: {} });
      await paymentService.getPaymentById("pay1");
      expect(mockGet).toHaveBeenCalledWith("/api/payments/pay1");
    });

    test("updatePayment", async () => {
      mockPut.mockResolvedValueOnce({ data: {} });
      await paymentService.updatePayment("pay1", { status: "SUCCESS" });
      expect(mockPut).toHaveBeenCalledWith("/api/payments/pay1", { status: "SUCCESS" });
    });

    test("deletePayment", async () => {
      mockDelete.mockResolvedValueOnce({ data: {} });
      await paymentService.deletePayment("pay1");
      expect(mockDelete).toHaveBeenCalledWith("/api/payments/pay1");
    });
  });
});
