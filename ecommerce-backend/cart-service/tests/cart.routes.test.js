process.env.COGNITO_USER_POOL_ID = "us-east-1_abcdefghi";
process.env.COGNITO_CLIENT_ID = "mock-client-id";
process.env.AWS_REGION = "us-east-1";

const request = require("supertest");
const app = require("../src/app");
const cartService = require("../src/services/cartService");

jest.mock("../src/services/cartService");
jest.mock("../src/services/logger", () => ({
    info: jest.fn(),
    error: jest.fn()
}));

// Mock Auth Middleware
jest.mock("../src/middleware/authenticate", () => (req, res, next) => {
    req.user = { userId: "user-123", groups: ["User"] };
    next();
});
jest.mock("../src/middleware/authorize", () => (...roles) => (req, res, next) => next());

describe("Cart Routes Tests", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("GET /api/cart", async () => {
        cartService.getCartByUserId.mockResolvedValue({ userId: "user-123", items: [] });

        const res = await request(app).get("/api/cart");

        expect(res.statusCode).toBe(200);
        expect(res.body.userId).toBe("user-123");
    });

    test("GET /api/cart/all (Admin)", async () => {
        cartService.getCarts.mockResolvedValue([{ userId: "user-123" }]);

        const res = await request(app).get("/api/cart/all");

        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual([{ userId: "user-123" }]);
    });

    test("POST /api/cart", async () => {
        cartService.createCart.mockResolvedValue({ userId: "user-123", items: [] });

        const res = await request(app).post("/api/cart");

        expect(res.statusCode).toBe(201);
    });

    test("POST /api/cart/items", async () => {
        cartService.addItemToCart.mockResolvedValue({ userId: "user-123", items: [{ productId: "p1" }] });

        const res = await request(app)
            .post("/api/cart/items")
            .send({ productId: "p1", quantity: 2 });

        expect(res.statusCode).toBe(200);
    });

    test("PUT /api/cart/items/:productId", async () => {
        cartService.updateCartItem.mockResolvedValue({ userId: "user-123", items: [{ productId: "p1", quantity: 5 }] });

        const res = await request(app)
            .put("/api/cart/items/p1")
            .send({ quantity: 5 });

        expect(res.statusCode).toBe(200);
    });

    test("DELETE /api/cart/items/:productId", async () => {
        cartService.removeCartItem.mockResolvedValue({ userId: "user-123", items: [] });

        const res = await request(app).delete("/api/cart/items/p1");

        expect(res.statusCode).toBe(200);
    });

    test("POST /api/cart/clear", async () => {
        cartService.removePurchasedItems.mockResolvedValue({ userId: "user-123", items: [] });

        const res = await request(app)
            .post("/api/cart/clear")
            .send({ userId: "user-123", productIds: ["p1"] });

        expect(res.statusCode).toBe(200);
    });

    test("DELETE /api/cart", async () => {
        cartService.deleteCart.mockResolvedValue({ userId: "user-123" });

        const res = await request(app).delete("/api/cart");

        expect(res.statusCode).toBe(200);
    });
});
