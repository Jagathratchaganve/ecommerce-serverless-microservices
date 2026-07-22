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

const inventoryService = require("../src/services/inventoryService");

describe("Inventory Service Tests", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockSend.mockReset();
        process.env.INVENTORY_TABLE = "InventoryTest";
    });

    describe("getInventory", () => {
        test("should return all inventory records", async () => {
            const mockItems = [{ productId: "p1", totalStock: 10 }];
            mockSend.mockResolvedValue({ Items: mockItems });

            const result = await inventoryService.getInventory();

            expect(result).toEqual(mockItems);
            expect(mockSend).toHaveBeenCalled();
        });

        test("should return empty array if scan is empty", async () => {
            mockSend.mockResolvedValue({});
            const result = await inventoryService.getInventory();
            expect(result).toEqual([]);
        });
    });

    describe("getInventoryByProductId", () => {
        test("should return inventory record if found", async () => {
            const mockItem = { productId: "p1", totalStock: 10 };
            mockSend.mockResolvedValue({ Item: mockItem });

            const result = await inventoryService.getInventoryByProductId("p1");

            expect(result).toEqual(mockItem);
        });

        test("should return null if not found", async () => {
            mockSend.mockResolvedValue({});
            const result = await inventoryService.getInventoryByProductId("p99");
            expect(result).toBeNull();
        });
    });

    describe("createInventory", () => {
        test("should throw error if productId is missing", async () => {
            await expect(inventoryService.createInventory({})).rejects.toThrow("productId is required to create inventory");
        });

        test("should return existing item if it already exists", async () => {
            const mockItem = { productId: "p1", totalStock: 10 };
            mockSend.mockResolvedValueOnce({ Item: mockItem }); // getInventoryByProductId call

            const result = await inventoryService.createInventory({ productId: "p1" });

            expect(result).toEqual(mockItem);
            expect(mockSend).toHaveBeenCalledTimes(1); // just GetCommand
        });

        test("should create and save new inventory item", async () => {
            mockSend.mockResolvedValueOnce({}); // getInventoryByProductId returns null
            mockSend.mockResolvedValueOnce({}); // PutCommand succeeds

            const result = await inventoryService.createInventory({
                productId: "p2",
                totalStock: 5,
                availableStock: 5,
                reservedStock: 0
            });

            expect(result.productId).toBe("p2");
            expect(result.totalStock).toBe(5);
            expect(result.availableStock).toBe(5);
            expect(result.reservedStock).toBe(0);
            expect(mockSend).toHaveBeenCalledTimes(2);
        });

        test("should create with default values if stock fields are missing", async () => {
            mockSend.mockResolvedValueOnce({}); // get
            mockSend.mockResolvedValueOnce({}); // put

            const result = await inventoryService.createInventory({ productId: "p3" });

            expect(result.totalStock).toBe(0);
            expect(result.availableStock).toBe(0);
            expect(result.reservedStock).toBe(0);
        });
    });

    describe("updateInventory", () => {
        test("should initialize inventory if not found", async () => {
            mockSend.mockResolvedValueOnce({}); // getInventoryByProductId returns null
            mockSend.mockResolvedValueOnce({}); // PutCommand succeeds

            const result = await inventoryService.updateInventory("p1", {
                totalStock: 100,
                availableStock: 90
            });

            expect(result.productId).toBe("p1");
            expect(result.totalStock).toBe(100);
            expect(result.availableStock).toBe(90);
            expect(result.reservedStock).toBe(0);
        });

        test("should initialize with default values if updatedData stock fields are missing", async () => {
            mockSend.mockResolvedValueOnce({}); // get
            mockSend.mockResolvedValueOnce({}); // put

            const result = await inventoryService.updateInventory("p1", {});

            expect(result.totalStock).toBe(0);
            expect(result.availableStock).toBe(0);
            expect(result.reservedStock).toBe(0);
        });

        test("should update existing inventory record and apply fallbacks if updated fields are undefined", async () => {
            const existing = {
                productId: "p1",
                totalStock: 50,
                availableStock: 40,
                reservedStock: 10
            };
            mockSend.mockResolvedValueOnce({ Item: existing }); // getInventoryByProductId
            mockSend.mockResolvedValueOnce({}); // PutCommand

            const result = await inventoryService.updateInventory("p1", {});

            expect(result.productId).toBe("p1");
            expect(result.totalStock).toBe(50);
            expect(result.availableStock).toBe(40);
            expect(result.reservedStock).toBe(10);
        });

        test("should handle missing stock fields on existing record when applying fallback values", async () => {
            const existing = { productId: "p1" }; // missing all stock fields
            mockSend.mockResolvedValueOnce({ Item: existing });
            mockSend.mockResolvedValueOnce({});

            const result = await inventoryService.updateInventory("p1", {});

            expect(result.totalStock).toBe(0);
            expect(result.availableStock).toBe(0);
            expect(result.reservedStock).toBe(0);
        });
    });

    describe("deleteInventory", () => {
        test("should delete inventory and return OLD values", async () => {
            const oldItem = { productId: "p1", totalStock: 10 };
            mockSend.mockResolvedValue({ Attributes: oldItem });

            const result = await inventoryService.deleteInventory("p1");

            expect(result).toEqual(oldItem);
        });
    });
});
