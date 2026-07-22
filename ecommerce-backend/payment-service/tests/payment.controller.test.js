const paymentController = require("../src/controllers/paymentController");
const paymentService = require("../src/services/paymentService");

jest.mock("../src/services/paymentService");

describe("Payment Controller Tests", () => {
    let req, res;

    beforeEach(() => {
        jest.clearAllMocks();
        req = {
            user: { userId: "user-123", groups: ["User"] },
            params: {},
            body: {},
            headers: {}
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
    });

    describe("getAllPayments", () => {
        test("should return 200 and all payments", async () => {
            const mockPayments = [{ paymentId: "p1" }];
            paymentService.getPayments.mockResolvedValue(mockPayments);

            await paymentController.getAllPayments(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(mockPayments);
        });

        test("should return 500 on failure", async () => {
            paymentService.getPayments.mockRejectedValue(new Error("Db error"));

            await paymentController.getAllPayments(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
        });
    });

    describe("createPayment", () => {
        test("should return 201 and new payment on success", async () => {
            const mockPayment = { paymentId: "p1", status: "PENDING" };
            req.body = { amount: 100, orderId: "o1" };
            paymentService.createPayment.mockResolvedValue(mockPayment);

            await paymentController.createPayment(req, res);

            expect(paymentService.createPayment).toHaveBeenCalledWith("user-123", req.body);
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith(mockPayment);
        });

        test("should return 500 on failure", async () => {
            paymentService.createPayment.mockRejectedValue(new Error("Creation error"));

            await paymentController.createPayment(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
        });
    });

    describe("confirmPaymentSuccess", () => {
        test("should return 200 on success", async () => {
            const mockPayment = { paymentId: "p1", status: "SUCCESS" };
            req.params.paymentId = "p1";
            req.headers.authorization = "Bearer tok";
            paymentService.processPaymentSuccess.mockResolvedValue(mockPayment);

            await paymentController.confirmPaymentSuccess(req, res);

            expect(paymentService.processPaymentSuccess).toHaveBeenCalledWith("p1", "Bearer tok");
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: "Payment confirmed successfully",
                payment: mockPayment
            });
        });

        test("should return 500 on failure", async () => {
            paymentService.processPaymentSuccess.mockRejectedValue(new Error("Update failed"));

            await paymentController.confirmPaymentSuccess(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
        });
    });

    describe("getPaymentById", () => {
        test("should return 404 if payment not found", async () => {
            req.params.paymentId = "p1";
            paymentService.getPaymentById.mockResolvedValue(null);

            await paymentController.getPaymentById(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
        });

        test("should return 403 if user does not own payment and is not admin", async () => {
            const mockPayment = { paymentId: "p1", userId: "other-user" };
            req.params.paymentId = "p1";
            paymentService.getPaymentById.mockResolvedValue(mockPayment);

            await paymentController.getPaymentById(req, res);

            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: "Access Denied. You do not own this payment."
            });
        });

        test("should return 200 if user owns the payment", async () => {
            const mockPayment = { paymentId: "p1", userId: "user-123" };
            req.params.paymentId = "p1";
            paymentService.getPaymentById.mockResolvedValue(mockPayment);

            await paymentController.getPaymentById(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(mockPayment);
        });

        test("should return 200 if user does not own payment but is admin", async () => {
            req.user = { userId: "admin-user", groups: ["Admin"] };
            const mockPayment = { paymentId: "p1", userId: "other-user" };
            req.params.paymentId = "p1";
            paymentService.getPaymentById.mockResolvedValue(mockPayment);

            await paymentController.getPaymentById(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(mockPayment);
        });
    });

    describe("updatePayment", () => {
        test("should return 200 on successful update", async () => {
            const mockPayment = { paymentId: "p1", status: "SUCCESS" };
            req.params.paymentId = "p1";
            req.body = { status: "SUCCESS" };
            paymentService.updatePayment.mockResolvedValue(mockPayment);

            await paymentController.updatePayment(req, res);

            expect(paymentService.updatePayment).toHaveBeenCalledWith("p1", req.body);
            expect(res.status).toHaveBeenCalledWith(200);
        });

        test("should return 404 if not found", async () => {
            req.params.paymentId = "p1";
            paymentService.updatePayment.mockResolvedValue(null);

            await paymentController.updatePayment(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
        });
    });

    describe("deletePayment", () => {
        test("should return 200 on success", async () => {
            req.params.paymentId = "p1";
            paymentService.deletePayment.mockResolvedValue({ paymentId: "p1" });

            await paymentController.deletePayment(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
        });

        test("should return 404 if not found", async () => {
            req.params.paymentId = "p1";
            paymentService.deletePayment.mockResolvedValue(null);

            await paymentController.deletePayment(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
        });
    });
});
