process.env.COGNITO_USER_POOL_ID = "us-east-1_abcdefghi";
process.env.COGNITO_CLIENT_ID = "mock-client-id";
process.env.AWS_REGION = "us-east-1";

const request = require("supertest");
const app = require("../src/app");
const productService = require("../src/services/productService");

jest.mock("../src/services/productService");
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

describe("Product Routes Tests", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("GET /api/products", async () => {
        productService.getProducts.mockResolvedValue([{ id: "1" }]);

        const res = await request(app).get("/api/products");

        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual([{ id: "1" }]);
    });

    test("GET /api/products/:id", async () => {
        productService.getProductById.mockResolvedValue({ id: "123" });

        const res = await request(app).get("/api/products/123");

        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({ id: "123" });
    });

    test("POST /api/products", async () => {
        productService.createProduct.mockResolvedValue({ id: "new-id" });

        const res = await request(app)
            .post("/api/products")
            .send({ name: "New Product" });

        expect(res.statusCode).toBe(201);
        expect(res.body).toEqual({ id: "new-id" });
    });

    test("PUT /api/products/:id", async () => {
        productService.updateProduct.mockResolvedValue({ id: "123", name: "Updated" });

        const res = await request(app)
            .put("/api/products/123")
            .send({ name: "Updated" });

        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({ id: "123", name: "Updated" });
    });

    test("DELETE /api/products/:id", async () => {
        productService.deleteProduct.mockResolvedValue({ id: "123" });

        const res = await request(app).delete("/api/products/123");

        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({ message: "Product deleted successfully" });
    });
});
