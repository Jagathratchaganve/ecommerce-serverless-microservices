const cartController = require("../src/controllers/cartController");
const cartService = require("../src/services/cartService");

jest.mock("../src/services/cartService");

describe("Cart Controller Tests", () => {
    let req, res;

    beforeEach(() => {
        jest.clearAllMocks();
        req = {
            user: { userId: "user-123" },
            params: {},
            body: {},
            headers: {}
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
    });

    describe("getAllCarts", () => {
        test("should return all carts on success", async () => {
            const mockCarts = [{ userId: "u1" }];
            cartService.getCarts.mockResolvedValue(mockCarts);

            await cartController.getAllCarts(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(mockCarts);
        });

        test("should return 500 on error", async () => {
            cartService.getCarts.mockRejectedValue(new Error("Db error"));

            await cartController.getAllCarts(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ success: false, message: "Db error" });
        });
    });

    describe("getMyCart", () => {
        test("should return user cart", async () => {
            const mockCart = { userId: "user-123", items: [] };
            cartService.getCartByUserId.mockResolvedValue(mockCart);

            await cartController.getMyCart(req, res);

            expect(cartService.getCartByUserId).toHaveBeenCalledWith("user-123");
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(mockCart);
        });

        test("should return 500 on failure", async () => {
            cartService.getCartByUserId.mockRejectedValue(new Error("Err"));

            await cartController.getMyCart(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
        });
    });

    describe("createCart", () => {
        test("should return 201 and new cart", async () => {
            const mockCart = { userId: "user-123", items: [] };
            cartService.createCart.mockResolvedValue(mockCart);

            await cartController.createCart(req, res);

            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith(mockCart);
        });

        test("should return 500 on failure", async () => {
            cartService.createCart.mockRejectedValue(new Error("Err"));

            await cartController.createCart(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
        });
    });

    describe("addItemToCart", () => {
        test("should return 200 on success", async () => {
            const mockCart = { userId: "user-123", items: [{ productId: "p1" }] };
            req.body = { productId: "p1", quantity: 1 };
            req.headers.authorization = "Bearer tok";
            cartService.addItemToCart.mockResolvedValue(mockCart);

            await cartController.addItemToCart(req, res);

            expect(cartService.addItemToCart).toHaveBeenCalledWith("user-123", req.body, "Bearer tok");
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(mockCart);
        });

        test("should return 404 if product does not exist", async () => {
            cartService.addItemToCart.mockRejectedValue(new Error("Product does not exist"));

            await cartController.addItemToCart(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
        });

        test("should return 400 if stock is insufficient", async () => {
            cartService.addItemToCart.mockRejectedValue(new Error("Insufficient inventory"));

            await cartController.addItemToCart(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
        });

        test("should return 500 on other errors", async () => {
            cartService.addItemToCart.mockRejectedValue(new Error("Network Error"));

            await cartController.addItemToCart(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
        });
    });

    describe("updateCartItem", () => {
        test("should return 200 on success", async () => {
            const mockCart = { userId: "user-123", items: [{ productId: "p1" }] };
            req.params.productId = "p1";
            req.body.quantity = 5;
            req.headers.authorization = "Bearer tok";
            cartService.updateCartItem.mockResolvedValue(mockCart);

            await cartController.updateCartItem(req, res);

            expect(cartService.updateCartItem).toHaveBeenCalledWith("user-123", "p1", 5, "Bearer tok");
            expect(res.status).toHaveBeenCalledWith(200);
        });

        test("should return 404 if cart or item not found", async () => {
            req.params.productId = "p1";
            req.body.quantity = 5;
            cartService.updateCartItem.mockResolvedValue(null);

            await cartController.updateCartItem(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
        });

        test("should return 500 on update error", async () => {
            req.params.productId = "p1";
            req.body.quantity = 5;
            cartService.updateCartItem.mockRejectedValue(new Error("Update failed"));

            await cartController.updateCartItem(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
        });
    });

    describe("removeCartItem", () => {
        test("should return 200 and updated cart", async () => {
            const mockCart = { userId: "user-123", items: [] };
            req.params.productId = "p1";
            cartService.removeCartItem.mockResolvedValue(mockCart);

            await cartController.removeCartItem(req, res);

            expect(cartService.removeCartItem).toHaveBeenCalledWith("user-123", "p1");
            expect(res.status).toHaveBeenCalledWith(200);
        });

        test("should return 404 if not found", async () => {
            req.params.productId = "p1";
            cartService.removeCartItem.mockResolvedValue(null);

            await cartController.removeCartItem(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
        });

        test("should return 500 on error", async () => {
            req.params.productId = "p1";
            cartService.removeCartItem.mockRejectedValue(new Error("Removal failed"));

            await cartController.removeCartItem(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
        });
    });

    describe("removePurchasedItems", () => {
        test("should clear cart and return 200", async () => {
            const mockCart = { userId: "user-123", items: [] };
            req.body = { userId: "user-123", productIds: ["p1"] };
            cartService.removePurchasedItems.mockResolvedValue(mockCart);

            await cartController.removePurchasedItems(req, res);

            expect(cartService.removePurchasedItems).toHaveBeenCalledWith("user-123", ["p1"]);
            expect(res.status).toHaveBeenCalledWith(200);
        });

        test("should clear cart and return 200 with default userId and productIds", async () => {
            const mockCart = { userId: "user-123", items: [] };
            req.body = {};
            cartService.removePurchasedItems.mockResolvedValue(mockCart);

            await cartController.removePurchasedItems(req, res);

            expect(cartService.removePurchasedItems).toHaveBeenCalledWith("user-123", []);
            expect(res.status).toHaveBeenCalledWith(200);
        });

        test("should return 500 on error", async () => {
            req.body = { userId: "user-123", productIds: ["p1"] };
            cartService.removePurchasedItems.mockRejectedValue(new Error("Clear failed"));

            await cartController.removePurchasedItems(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
        });
    });

    describe("deleteCart", () => {
        test("should return 200 on success", async () => {
            cartService.deleteCart.mockResolvedValue({ userId: "user-123" });

            await cartController.deleteCart(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
        });

        test("should return 404 if not found", async () => {
            cartService.deleteCart.mockResolvedValue(null);

            await cartController.deleteCart(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
        });

        test("should return 500 on delete error", async () => {
            cartService.deleteCart.mockRejectedValue(new Error("Delete failed"));

            await cartController.deleteCart(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
        });
    });
});
