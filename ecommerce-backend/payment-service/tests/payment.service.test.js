process.env.COGNITO_USER_POOL_ID = "us-east-1_abcdefghi";
process.env.COGNITO_CLIENT_ID = "mock-client-id";
process.env.AWS_REGION = "us-east-1";

const mockSendDynamo = jest.fn();
const mockSendSns = jest.fn();

jest.mock("@aws-sdk/client-dynamodb", () => ({
    DynamoDBClient: jest.fn().mockImplementation(() => ({}))
}));
jest.mock("@aws-sdk/lib-dynamodb", () => ({
    DynamoDBDocumentClient: {
        from: jest.fn().mockReturnValue({
            send: mockSendDynamo
        })
    },
    ScanCommand: jest.fn(),
    GetCommand: jest.fn(),
    PutCommand: jest.fn(),
    DeleteCommand: jest.fn()
}));
jest.mock("@aws-sdk/client-sns", () => ({
    SNSClient: jest.fn().mockImplementation(() => ({
        send: mockSendSns
    })),
    PublishCommand: jest.fn()
}));

const paymentService = require("../src/services/paymentService");
const dynamoDB = require("../src/config/dynamodb");
const sns = require("../src/config/sns");
const axios = require("axios");

jest.mock("axios");
jest.mock("uuid", () => ({
    v4: () => "mocked-payment-id"
}));

describe("Payment Service Tests", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockSendDynamo.mockReset();
        mockSendSns.mockReset();
        process.env.PAYMENT_TABLE = "PaymentTest";
        process.env.ORDER_SERVICE_URL = "http://order-service";
        process.env.CART_SERVICE_URL = "http://cart-service";
        process.env.SNS_TOPIC_ARN = "arn:aws:sns:us-east-1:123456789012:topic";
    });

    describe("getPayments", () => {
        test("should return all payments", async () => {
            const mockPayments = [{ paymentId: "p1", amount: 100 }];
            mockSendDynamo.mockResolvedValue({ Items: mockPayments });

            const result = await paymentService.getPayments();

            expect(result).toEqual(mockPayments);
        });

        test("should return empty array if scan is empty", async () => {
            mockSendDynamo.mockResolvedValue({});
            const result = await paymentService.getPayments();
            expect(result).toEqual([]);
        });
    });

    describe("getPaymentsByUserId", () => {
        test("should filter payments by user id", async () => {
            const mockPayments = [
                { paymentId: "p1", userId: "u1", amount: 100 },
                { paymentId: "p2", userId: "u2", amount: 200 }
            ];
            mockSendDynamo.mockResolvedValue({ Items: mockPayments });

            const result = await paymentService.getPaymentsByUserId("u1");

            expect(result).toEqual([{ paymentId: "p1", userId: "u1", amount: 100 }]);
        });
    });

    describe("createPayment", () => {
        test("should throw error if amount <= 0", async () => {
            await expect(paymentService.createPayment("u1", { amount: 0 }))
                .rejects.toThrow("Amount must be greater than zero");
        });

        test("should throw error if orderId is missing", async () => {
            await expect(paymentService.createPayment("u1", { amount: 10 }))
                .rejects.toThrow("orderId is required to create payment");
        });

        test("should create payment successfully with default PENDING status", async () => {
            mockSendDynamo.mockResolvedValue({});

            const result = await paymentService.createPayment("u1", {
                amount: 150,
                orderId: "o1",
                customerName: "Jane",
                email: "jane@example.com"
            });

            expect(result.paymentId).toBe("mocked-payment-id");
            expect(result.userId).toBe("u1");
            expect(result.status).toBe("PENDING");
            expect(mockSendDynamo).toHaveBeenCalled();
        });
    });

    describe("processPaymentSuccess", () => {
        test("should throw error if payment record is missing", async () => {
            mockSendDynamo.mockResolvedValueOnce({}); // getPaymentById returns null
            await expect(paymentService.processPaymentSuccess("p1", "token"))
                .rejects.toThrow("Payment record not found");
        });

        test("should return payment immediately if it is already SUCCESS", async () => {
            const existing = { paymentId: "p1", status: "SUCCESS" };
            mockSendDynamo.mockResolvedValueOnce({ Item: existing }); // getPaymentById

            const result = await paymentService.processPaymentSuccess("p1", "token");

            expect(result).toEqual(existing);
            expect(mockSendDynamo).toHaveBeenCalledTimes(1); // no updates
        });

        test("should update payment to SUCCESS, update Order, clear Cart, and publish SNS", async () => {
            const existing = {
                paymentId: "p1",
                orderId: "o1",
                userId: "u1",
                status: "PENDING",
                amount: 100,
                customerName: "Jane",
                email: "jane@example.com",
                items: [{ productId: "item-1", quantity: 2 }]
            };
            mockSendDynamo.mockResolvedValueOnce({ Item: existing }); // getPaymentById
            mockSendDynamo.mockResolvedValueOnce({}); // PutCommand for payment update

            axios.put.mockResolvedValueOnce({
                data: {
                    orderId: "o1",
                    items: [{ productId: "item-1", quantity: 2 }],
                    customerName: "Jane",
                    email: "jane@example.com"
                }
            }); // order update
            axios.post.mockResolvedValueOnce({ data: { success: true } }); // cart clear
            mockSendSns.mockResolvedValueOnce({}); // SNS publish

            const result = await paymentService.processPaymentSuccess("p1", "token");

            expect(result.status).toBe("SUCCESS");
            expect(axios.put).toHaveBeenCalledWith(
                "http://order-service/api/orders/o1/status",
                { status: "PLACED", paymentId: "p1" },
                { headers: { Authorization: "token" } }
            );
            expect(axios.post).toHaveBeenCalledWith(
                "http://cart-service/api/cart/clear",
                { userId: "u1", productIds: ["item-1"] },
                { headers: { Authorization: "token" } }
            );
            expect(mockSendSns).toHaveBeenCalled();
        });

        test("should survive and complete even if HTTP calls or SNS fail", async () => {
            const existing = {
                paymentId: "p1",
                orderId: "o1",
                userId: "u1",
                status: "PENDING",
                amount: 100
            };
            mockSendDynamo.mockResolvedValueOnce({ Item: existing }); // get
            mockSendDynamo.mockResolvedValueOnce({}); // put

            axios.put.mockRejectedValueOnce(new Error("Order Service down"));
            axios.post.mockRejectedValueOnce(new Error("Cart Service down"));
            mockSendSns.mockRejectedValueOnce(new Error("SNS down"));

            const result = await paymentService.processPaymentSuccess("p1", "token");

            expect(result.status).toBe("SUCCESS");
            expect(mockSendDynamo).toHaveBeenCalledTimes(2);
        });

        test("should support fallback items in SNS publishing if order has no items", async () => {
            const existing = {
                paymentId: "p1",
                orderId: "o1",
                userId: "u1",
                status: "PENDING",
                amount: 100,
                items: undefined // fallback branch in publish
            };
            mockSendDynamo.mockResolvedValueOnce({ Item: existing }); // get
            mockSendDynamo.mockResolvedValueOnce({}); // put
            axios.put.mockResolvedValueOnce({ data: {} });
            axios.post.mockResolvedValueOnce({ data: {} });
            mockSendSns.mockResolvedValueOnce({});

            const result = await paymentService.processPaymentSuccess("p1", "token");
            expect(result.status).toBe("SUCCESS");
        });
    });

    describe("updatePayment", () => {
        test("should return null if payment not found", async () => {
            mockSendDynamo.mockResolvedValueOnce({}); // get
            const result = await paymentService.updatePayment("p1", { status: "SUCCESS" });
            expect(result).toBeNull();
        });

        test("should throw error if status is invalid", async () => {
            mockSendDynamo.mockResolvedValueOnce({ Item: { paymentId: "p1" } }); // get
            await expect(paymentService.updatePayment("p1", { status: "INVALID_STATUS" }))
                .rejects.toThrow("Invalid payment status");
        });

        test("should update payment fields successfully", async () => {
            const existing = { paymentId: "p1", status: "PENDING", amount: 100 };
            mockSendDynamo.mockResolvedValueOnce({ Item: existing }); // get
            mockSendDynamo.mockResolvedValueOnce({}); // put

            const result = await paymentService.updatePayment("p1", { status: "FAILED", amount: 120 });

            expect(result.status).toBe("FAILED");
            expect(result.amount).toBe(120);
        });
    });

    describe("deletePayment", () => {
        test("should delete payment and return OLD attributes", async () => {
            const old = { paymentId: "p1" };
            mockSendDynamo.mockResolvedValue({ Attributes: old });

            const result = await paymentService.deletePayment("p1");

            expect(result).toEqual(old);
        });

        test("should return null if deleted attributes are missing", async () => {
            mockSendDynamo.mockResolvedValue({});
            const result = await paymentService.deletePayment("p1");
            expect(result).toBeNull();
        });
    });
});
