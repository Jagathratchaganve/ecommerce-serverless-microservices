process.env.COGNITO_USER_POOL_ID = "us-east-1_abcdefghi";
process.env.COGNITO_CLIENT_ID = "mock-client-id";
process.env.AWS_REGION = "us-east-1";

const cartService = require("../src/services/cartService");
const dynamoDB = require("../src/config/dynamodb");
const axios = require("axios");

jest.mock("../src/config/dynamodb", () => ({
    send: jest.fn()
}));
jest.mock("axios");

describe("Cart Service Tests", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        process.env.CART_TABLE = "CartTest";
        process.env.PRODUCT_SERVICE_URL = "http://product-service";
        process.env.INVENTORY_SERVICE_URL = "http://inventory-service";
    });

    test("should use default TableName if CART_TABLE is not set", async () => {
        delete process.env.CART_TABLE;
        delete require.cache[require.resolve("../src/services/cartService")];
        const freshCartService = require("../src/services/cartService");
        
        dynamoDB.send.mockResolvedValueOnce({ Item: { userId: "u1", items: [] } });
        const result = await freshCartService.getCartByUserId("u1");
        expect(result.userId).toBe("u1");
    });

    describe("getCarts", () => {
        test("should return all carts", async () => {
            const mockCarts = [{ userId: "u1", items: [] }];
            dynamoDB.send.mockResolvedValue({ Items: mockCarts });

            const result = await cartService.getCarts();

            expect(result).toEqual(mockCarts);
        });
    });

    describe("getCartByUserId", () => {
        test("should return existing cart if found", async () => {
            const mockCart = { userId: "u1", items: [{ productId: "p1", quantity: 2 }] };
            dynamoDB.send.mockResolvedValue({ Item: mockCart });

            const result = await cartService.getCartByUserId("u1");

            expect(result).toEqual(mockCart);
        });

        test("should auto-create and return new cart if not found", async () => {
            dynamoDB.send.mockResolvedValueOnce({}); // get
            dynamoDB.send.mockResolvedValueOnce({}); // put

            const result = await cartService.getCartByUserId("u2");

            expect(result.userId).toBe("u2");
            expect(result.items).toEqual([]);
            expect(result.subtotal).toBe(0);
        });
    });

    describe("createCart", () => {
        test("should return existing cart if it has items", async () => {
            const mockCart = { userId: "u1", items: [{ productId: "p1" }] };
            dynamoDB.send.mockResolvedValueOnce({ Item: mockCart }); // getCartByUserId

            const result = await cartService.createCart("u1");

            expect(result).toEqual(mockCart);
        });

        test("should create new cart if empty or missing", async () => {
            dynamoDB.send.mockResolvedValueOnce({ Item: { userId: "u1", items: [] } }); // getCartByUserId empty
            dynamoDB.send.mockResolvedValueOnce({}); // put

            const result = await cartService.createCart("u1");

            expect(result.userId).toBe("u1");
            expect(result.items).toEqual([]);
        });
    });

    describe("addItemToCart", () => {
        test("should throw error on invalid productId or quantity", async () => {
            await expect(cartService.addItemToCart("u1", { productId: "", quantity: 1 }))
                .rejects.toThrow("Invalid product ID or quantity");
            await expect(cartService.addItemToCart("u1", { productId: "p1", quantity: -1 }))
                .rejects.toThrow("Invalid product ID or quantity");
        });

        test("should throw error if product does not exist (404)", async () => {
            const axiosError = new Error("Not found");
            axiosError.response = { status: 404 };
            axios.get.mockRejectedValue(axiosError);

            await expect(cartService.addItemToCart("u1", { productId: "p1", quantity: 2 }, "token"))
                .rejects.toThrow("Product does not exist");
        });

        test("should throw error if Product Service is down", async () => {
            axios.get.mockRejectedValue(new Error("Network error"));

            await expect(cartService.addItemToCart("u1", { productId: "p1", quantity: 2 }, "token"))
                .rejects.toThrow("Unable to connect to Product Service");
        });

        test("should throw error if product is INACTIVE", async () => {
            axios.get.mockResolvedValueOnce({ data: { productId: "p1", name: "P1", status: "INACTIVE" } });

            await expect(cartService.addItemToCart("u1", { productId: "p1", quantity: 2 }, "token"))
                .rejects.toThrow("Product is currently inactive and cannot be added to cart");
        });

        test("should throw error if inventory stock is insufficient", async () => {
            axios.get.mockResolvedValueOnce({ data: { productId: "p1", name: "P1", status: "ACTIVE", price: 100 } }); // product
            dynamoDB.send.mockResolvedValueOnce({ Item: { userId: "u1", items: [] } }); // getCartByUserId
            axios.get.mockResolvedValueOnce({ data: { productId: "p1", availableStock: 1 } }); // inventory

            await expect(cartService.addItemToCart("u1", { productId: "p1", quantity: 5 }, "token"))
                .rejects.toThrow("Insufficient inventory stock available");
        });

        test("should handle inventory 404 error", async () => {
            axios.get.mockResolvedValueOnce({ data: { productId: "p1", name: "P1", status: "ACTIVE", price: 100 } }); // product
            dynamoDB.send.mockResolvedValueOnce({ Item: { userId: "u1", items: [] } }); // getCartByUserId
            const axiosError = new Error("Not found");
            axiosError.response = { status: 404 };
            axios.get.mockRejectedValueOnce(axiosError); // inventory

            await expect(cartService.addItemToCart("u1", { productId: "p1", quantity: 5 }, "token"))
                .rejects.toThrow("Inventory record not found for this product");
        });

        test("should proceed and add item if inventory check fails (other than 404)", async () => {
            axios.get.mockResolvedValueOnce({ data: { productId: "p1", name: "P1", status: "ACTIVE", price: 100 } }); // product
            dynamoDB.send.mockResolvedValueOnce({ Item: { userId: "u1", items: [] } }); // getCartByUserId
            axios.get.mockRejectedValueOnce(new Error("Timeout")); // inventory timeout
            dynamoDB.send.mockResolvedValueOnce({}); // put

            const result = await cartService.addItemToCart("u1", { productId: "p1", quantity: 2 }, "token");

            expect(result.items.length).toBe(1);
            expect(result.items[0].productId).toBe("p1");
            expect(result.items[0].quantity).toBe(2);
        });

        test("should add product to cart successfully", async () => {
            axios.get.mockResolvedValueOnce({ data: { productId: "p1", name: "P1", status: "ACTIVE", price: 100 } }); // product
            dynamoDB.send.mockResolvedValueOnce({ Item: { userId: "u1", items: [] } }); // getCartByUserId
            axios.get.mockResolvedValueOnce({ data: { productId: "p1", availableStock: 10 } }); // inventory
            dynamoDB.send.mockResolvedValueOnce({}); // put

            const result = await cartService.addItemToCart("u1", { productId: "p1", quantity: 2 }, "token");

            expect(result.items.length).toBe(1);
            expect(result.items[0].productId).toBe("p1");
            expect(result.items[0].quantity).toBe(2);
            expect(result.subtotal).toBe(200);
        });

        test("should update quantity if product already in cart", async () => {
            axios.get.mockResolvedValueOnce({ data: { productId: "p1", name: "P1", status: "ACTIVE", price: 100 } }); // product
            dynamoDB.send.mockResolvedValueOnce({ Item: { userId: "u1", items: [{ productId: "p1", quantity: 1, price: 100, subtotal: 100 }] } }); // getCartByUserId
            axios.get.mockResolvedValueOnce({ data: { productId: "p1", availableStock: 10 } }); // inventory
            dynamoDB.send.mockResolvedValueOnce({}); // put

            const result = await cartService.addItemToCart("u1", { productId: "p1", quantity: 2 }, "token");

            expect(result.items[0].quantity).toBe(3); // 1 + 2
            expect(result.subtotal).toBe(300);
        });

        test("should support fallbacks for missing access token and null inventory", async () => {
            axios.get.mockResolvedValueOnce({ data: { productId: "p1", name: "P1", status: "ACTIVE", price: 100 } }); // product
            dynamoDB.send.mockResolvedValueOnce({ Item: { userId: "u1", items: [] } }); // getCartByUserId
            axios.get.mockResolvedValueOnce({ data: null }); // inventory is null
            
            await expect(cartService.addItemToCart("u1", { productId: "p1", quantity: 5 }, undefined))
                .rejects.toThrow("Insufficient inventory stock available");
        });

        test("should support fallbacks for product snapshot properties and default quantity", async () => {
            axios.get.mockResolvedValueOnce({ data: { status: "ACTIVE" } }); // product has no price, name, productId, imageUrl
            dynamoDB.send.mockResolvedValueOnce({ Item: { userId: "u1", items: [] } }); // getCartByUserId
            axios.get.mockResolvedValueOnce({ data: { availableStock: 10 } }); // inventory
            dynamoDB.send.mockResolvedValueOnce({}); // put

            const result = await cartService.addItemToCart("u1", { productId: "p1" }, "token"); // default quantity = 1

            expect(result.items[0].price).toBe(0);
            expect(result.items[0].productId).toBe("p1");
            expect(result.items[0].productName).toBe("Product");
            expect(result.items[0].imageUrl).toBe("");
        });
    });

    describe("updateCartItem", () => {
        test("should return null if item is not in cart", async () => {
            const initialCart = { userId: "u1", items: [{ productId: "p2", price: 10, quantity: 2, subtotal: 20 }] };
            dynamoDB.send.mockResolvedValueOnce({ Item: initialCart }); // getCartByUserId

            const result = await cartService.updateCartItem("u1", "p1", 5, "token");
            expect(result).toBeNull();
        });

        test("should remove item if quantity is <= 0", async () => {
            const initialCart = { userId: "u1", items: [{ productId: "p1", price: 10, quantity: 2, subtotal: 20 }] };
            dynamoDB.send.mockResolvedValueOnce({ Item: initialCart }); // getCartByUserId
            dynamoDB.send.mockResolvedValueOnce({}); // put for removal

            const result = await cartService.updateCartItem("u1", "p1", 0, "token");

            expect(result.items.length).toBe(0);
            expect(result.subtotal).toBe(0);
        });

        test("should update quantity and subtotal if inventory is sufficient", async () => {
            const initialCart = { userId: "u1", items: [{ productId: "p1", price: 10, quantity: 2, subtotal: 20 }] };
            dynamoDB.send.mockResolvedValueOnce({ Item: initialCart }); // getCartByUserId
            axios.get.mockResolvedValueOnce({ data: { productId: "p1", availableStock: 10 } }); // inventory
            dynamoDB.send.mockResolvedValueOnce({}); // put

            const result = await cartService.updateCartItem("u1", "p1", 5, "token");

            expect(result.items[0].quantity).toBe(5);
            expect(result.items[0].subtotal).toBe(50);
            expect(result.subtotal).toBe(50);
        });

        test("should handle missing subtotal fallback in calculation", async () => {
            const initialCart = { userId: "u1", items: [{ productId: "p1", price: 10, quantity: 2 }] }; // missing subtotal
            dynamoDB.send.mockResolvedValueOnce({ Item: initialCart }); // getCartByUserId
            axios.get.mockResolvedValueOnce({ data: { productId: "p1", availableStock: 10 } }); // inventory
            dynamoDB.send.mockResolvedValueOnce({}); // put

            const result = await cartService.updateCartItem("u1", "p1", 5, "token");
            expect(result.subtotal).toBe(50);
        });

        test("should throw error if inventory insufficient during update", async () => {
            const initialCart = { userId: "u1", items: [{ productId: "p1", price: 10, quantity: 2, subtotal: 20 }] };
            dynamoDB.send.mockResolvedValueOnce({ Item: initialCart }); // getCartByUserId
            axios.get.mockResolvedValueOnce({ data: { productId: "p1", availableStock: 3 } }); // inventory

            await expect(cartService.updateCartItem("u1", "p1", 5, "token"))
                .rejects.toThrow("Insufficient inventory stock available");
        });

        test("should proceed if inventory service is not configured or token is missing", async () => {
            const initialCart = { userId: "u1", items: [{ productId: "p1", price: 10, quantity: 2, subtotal: 20 }] };
            dynamoDB.send.mockResolvedValueOnce({ Item: initialCart }); // getCartByUserId
            dynamoDB.send.mockResolvedValueOnce({}); // put

            const result = await cartService.updateCartItem("u1", "p1", 5, undefined); // no token
            expect(result.items[0].quantity).toBe(5);
        });

        test("should survive and update if inventory fetch throws error", async () => {
            const initialCart = { userId: "u1", items: [{ productId: "p1", price: 10, quantity: 2, subtotal: 20 }] };
            dynamoDB.send.mockResolvedValueOnce({ Item: initialCart }); // getCartByUserId
            axios.get.mockRejectedValueOnce(new Error("Timeout")); // timeout
            dynamoDB.send.mockResolvedValueOnce({}); // put

            const result = await cartService.updateCartItem("u1", "p1", 5, "token");
            expect(result.items[0].quantity).toBe(5);
        });
    });

    describe("removeCartItem", () => {
        test("should remove item from items list", async () => {
            const initialCart = { userId: "u1", items: [{ productId: "p1", price: 10, quantity: 2, subtotal: 20 }, { productId: "p2", price: 5, quantity: 1, subtotal: 5 }] };
            dynamoDB.send.mockResolvedValueOnce({ Item: initialCart }); // getCartByUserId
            dynamoDB.send.mockResolvedValueOnce({}); // put

            const result = await cartService.removeCartItem("u1", "p1");

            expect(result.items.length).toBe(1);
            expect(result.items[0].productId).toBe("p2");
            expect(result.subtotal).toBe(5);
        });
    });

    describe("removePurchasedItems", () => {
        test("should clear entire cart if productIds is empty or null", async () => {
            const initialCart = { userId: "u1", items: [{ productId: "p1", subtotal: 10 }] };
            dynamoDB.send.mockResolvedValueOnce({ Item: initialCart }); // getCartByUserId
            dynamoDB.send.mockResolvedValueOnce({}); // put

            const result = await cartService.removePurchasedItems("u1", []);

            expect(result.items.length).toBe(0);
            expect(result.subtotal).toBe(0);
        });

        test("should clear entire cart if productIds is not an array", async () => {
            const initialCart = { userId: "u1", items: [{ productId: "p1", subtotal: 10 }] };
            dynamoDB.send.mockResolvedValueOnce({ Item: initialCart }); // getCartByUserId
            dynamoDB.send.mockResolvedValueOnce({}); // put

            const result = await cartService.removePurchasedItems("u1", null);

            expect(result.items.length).toBe(0);
        });

        test("should clear only specified product IDs from cart", async () => {
            const initialCart = { userId: "u1", items: [{ productId: "p1", subtotal: 10 }, { productId: "p2", subtotal: 20 }] };
            dynamoDB.send.mockResolvedValueOnce({ Item: initialCart }); // getCartByUserId
            dynamoDB.send.mockResolvedValueOnce({}); // put

            const result = await cartService.removePurchasedItems("u1", ["p1"]);

            expect(result.items.length).toBe(1);
            expect(result.items[0].productId).toBe("p2");
            expect(result.subtotal).toBe(20);
        });
    });

    describe("deleteCart", () => {
        test("should delete cart and return OLD attributes", async () => {
            const oldCart = { userId: "u1", items: [] };
            dynamoDB.send.mockResolvedValue({ Attributes: oldCart });

            const result = await cartService.deleteCart("u1");

            expect(result).toEqual(oldCart);
        });
    });
});
