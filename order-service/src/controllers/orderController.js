const orderService = require("../services/orderService");

// Get All Orders
async function getAllOrders(req, res) {

    try {

        const orders = await orderService.getOrders();

        res.status(200).json(orders);

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

}

// Create Order
async function createOrder(req, res) {

    try {

        const order = await orderService.createOrder(

            req.body,

            req.headers.authorization,

            req.user.userId

        );

        res.status(201).json(order);

    } catch (error) {

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

}

// Get Order By Id
async function getOrderById(req, res) {

    try {

        const order = await orderService.getOrderById(
            req.params.orderId
        );

        if (!order) {

            return res.status(404).json({

                success: false,

                message: "Order not found"

            });

        }

        res.status(200).json(order);

    } catch (error) {

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

}

// Update Order
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

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

}

// Delete Order
async function deleteOrder(req, res) {

    try {

        const order = await orderService.deleteOrder(
            req.params.orderId
        );

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

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

}

module.exports = {

    getAllOrders,

    createOrder,

    getOrderById,

    updateOrder,

    deleteOrder

};