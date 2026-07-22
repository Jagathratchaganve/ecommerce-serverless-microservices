process.env.COGNITO_USER_POOL_ID = "us-east-1_abcdefghi";
process.env.COGNITO_CLIENT_ID = "mock-client-id";
process.env.AWS_REGION = "us-east-1";

const request = require("supertest");
const app = require("../src/app");
const orderService = require("../src/services/orderService");

jest.mock("../src/services/orderService");
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

describe("Order Routes Tests", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("GET /api/orders/all (Admin)", async () => {
        orderService.getOrders.mockResolvedValue([{ orderId: "o1" }]);

        const res = await request(app).get("/api/orders/all");

        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual([{ orderId: "o1" }]);
    });

    test("GET /api/orders/my", async () => {
        orderService.getOrdersByUserId.mockResolvedValue([{ orderId: "o1", userId: "user-123" }]);

        const res = await request(app).get("/api/orders/my");

        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual([{ orderId: "o1", userId: "user-123" }]);
    });

    test("GET /api/orders/:orderId", async () => {
        orderService.getOrderById.mockResolvedValue({ orderId: "o1", userId: "user-123" });

        const res = await request(app).get("/api/orders/o1");

        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({ orderId: "o1", userId: "user-123" });
    });

    test("POST /api/orders", async () => {
        orderService.createOrder.mockResolvedValue({ orderId: "o1" });

        const res = await request(app)
            .post("/api/orders")
            .send({ items: [{ productId: "p1", quantity: 2, price: 100 }] });

        expect(res.statusCode).toBe(201);
        expect(res.body).toEqual({ orderId: "o1" });
    });

    test("PUT /api/orders/:orderId/status", async () => {
        orderService.updateOrder.mockResolvedValue({ orderId: "o1", status: "SHIPPED" });

        const res = await request(app)
            .put("/api/orders/o1/status")
            .send({ status: "SHIPPED" });

        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({ orderId: "o1", status: "SHIPPED" });
    });

    test("DELETE /api/orders/:orderId", async () => {
        orderService.deleteOrder.mockResolvedValue({ orderId: "o1" });

        const res = await request(app).delete("/api/orders/o1");

        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({ success: true, message: "Order deleted successfully" });
    });
});
