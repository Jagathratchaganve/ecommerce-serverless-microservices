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
    UpdateCommand: jest.fn(),
    DeleteCommand: jest.fn()
}));

const productService = require("../src/services/productService");
const dynamoDB = require("../src/config/dynamodb");
const axios = require("axios");

jest.mock("axios");
jest.mock("uuid", () => ({
    v4: () => "mocked-uuid"
}));

describe("Product Service Tests", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockSend.mockReset();
        process.env.PRODUCT_TABLE = "ProductsTest";
        process.env.INVENTORY_SERVICE_URL = "http://inventory-service";
    });

    describe("getProducts", () => {
        test("should return all products from DynamoDB Scan", async () => {
            const mockItems = [{ id: "1", name: "P1" }, { id: "2", name: "P2" }];
            mockSend.mockResolvedValue({ Items: mockItems });

            const result = await productService.getProducts();

            expect(result).toEqual(mockItems);
            expect(mockSend).toHaveBeenCalled();
        });

        test("should return empty array if scan result is empty", async () => {
            mockSend.mockResolvedValue({});

            const result = await productService.getProducts();

            expect(result).toEqual([]);
        });
    });

    describe("getProductById", () => {
        test("should return product by id", async () => {
            const mockItem = { id: "1", name: "P1" };
            mockSend.mockResolvedValue({ Item: mockItem });

            const result = await productService.getProductById("1");

            expect(result).toEqual(mockItem);
        });

        test("should return null if product does not exist", async () => {
            mockSend.mockResolvedValue({});

            const result = await productService.getProductById("99");

            expect(result).toBeNull();
        });
    });

    describe("createProduct", () => {
        test("should save a product and call Inventory Service to create inventory", async () => {
            mockSend.mockResolvedValue({});
            axios.post.mockResolvedValue({ data: { success: true } });

            const productInput = {
                name: "Laptop",
                price: 999,
                description: "Best laptop",
                stock: 10 // should be stripped in service
            };

            const result = await productService.createProduct(productInput, "Bearer token");

            expect(result.id).toBe("mocked-uuid");
            expect(result.name).toBe("Laptop");
            expect(result.price).toBe(999);
            expect(result.stock).toBeUndefined(); // stripped
            expect(mockSend).toHaveBeenCalled();
            expect(axios.post).toHaveBeenCalledWith(
                "http://inventory-service/api/inventory",
                {
                    productId: "mocked-uuid",
                    totalStock: 0,
                    availableStock: 0,
                    reservedStock: 0
                },
                {
                    headers: {
                        Authorization: "Bearer token"
                    }
                }
            );
        });

        test("should support create product with empty inputs and no token/url", async () => {
            delete process.env.INVENTORY_SERVICE_URL;
            mockSend.mockResolvedValue({});

            const result = await productService.createProduct({}, undefined);

            expect(result.name).toBe("");
            expect(result.price).toBe(0);
            expect(axios.post).not.toHaveBeenCalled();
        });

        test("should throw error if Inventory Service call fails with response details", async () => {
            mockSend.mockResolvedValue({});
            const axiosError = new Error("Connection failed");
            axiosError.response = { data: { message: "Inventory failed" } };
            axios.post.mockRejectedValue(axiosError);

            const productInput = { name: "Laptop", price: 999 };

            await expect(productService.createProduct(productInput, "Bearer token"))
                .rejects.toThrow("Product created but failed to initialize inventory: Inventory failed");
        });

        test("should throw error if Inventory Service fails with standard network error", async () => {
            mockSend.mockResolvedValue({});
            axios.post.mockRejectedValue(new Error("Timeout"));

            const productInput = { name: "Laptop", price: 999 };

            await expect(productService.createProduct(productInput, "Bearer token"))
                .rejects.toThrow("Product created but failed to initialize inventory: Timeout");
        });

        test("should throw error if Inventory Service response has no message key", async () => {
            mockSend.mockResolvedValue({});
            const axiosError = new Error("Bad Request");
            axiosError.response = { data: {} };
            axios.post.mockRejectedValue(axiosError);

            const productInput = { name: "Laptop", price: 999 };

            await expect(productService.createProduct(productInput, "Bearer token"))
                .rejects.toThrow("Product created but failed to initialize inventory: Bad Request");
        });
    });

    describe("updateProduct", () => {
        test("should build update expression and update product", async () => {
            const updatedMockAttributes = { id: "1", name: "Laptop v2", price: 1099 };
            mockSend.mockResolvedValue({ Attributes: updatedMockAttributes });

            const result = await productService.updateProduct("1", {
                name: "Laptop v2",
                price: 1099
            });

            expect(result).toEqual(updatedMockAttributes);
            expect(mockSend).toHaveBeenCalled();
        });

        test("should return current product if no keys to update (prototype setter hack)", async () => {
            // Define prototype setter to prevent 'updatedAt' from being added to cleanData
            Object.defineProperty(Object.prototype, "updatedAt", {
                set(v) {},
                configurable: true
            });

            const mockItem = { id: "1", name: "Laptop" };
            mockSend.mockResolvedValue({ Item: mockItem }); // for getProductById inside it

            const result = await productService.updateProduct("1", {}); // no other keys, updatedAt is ignored

            delete Object.prototype.updatedAt;

            expect(result).toEqual(mockItem);
        });

        test("should handle DynamoDB errors gracefully and return null", async () => {
            mockSend.mockRejectedValue(new Error("DynamoDB update error"));

            const result = await productService.updateProduct("1", { name: "Laptop v2" });

            expect(result).toBeNull();
        });
    });

    describe("deleteProduct", () => {
        test("should delete and return OLD attributes", async () => {
            const oldMockAttributes = { id: "1", name: "Laptop" };
            mockSend.mockResolvedValue({ Attributes: oldMockAttributes });

            const result = await productService.deleteProduct("1");

            expect(result).toEqual(oldMockAttributes);
        });

        test("should return null if delete target not found", async () => {
            mockSend.mockResolvedValue({});

            const result = await productService.deleteProduct("1");

            expect(result).toBeNull();
        });
    });
});
