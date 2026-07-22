const orderController = require("../src/controllers/orderController");
const orderService = require("../src/services/orderService");

jest.mock("../src/services/orderService");
jest.mock("../src/services/logger", () => ({
    info: jest.fn(),
    error: jest.fn()
}));

describe("Order Controller Tests", () => {
    let req, res, next;

    beforeEach(() => {
        jest.clearAllMocks();
        req = {
            user: { userId: "user-123", groups: ["User"] },
            params: {},
            body: {},
            headers: { authorization: "Bearer token" }
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        next = jest.fn();
    });

    describe("getAllOrders", () => {
        test("should return 200 and all orders", async () => {
            const mockOrders = [{ orderId: "o1" }];
            orderService.getOrders.mockResolvedValue(mockOrders);

            await orderController.getAllOrders(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(mockOrders);
        });

        test("should return 500 on database error", async () => {
            orderService.getOrders.mockRejectedValue(new Error("Db error"));

            await orderController.getAllOrders(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: "Db error"
            });
        });
    });

    describe("getMyOrders", () => {
        test("should return 200 and user orders", async () => {
            const mockOrders = [{ orderId: "o1", userId: "user-123" }];
            orderService.getOrdersByUserId.mockResolvedValue(mockOrders);

            await orderController.getMyOrders(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(mockOrders);
        });
    });

    describe("getOrderById", () => {
        test("should return 200 and order if found", async () => {
            const mockOrder = { orderId: "o1", userId: "user-123" };
            orderService.getOrderById.mockResolvedValue(mockOrder);
            req.params.orderId = "o1";

            await orderController.getOrderById(req, res);

            expect(orderService.getOrderById).toHaveBeenCalledWith("o1");
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(mockOrder);
        });

        test("should return 403 if user does not own order", async () => {
            const mockOrder = { orderId: "o1", userId: "other-user" };
            orderService.getOrderById.mockResolvedValue(mockOrder);
            req.params.orderId = "o1";

            await orderController.getOrderById(req, res);

            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: "Access Denied. You do not own this order."
            });
        });

        test("should return 200 if user does not own order but is Admin", async () => {
            const mockOrder = { orderId: "o1", userId: "other-user" };
            orderService.getOrderById.mockResolvedValue(mockOrder);
            req.params.orderId = "o1";
            req.user.groups = ["Admin"];

            await orderController.getOrderById(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(mockOrder);
        });

        test("should return 404 if not found", async () => {
            orderService.getOrderById.mockResolvedValue(null);
            req.params.orderId = "o1";

            await orderController.getOrderById(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: "Order not found"
            });
        });
    });

    describe("createOrder", () => {
        test("should return 201 and created order", async () => {
            const mockOrder = { orderId: "o1" };
            orderService.createOrder.mockResolvedValue(mockOrder);
            req.body = { items: [] };

            await orderController.createOrder(req, res);

            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith(mockOrder);
        });

        test("should return 500 on service error", async () => {
            orderService.createOrder.mockRejectedValue(new Error("Err"));

            await orderController.createOrder(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
        });
    });

    describe("updateOrder", () => {
        test("should return 200 and updated order", async () => {
            const mockOrder = { orderId: "o1", status: "SHIPPED" };
            orderService.updateOrder.mockResolvedValue(mockOrder);
            req.params.orderId = "o1";
            req.body = { status: "SHIPPED" };

            await orderController.updateOrder(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(mockOrder);
        });

        test("should return 404 if not found", async () => {
            orderService.updateOrder.mockResolvedValue(null);
            req.params.orderId = "o1";

            await orderController.updateOrder(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
        });

        test("should return 500 on update failure", async () => {
            orderService.updateOrder.mockRejectedValue(new Error("Invalid status"));
            req.params.orderId = "o1";

            await orderController.updateOrder(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
        });
    });

    describe("deleteOrder", () => {
        test("should return message on successful delete", async () => {
            orderService.deleteOrder.mockResolvedValue({ orderId: "o1" });
            req.params.orderId = "o1";

            await orderController.deleteOrder(req, res);

            expect(orderService.deleteOrder).toHaveBeenCalledWith("o1");
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ success: true, message: "Order deleted successfully" });
        });

        test("should return 404 if delete target not found", async () => {
            orderService.deleteOrder.mockResolvedValue(null);
            req.params.orderId = "o1";

            await orderController.deleteOrder(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
        });
    });
});
