const productController = require("../src/controllers/productController");
const productService = require("../src/services/productService");

jest.mock("../src/services/productService");

describe("Product Controller Tests", () => {
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

    describe("getAllProducts", () => {
        test("should return 200 and products list", async () => {
            const mockProducts = [{ id: "1", name: "P1" }];
            productService.getProducts.mockResolvedValue(mockProducts);

            await productController.getAllProducts(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(mockProducts);
        });

        test("should return 500 when getProducts fails", async () => {
            productService.getProducts.mockRejectedValue(new Error("Scan failed"));

            await productController.getAllProducts(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ message: "Scan failed" });
        });
    });

    describe("createProduct", () => {
        test("should return 201 and new product on success", async () => {
            const mockNewProduct = { id: "1", name: "P1" };
            req.body = { name: "P1" };
            req.headers.authorization = "Bearer token";
            productService.createProduct.mockResolvedValue(mockNewProduct);

            await productController.createProduct(req, res);

            expect(productService.createProduct).toHaveBeenCalledWith(req.body, "Bearer token");
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith(mockNewProduct);
        });

        test("should return 500 when createProduct fails", async () => {
            productService.createProduct.mockRejectedValue(new Error("Creation error"));

            await productController.createProduct(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ message: "Creation error" });
        });
    });

    describe("getProductById", () => {
        test("should return product if found", async () => {
            const mockProduct = { id: "123", name: "P1" };
            req.params.id = "123";
            productService.getProductById.mockResolvedValue(mockProduct);

            await productController.getProductById(req, res);

            expect(productService.getProductById).toHaveBeenCalledWith("123");
            expect(res.json).toHaveBeenCalledWith(mockProduct);
        });

        test("should return 404 if product not found", async () => {
            req.params.id = "123";
            productService.getProductById.mockResolvedValue(null);

            await productController.getProductById(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: "Product not found" });
        });
    });

    describe("updateProduct", () => {
        test("should return updated product on success", async () => {
            const mockUpdated = { id: "123", name: "P1 New" };
            req.params.id = "123";
            req.body = { name: "P1 New" };
            productService.updateProduct.mockResolvedValue(mockUpdated);

            await productController.updateProduct(req, res);

            expect(productService.updateProduct).toHaveBeenCalledWith("123", req.body);
            expect(res.json).toHaveBeenCalledWith(mockUpdated);
        });

        test("should return 404 if product to update is not found", async () => {
            req.params.id = "123";
            productService.updateProduct.mockResolvedValue(null);

            await productController.updateProduct(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: "Product not found" });
        });
    });

    describe("deleteProduct", () => {
        test("should return message on successful deletion", async () => {
            req.params.id = "123";
            productService.deleteProduct.mockResolvedValue({ id: "123" });

            await productController.deleteProduct(req, res);

            expect(productService.deleteProduct).toHaveBeenCalledWith("123");
            expect(res.json).toHaveBeenCalledWith({ message: "Product deleted successfully" });
        });

        test("should return 404 if product to delete is not found", async () => {
            req.params.id = "123";
            productService.deleteProduct.mockResolvedValue(null);

            await productController.deleteProduct(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: "Product not found" });
        });
    });
});
