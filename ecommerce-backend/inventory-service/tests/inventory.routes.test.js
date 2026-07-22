process.env.COGNITO_USER_POOL_ID = "us-east-1_abcdefghi";
process.env.COGNITO_CLIENT_ID = "mock-client-id";
process.env.AWS_REGION = "us-east-1";

const request = require("supertest");
const app = require("../src/app");
const inventoryService = require("../src/services/inventoryService");

jest.mock("../src/services/inventoryService");
jest.mock("../src/services/logger", () => ({
    info: jest.fn(),
    error: jest.fn()
}));

// Mock Auth Middleware to allow all requests in route testing
jest.mock("../src/middleware/authenticate", () => (req, res, next) => {
    req.user = { userId: "user-123", groups: ["Admin"] };
    next();
});
jest.mock("../src/middleware/authorize", () => (...roles) => (req, res, next) => next());

describe("Inventory Routes Tests", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("GET /api/inventory", async () => {
        inventoryService.getInventory.mockResolvedValue([{ productId: "p1" }]);

        const res = await request(app).get("/api/inventory");

        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual([{ productId: "p1" }]);
    });

    test("GET /api/inventory/:productId", async () => {
        inventoryService.getInventoryByProductId.mockResolvedValue({ productId: "p1" });

        const res = await request(app).get("/api/inventory/p1");

        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({ productId: "p1" });
    });

    test("POST /api/inventory", async () => {
        inventoryService.createInventory.mockResolvedValue({ productId: "p1" });

        const res = await request(app)
            .post("/api/inventory")
            .send({ productId: "p1" });

        expect(res.statusCode).toBe(201);
        expect(res.body).toEqual({ productId: "p1" });
    });

    test("PUT /api/inventory/:productId", async () => {
        inventoryService.updateInventory.mockResolvedValue({ productId: "p1", totalStock: 100 });

        const res = await request(app)
            .put("/api/inventory/p1")
            .send({ totalStock: 100 });

        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({ productId: "p1", totalStock: 100 });
    });

    test("DELETE /api/inventory/:productId", async () => {
        inventoryService.deleteInventory.mockResolvedValue({ productId: "p1" });

        const res = await request(app).delete("/api/inventory/p1");

        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({ message: "Inventory deleted successfully" });
    });
});
