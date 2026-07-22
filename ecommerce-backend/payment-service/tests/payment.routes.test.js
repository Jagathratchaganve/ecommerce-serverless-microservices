const request = require("supertest");
const app = require("../src/app");
const paymentService = require("../src/services/paymentService");

jest.mock("../src/services/paymentService");
jest.mock("../src/services/logger", () => ({
    info: jest.fn(),
    error: jest.fn()
}));

// Mock Auth Middleware
jest.mock("../src/middleware/authenticate", () => (req, res, next) => {
    req.user = { userId: "user-123", groups: ["Admin"] };
    next();
});
jest.mock("../src/middleware/authorize", () => (...roles) => (req, res, next) => next());

describe("Payment Routes Tests", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("GET /api/payments", async () => {
        paymentService.getPayments.mockResolvedValue([{ paymentId: "p1" }]);

        const res = await request(app).get("/api/payments");

        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual([{ paymentId: "p1" }]);
    });

    test("POST /api/payments", async () => {
        paymentService.createPayment.mockResolvedValue({ paymentId: "p1" });

        const res = await request(app)
            .post("/api/payments")
            .send({ amount: 100 });

        expect(res.statusCode).toBe(201);
        expect(res.body).toEqual({ paymentId: "p1" });
    });

    test("POST /api/payments/:paymentId/success", async () => {
        paymentService.processPaymentSuccess.mockResolvedValue({ paymentId: "p1", status: "SUCCESS" });

        const res = await request(app)
            .post("/api/payments/p1/success")
            .send();

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
    });

    test("GET /api/payments/:paymentId", async () => {
        paymentService.getPaymentById.mockResolvedValue({ paymentId: "p1", userId: "user-123" });

        const res = await request(app).get("/api/payments/p1");

        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({ paymentId: "p1", userId: "user-123" });
    });

    test("PUT /api/payments/:paymentId", async () => {
        paymentService.updatePayment.mockResolvedValue({ paymentId: "p1", status: "SUCCESS" });

        const res = await request(app)
            .put("/api/payments/p1")
            .send({ status: "SUCCESS" });

        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({ paymentId: "p1", status: "SUCCESS" });
    });

    test("DELETE /api/payments/:paymentId", async () => {
        paymentService.deletePayment.mockResolvedValue({ paymentId: "p1" });

        const res = await request(app).delete("/api/payments/p1");

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
    });
});
