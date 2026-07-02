const orderService =
require('../services/orderService');

async function getAllOrders(
    req,
    res
) {

    try {

        const orders =
        await orderService.getOrders();

        res.status(200).json(
            orders
        );

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }
}

async function createOrder(
    req,
    res
) {

    try {

        const order =
        await orderService.createOrder(
            req.body
        );

        res.status(201).json(
            order
        );

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }
}

async function getOrderById(
    req,
    res
) {

    const order =
    await orderService.getOrderById(
        req.params.orderId
    );

    if (!order) {

        return res.status(404).json({
            message:
            'Order not found'
        });

    }

    res.json(order);
}

async function updateOrder(
    req,
    res
) {

    try {

        const order =
        await orderService.updateOrder(
            req.params.orderId,
            req.body
        );

        if (!order) {

            return res.status(404).json({
                message:
                'Order not found'
            });

        }

        res.json(order);

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }
}

async function deleteOrder(
    req,
    res
) {

    const order =
    await orderService.deleteOrder(
        req.params.orderId
    );

    if (!order) {

        return res.status(404).json({
            message:
            'Order not found'
        });

    }

    res.json({
        message:
        'Order deleted successfully'
    });
}

module.exports = {
    getAllOrders,
    createOrder,
    getOrderById,
    updateOrder,
    deleteOrder
};