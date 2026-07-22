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
    GetCommand: jest.fn(),
    PutCommand: jest.fn()
}));

const inventoryConsumer = require("../src/services/inventoryConsumer");

describe("Inventory Consumer Tests", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockSend.mockReset();
        process.env.INVENTORY_TABLE = "InventoryTest";
    });

    test("should return early if event has no records", async () => {
        const result = await inventoryConsumer.processEvent({});
        expect(result).toEqual({ statusCode: 200, body: "No records to process" });
        expect(mockSend).not.toHaveBeenCalled();
    });

    test("should ignore event if type is not PAYMENT_SUCCESS", async () => {
        const event = {
            Records: [
                {
                    body: {
                        Message: { event: "OTHER_EVENT" } // Object form
                    }
                }
            ]
        };

        const result = await inventoryConsumer.processEvent(event);

        expect(result.statusCode).toBe(200);
        expect(mockSend).not.toHaveBeenCalled();
    });

    test("should skip item if productId is missing", async () => {
        const event = {
            Records: [
                {
                    body: {
                        Message: {
                            event: "PAYMENT_SUCCESS",
                            items: [{ productId: "", quantity: 2 }]
                        }
                    }
                }
            ]
        };

        await inventoryConsumer.processEvent(event);

        expect(mockSend).not.toHaveBeenCalled();
    });

    test("should update availableStock successfully for PAYMENT_SUCCESS event (Stringified JSON)", async () => {
        const event = {
            Records: [
                {
                    body: JSON.stringify({
                        Message: JSON.stringify({
                            event: "PAYMENT_SUCCESS",
                            items: [
                                { productId: "p1", quantity: 2 },
                                { productId: "p2", quantity: 3 }
                            ]
                        })
                    })
                }
            ]
        };

        mockSend.mockResolvedValueOnce({
            Item: { productId: "p1", availableStock: 10, totalStock: 10 }
        });
        mockSend.mockResolvedValueOnce({});
        mockSend.mockResolvedValueOnce({
            Item: { productId: "p2", availableStock: 5, totalStock: 5 }
        });
        mockSend.mockResolvedValueOnce({});

        const result = await inventoryConsumer.processEvent(event);

        expect(result.statusCode).toBe(200);
        expect(mockSend).toHaveBeenCalledTimes(4); // 2 gets, 2 puts
    });

    test("should support single product format and quantity fallback in PAYMENT_SUCCESS event payload", async () => {
        const event = {
            Records: [
                {
                    body: {
                        Message: {
                            event: "PAYMENT_SUCCESS",
                            productId: "p1",
                            quantity: undefined // fallback to 1
                        }
                    }
                }
            ]
        };

        mockSend.mockResolvedValueOnce({
            Item: { productId: "p1", quantity: 15 } // availableStock undefined fallback
        });
        mockSend.mockResolvedValueOnce({});

        const result = await inventoryConsumer.processEvent(event);

        expect(result.statusCode).toBe(200);
        expect(mockSend).toHaveBeenCalledTimes(2);
    });

    test("should handle missing stock fields on inventory record fallback to 0", async () => {
        const event = {
            Records: [
                {
                    body: {
                        Message: {
                            event: "PAYMENT_SUCCESS",
                            productId: "p1",
                            quantity: 1
                        }
                    }
                }
            ]
        };

        mockSend.mockResolvedValueOnce({
            Item: { productId: "p1" } // both availableStock and quantity missing
        });
        mockSend.mockResolvedValueOnce({});

        await inventoryConsumer.processEvent(event);

        expect(mockSend).toHaveBeenCalledTimes(2);
    });

    test("should fallback to root productId if items is a non-array object", async () => {
        const event = {
            Records: [
                {
                    body: {
                        Message: {
                            event: "PAYMENT_SUCCESS",
                            items: { productId: "some-other-id" }, // non-array
                            productId: "p1",
                            quantity: 3
                        }
                    }
                }
            ]
        };

        mockSend.mockResolvedValueOnce({
            Item: { productId: "p1", availableStock: 10 }
        });
        mockSend.mockResolvedValueOnce({});

        await inventoryConsumer.processEvent(event);

        expect(mockSend).toHaveBeenCalledTimes(2);
    });

    test("should fallback to root productId if items is an empty array", async () => {
        const event = {
            Records: [
                {
                    body: {
                        Message: {
                            event: "PAYMENT_SUCCESS",
                            items: [],
                            productId: "p1",
                            quantity: 3
                        }
                    }
                }
            ]
        };

        mockSend.mockResolvedValueOnce({
            Item: { productId: "p1", availableStock: 10 }
        });
        mockSend.mockResolvedValueOnce({});

        await inventoryConsumer.processEvent(event);

        expect(mockSend).toHaveBeenCalledTimes(2);
    });

    test("should fallback to root payload if Message key is missing", async () => {
        const event = {
            Records: [
                {
                    body: {
                        event: "PAYMENT_SUCCESS",
                        productId: "p1",
                        quantity: 1
                    }
                }
            ]
        };

        mockSend.mockResolvedValueOnce({
            Item: { productId: "p1", availableStock: 10 }
        });
        mockSend.mockResolvedValueOnce({});

        await inventoryConsumer.processEvent(event);

        expect(mockSend).toHaveBeenCalledTimes(2);
    });

    test("should print default UNKNOWN if payload event type is missing", async () => {
        const event = {
            Records: [
                {
                    body: {
                        productId: "p1"
                    }
                }
            ]
        };

        await inventoryConsumer.processEvent(event);
        expect(mockSend).not.toHaveBeenCalled();
    });

    test("should handle missing inventory record gracefully", async () => {
        const event = {
            Records: [
                {
                    body: {
                        Message: {
                            event: "PAYMENT_SUCCESS",
                            productId: "p99",
                            quantity: 1
                        }
                    }
                }
            ]
        };

        mockSend.mockResolvedValueOnce({}); // GetCommand returns nothing (null)

        const result = await inventoryConsumer.processEvent(event);

        expect(result.statusCode).toBe(200);
        expect(mockSend).toHaveBeenCalledTimes(1);
    });

    test("should handle errors in record processing loop gracefully", async () => {
        const event = {
            Records: [
                {
                    body: "invalid-json-structure"
                }
            ]
        };

        const result = await inventoryConsumer.processEvent(event);
        expect(result.statusCode).toBe(200);
    });
});
