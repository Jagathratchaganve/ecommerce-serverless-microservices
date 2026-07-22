process.env.COGNITO_USER_POOL_ID = "us-east-1_abcdefghi";
process.env.COGNITO_CLIENT_ID = "mock-client-id";
process.env.AWS_REGION = "us-east-1";

const mockSend = jest.fn();
jest.mock("@aws-sdk/client-dynamodb", () => ({
    DynamoDBClient: jest.fn().mockImplementation(() => ({}))
}));
jest.mock("@aws-sdk/lib-dynamodb", () => ({
    DynamoDBDocumentClient: {
        from: jest.fn().mockReturnValue({
            send: mockSend
        })
    },
    ScanCommand: jest.fn(),
    GetCommand: jest.fn(),
    PutCommand: jest.fn(),
    DeleteCommand: jest.fn()
}));

const orderService = require("../src/services/orderService");
const dynamoDB = require("../src/config/dynamodb");
const axios = require("axios");

jest.mock("axios");
jest.mock("uuid", () => ({
    v4: () => "mocked-order-id"
}));

describe("Order Service Tests", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockSend.mockReset();
        process.env.ORDER_TABLE = "OrdersTest";
        process.env.INVENTORY_SERVICE_URL = "http://inventory-service";
    });

    describe("getOrders", () => {
        test("should return all orders", async () => {
            const mockOrders = [{ orderId: "o1", total: 100 }];
            mockSend.mockResolvedValue({ Items: mockOrders });

            const result = await orderService.getOrders();

            expect(result).toEqual(mockOrders);
        });

        test("should return empty array if getOrders scan has no items", async () => {
            mockSend.mockResolvedValue({});
            const result = await orderService.getOrders();
            expect(result).toEqual([]);
        });
    });

    describe("getOrdersByUserId", () => {
        test("should return orders belonging to specific user", async () => {
            const mockOrders = [
                { orderId: "o1", userId: "u1", total: 100 },
                { orderId: "o2", userId: "u2", total: 200 }
            ];
            mockSend.mockResolvedValue({ Items: mockOrders });

            const result = await orderService.getOrdersByUserId("u1");

            expect(result).toEqual([{ orderId: "o1", userId: "u1", total: 100 }]);
        });
    });

    describe("createOrder", () => {
        test("should throw error if items are empty", async () => {
            await expect(orderService.createOrder({ items: [] }, "tok", "u1"))
                .rejects.toThrow("Order must contain at least one item");
        });

        test("should throw error on invalid item format", async () => {
            await expect(orderService.createOrder({ items: [{ productId: "", quantity: 1 }] }, "tok", "u1"))
                .rejects.toThrow("Invalid item in order payload");
        });

        test("should throw error if stock is insufficient", async () => {
            axios.get.mockResolvedValueOnce({ data: { productId: "p1", availableStock: 2 } });

            await expect(orderService.createOrder({ items: [{ productId: "p1", quantity: 5, price: 10 }] }, "tok", "u1"))
                .rejects.toThrow("Insufficient inventory stock for product: p1");
        });

        test("should throw error if inventory record is 404", async () => {
            const axiosError = new Error("Not found");
            axiosError.response = { status: 404 };
            axios.get.mockRejectedValue(axiosError);

            await expect(orderService.createOrder({ items: [{ productId: "p1", quantity: 5, price: 10 }] }, "tok", "u1"))
                .rejects.toThrow("Inventory not found for product: p1");
        });

        test("should survive inventory check error other than 404", async () => {
            axios.get.mockRejectedValueOnce(new Error("Timeout"));
            mockSend.mockResolvedValueOnce({});

            const result = await orderService.createOrder({
                productId: "p1",
                quantity: 2,
                price: 50
            }, "tok", "u1");

            expect(result.orderId).toBe("mocked-order-id");
            expect(mockSend).toHaveBeenCalled();
        });

        test("should create order successfully with single item input and apply fallback fields", async () => {
            axios.get.mockResolvedValueOnce({ data: { productId: "p1", availableStock: 10 } });
            mockSend.mockResolvedValueOnce({});

            const result = await orderService.createOrder({
                productId: "p1",
                quantity: undefined, // fallback to 1
                price: undefined, // fallback to amount or 0
                amount: 50,
                customerName: "",
                email: "",
                address: null
            }, undefined, "u1");

            expect(result.orderId).toBe("mocked-order-id");
            expect(result.userId).toBe("u1");
            expect(result.items[0].quantity).toBe(1);
            expect(result.items[0].price).toBe(50);
            expect(result.subtotal).toBe(50);
            expect(result.total).toBe(50);
            expect(result.status).toBe("PENDING");
            expect(mockSend).toHaveBeenCalled();
        });

        test("should fall back to subtotal if total price after discounts is negative/zero", async () => {
            axios.get.mockResolvedValueOnce({ data: { productId: "p1", availableStock: 10 } });
            mockSend.mockResolvedValueOnce({});

            const result = await orderService.createOrder({
                productId: "p1",
                quantity: 1,
                price: 50,
                discount: 100 // subtotal 50 - discount 100 = -50 (should fallback to 50)
            }, "tok", "u1");

            expect(result.subtotal).toBe(50);
            expect(result.total).toBe(50);
        });

        test("should skip inventory check if INVENTORY_SERVICE_URL is not set", async () => {
            delete process.env.INVENTORY_SERVICE_URL;
            mockSend.mockResolvedValueOnce({});

            const result = await orderService.createOrder({
                productId: "p1",
                quantity: 1,
                price: 50
            }, "tok", "u1");

            expect(result.orderId).toBe("mocked-order-id");
            expect(axios.get).not.toHaveBeenCalled();
        });

        test("should create order with array of items and apply tax/shipping", async () => {
            axios.get.mockResolvedValueOnce({ data: { productId: "p1", availableStock: 10 } });
            axios.get.mockResolvedValueOnce({ data: { productId: "p2", availableStock: 5 } });
            mockSend.mockResolvedValueOnce({});

            const result = await orderService.createOrder({
                items: [
                    { productId: "p1", quantity: 2, price: 50 },
                    { productId: "p2", quantity: 1, price: 30 }
                ],
                discount: 10,
                tax: 5,
                shippingCharge: 15,
                customerName: "John"
            }, "tok", "u1");

            expect(result.subtotal).toBe(130);
            // 130 - 10 + 5 + 15 = 140
            expect(result.total).toBe(140);
        });
    });

    describe("getOrderById", () => {
        test("should return order if found", async () => {
            const mockOrder = { orderId: "o1", total: 100 };
            mockSend.mockResolvedValue({ Item: mockOrder });

            const result = await orderService.getOrderById("o1");

            expect(result).toEqual(mockOrder);
        });

        test("should return null if not found", async () => {
            mockSend.mockResolvedValue({});
            const result = await orderService.getOrderById("o99");
            expect(result).toBeNull();
        });
    });

    describe("updateOrder", () => {
        test("should return null if order not found", async () => {
            mockSend.mockResolvedValueOnce({}); // getOrderById returns null
            const result = await orderService.updateOrder("o1", { status: "SHIPPED" });
            expect(result).toBeNull();
        });

        test("should throw error if status is invalid", async () => {
            mockSend.mockResolvedValueOnce({ Item: { orderId: "o1", status: "PENDING" } }); // getOrderById
            await expect(orderService.updateOrder("o1", { status: "INVALID_STATUS" }))
                .rejects.toThrow("Invalid order status: INVALID_STATUS");
        });

        test("should update order status successfully", async () => {
            const existing = { orderId: "o1", status: "PENDING", total: 100 };
            mockSend.mockResolvedValueOnce({ Item: existing }); // getOrderById
            mockSend.mockResolvedValueOnce({}); // put

            const result = await orderService.updateOrder("o1", { status: "PLACED", paymentId: "pay-123" });

            expect(result.status).toBe("PLACED");
            expect(result.paymentId).toBe("pay-123");
            expect(result.total).toBe(100);
        });
    });

    describe("deleteOrder", () => {
        test("should delete order and return OLD attributes", async () => {
            const oldOrder = { orderId: "o1", total: 100 };
            mockSend.mockResolvedValue({ Attributes: oldOrder });

            const result = await orderService.deleteOrder("o1");

            expect(result).toEqual(oldOrder);
        });

        test("should return null if deleted attributes are missing", async () => {
            mockSend.mockResolvedValue({});
            const result = await orderService.deleteOrder("o1");
            expect(result).toBeNull();
        });
    });
});
