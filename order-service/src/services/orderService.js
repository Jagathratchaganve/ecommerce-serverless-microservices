const axios = require("axios");
const { v4: uuidv4 } = require("uuid");

const dynamoDB = require("../config/dynamodb");

const {
    ScanCommand,
    GetCommand,
    PutCommand,
    DeleteCommand
} = require("@aws-sdk/lib-dynamodb");

const TABLE_NAME = process.env.ORDER_TABLE || "Order";

// Get All Orders
async function getOrders() {

    const result = await dynamoDB.send(
        new ScanCommand({
            TableName: TABLE_NAME
        })
    );

    return result.Items || [];
}

// Create Order
async function createOrder(orderData) {

    let inventoryItem;

    // Check Inventory
    try {

        const inventoryResponse =
        await axios.get(
            `${process.env.INVENTORY_SERVICE_URL}/api/inventory/${orderData.productId}`
        );

        inventoryItem = inventoryResponse.data;

    } catch (error) {

        throw new Error(
            "Inventory not found"
        );
    }

    if (
        inventoryItem.quantity <
        orderData.quantity
    ) {

        throw new Error(
            "Insufficient stock"
        );
    }

    // Generate Order ID
    const orderId = uuidv4();

    let payment;

    // Create Payment
    try {

        const paymentResponse =
        await axios.post(
            `${process.env.PAYMENT_SERVICE_URL}/api/payments`,
            {
                orderId,
                amount: orderData.amount,
                paymentMethod:
                orderData.paymentMethod
            }
        );

        payment =
        paymentResponse.data;

        if (
            payment.status !== "SUCCESS"
        ) {

            throw new Error(
                "Payment not completed"
            );

        }

    } catch (error) {

        throw new Error(
            "Payment creation failed"
        );

    }

    const newOrder = {

        orderId,

        productId:
        orderData.productId,

        quantity:
        orderData.quantity,

        amount:
        orderData.amount,

        paymentId:
        payment.paymentId,

        status: "PLACED"

    };

    await dynamoDB.send(
        new PutCommand({
            TableName: TABLE_NAME,
            Item: newOrder
        })
    );

    return newOrder;
}

// Get Order By Id
async function getOrderById(orderId) {

    const result = await dynamoDB.send(
        new GetCommand({
            TableName: TABLE_NAME,
            Key: {
                orderId
            }
        })
    );

    return result.Item || null;
}

// Update Order
async function updateOrder(
    orderId,
    updatedData
) {

    const order =
    await getOrderById(orderId);

    if (!order) {
        return null;
    }

    const validStatus = [
        "PLACED",
        "SHIPPED",
        "DELIVERED",
        "CANCELLED"
    ];

    if (
        updatedData.status &&
        !validStatus.includes(
            updatedData.status
        )
    ) {

        throw new Error(
            "Invalid order status"
        );

    }

    const updatedOrder = {

        ...order,

        ...updatedData,

        orderId

    };

    await dynamoDB.send(
        new PutCommand({
            TableName: TABLE_NAME,
            Item: updatedOrder
        })
    );

    return updatedOrder;
}

// Delete Order
async function deleteOrder(orderId) {

    const result = await dynamoDB.send(
        new DeleteCommand({
            TableName: TABLE_NAME,
            Key: {
                orderId
            },
            ReturnValues: "ALL_OLD"
        })
    );

    return result.Attributes || null;
}

module.exports = {
    getOrders,
    createOrder,
    getOrderById,
    updateOrder,
    deleteOrder
};