const inventoryController = require("../src/controllers/inventoryController");
const inventoryService = require("../src/services/inventoryService");

jest.mock("../src/services/inventoryService");

describe("Inventory Controller Tests", () => {
    let req, res;

    beforeEach(() => {
        jest.clearAllMocks();
        req = {
            params: {},
            body: {},
            headers: {}
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
    });

    describe("getAllInventory", () => {
        test("should return 200 and all items", async () => {
            const items = [{ productId: "p1", totalStock: 5 }];
            inventoryService.getInventory.mockResolvedValue(items);

            await inventoryController.getAllInventory(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(items);
        });

        test("should return 500 on service error", async () => {
            inventoryService.getInventory.mockRejectedValue(new Error("Database error"));

            await inventoryController.getAllInventory(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ message: "Database error" });
        });
    });

    describe("createInventory", () => {
        test("should return 201 on successful creation", async () => {
            const item = { productId: "p1", totalStock: 5 };
            req.body = { productId: "p1", totalStock: 5 };
            req.headers.authorization = "Bearer token";
            inventoryService.createInventory.mockResolvedValue(item);

            await inventoryController.createInventory(req, res);

            expect(inventoryService.createInventory).toHaveBeenCalledWith(req.body, "Bearer token");
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith(item);
        });

        test("should return 500 on creation error", async () => {
            inventoryService.createInventory.mockRejectedValue(new Error("Create failed"));

            await inventoryController.createInventory(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ message: "Create failed" });
        });
    });

    describe("getInventoryByProductId", () => {
        test("should return item if found", async () => {
            const item = { productId: "p1", totalStock: 5 };
            req.params.productId = "p1";
            inventoryService.getInventoryByProductId.mockResolvedValue(item);

            await inventoryController.getInventoryByProductId(req, res);

            expect(inventoryService.getInventoryByProductId).toHaveBeenCalledWith("p1");
            expect(res.json).toHaveBeenCalledWith(item);
        });

        test("should return 404 if not found", async () => {
            req.params.productId = "p1";
            inventoryService.getInventoryByProductId.mockResolvedValue(null);

            await inventoryController.getInventoryByProductId(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: "Inventory not found" });
        });
    });

    describe("updateInventory", () => {
        test("should return updated item if found", async () => {
            const item = { productId: "p1", totalStock: 10 };
            req.params.productId = "p1";
            req.body = { totalStock: 10 };
            inventoryService.updateInventory.mockResolvedValue(item);

            await inventoryController.updateInventory(req, res);

            expect(inventoryService.updateInventory).toHaveBeenCalledWith("p1", req.body);
            expect(res.json).toHaveBeenCalledWith(item);
        });

        test("should return 404 if item to update not found", async () => {
            req.params.productId = "p1";
            inventoryService.updateInventory.mockResolvedValue(null);

            await inventoryController.updateInventory(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: "Inventory not found" });
        });
    });

    describe("deleteInventory", () => {
        test("should return 200 on successful delete", async () => {
            req.params.productId = "p1";
            inventoryService.deleteInventory.mockResolvedValue({ productId: "p1" });

            await inventoryController.deleteInventory(req, res);

            expect(inventoryService.deleteInventory).toHaveBeenCalledWith("p1");
            expect(res.json).toHaveBeenCalledWith({ message: "Inventory deleted successfully" });
        });

        test("should return 404 if item to delete not found", async () => {
            req.params.productId = "p1";
            inventoryService.deleteInventory.mockResolvedValue(null);

            await inventoryController.deleteInventory(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: "Inventory not found" });
        });
    });
});
