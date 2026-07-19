const orderService = require("../services/orderService");

// Get All Orders (Admin)
async function getAllOrders(req, res) {
    try {
        const orders = await orderService.getOrders();
        res.status(200).json(orders);
    } catch (error) {
        console.error("Error fetching all orders:", error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

// Get My Orders (User)
async function getMyOrders(req, res) {
    try {
        const orders = await orderService.getOrdersByUserId(req.user.userId);
        res.status(200).json(orders);
    } catch (error) {
        console.error("Error fetching user orders:", error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

// Create Order (User, status PENDING)
async function createOrder(req, res) {
    try {
        const order = await orderService.createOrder(
            req.body,
            req.headers.authorization,
            req.user.userId
        );

        res.status(201).json(order);
    } catch (error) {
        console.error("Error creating order:", error);
        res.status(error.message.includes("Insufficient inventory") ? 400 : 500).json({
            success: false,
            message: error.message
        });
    }
}

// Get Order By Id
async function getOrderById(req, res) {
    try {
        const order = await orderService.getOrderById(req.params.orderId);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        // Verify Ownership (unless Admin)
        const isAdmin = req.user.groups && req.user.groups.includes("Admin");
        if (!isAdmin && order.userId !== req.user.userId) {
            return res.status(403).json({
                success: false,
                message: "Access Denied. You do not own this order."
            });
        }

        res.status(200).json(order);
    } catch (error) {
        console.error("Error getting order by id:", error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

// Update Order Status (Admin or Payment Service)
async function updateOrder(req, res) {
    try {
        const order = await orderService.updateOrder(
            req.params.orderId,
            req.body
        );

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        res.status(200).json(order);
    } catch (error) {
        console.error("Error updating order:", error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

// Delete Order
async function deleteOrder(req, res) {
    try {
        const order = await orderService.deleteOrder(req.params.orderId);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Order deleted successfully"
        });
    } catch (error) {
        console.error("Error deleting order:", error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

module.exports = {
    getAllOrders,
    getMyOrders,
    createOrder,
    getOrderById,
    updateOrder,
    deleteOrder
};