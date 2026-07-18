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

// Get All Orders (Admin)
async function getOrders() {
    const result = await dynamoDB.send(
        new ScanCommand({
            TableName: TABLE_NAME
        })
    );

    return result.Items || [];
}

// Get Orders By User Id
async function getOrdersByUserId(userId) {
    const allOrders = await getOrders();
    return allOrders.filter(o => o.userId === userId);
}

// Create Order (Status PENDING)
async function createOrder(orderData, accessToken, userId) {
    const orderId = uuidv4();

    // Support single item or items array input
    let itemsInput = orderData.items;
    if (!itemsInput && orderData.productId) {
        itemsInput = [{
            productId: orderData.productId,
            quantity: orderData.quantity || 1,
            price: orderData.price || orderData.amount,
            productName: orderData.productName || "Product",
            imageUrl: orderData.imageUrl || ""
        }];
    }

    if (!Array.isArray(itemsInput) || itemsInput.length === 0) {
        throw new Error("Order must contain at least one item");
    }

    const processedItems = [];
    let subtotal = 0;

    // Validate Inventory & Calculate Subtotal
    for (const item of itemsInput) {
        const productId = item.productId;
        const quantity = Number(item.quantity || 1);

        if (!productId || quantity <= 0) {
            throw new Error("Invalid item in order payload");
        }

        // Check Inventory via HTTP
        if (process.env.INVENTORY_SERVICE_URL) {
            try {
                const invRes = await axios.get(
                    `${process.env.INVENTORY_SERVICE_URL}/api/inventory/${productId}`,
                    {
                        headers: {
                            Authorization: accessToken || ""
                        }
                    }
                );
                const inventory = invRes.data;
                if (!inventory || (inventory.availableStock !== undefined && inventory.availableStock < quantity)) {
                    throw new Error(`Insufficient inventory stock for product: ${productId}. Requested: ${quantity}, Available: ${inventory ? inventory.availableStock : 0}`);
                }
            } catch (error) {
                if (error.response && error.response.status === 404) {
                    throw new Error(`Inventory not found for product: ${productId}`);
                }
                if (error.message.includes("Insufficient inventory")) {
                    throw error;
                }
                console.warn(`Could not check inventory for ${productId}, proceeding:`, error.message);
            }
        }

        const itemPrice = Number(item.price || 0);
        const itemSubtotal = itemPrice * quantity;
        subtotal += itemSubtotal;

        processedItems.push({
            productId,
            productName: item.productName || "Product",
            imageUrl: item.imageUrl || "",
            price: itemPrice,
            quantity: quantity,
            subtotal: itemSubtotal
        });
    }

    const discount = Number(orderData.discount || 0);
    const tax = Number(orderData.tax || 0);
    const shippingCharge = Number(orderData.shippingCharge || 0);
    const total = subtotal - discount + tax + shippingCharge;

    const newOrder = {
        orderId,
        userId,
        address: orderData.address || {},
        customerName: orderData.customerName || "",
        email: orderData.email || "",
        phone: orderData.phone || "",
        items: processedItems,
        subtotal,
        discount,
        tax,
        shippingCharge,
        total: total > 0 ? total : subtotal,
        paymentId: null,
        status: "PENDING",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
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

// Update Order Status (Called by Payment Service HTTP or Admin)
async function updateOrder(orderId, updatedData) {
    const order = await getOrderById(orderId);
    if (!order) {
        return null;
    }

    const validStatuses = [
        "PENDING",
        "PLACED",
        "SHIPPED",
        "OUT_FOR_DELIVERY",
        "DELIVERED",
        "CANCELLED",
        "RETURNED"
    ];

    if (updatedData.status && !validStatuses.includes(updatedData.status)) {
        throw new Error(`Invalid order status: ${updatedData.status}`);
    }

    const updatedOrder = {
        ...order,
        ...updatedData,
        orderId,
        updatedAt: new Date().toISOString()
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
    getOrdersByUserId,
    createOrder,
    getOrderById,
    updateOrder,
    deleteOrder
};