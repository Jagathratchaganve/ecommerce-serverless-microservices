const axios = require("axios");
const { v4: uuidv4 } = require("uuid");

const dynamoDB = require("../config/dynamodb");
const {
    ScanCommand,
    GetCommand,
    PutCommand,
    DeleteCommand
} = require("@aws-sdk/lib-dynamodb");

const TABLE_NAME = process.env.PAYMENT_TABLE || "Payment";

const sns = require("../config/sns");
const { PublishCommand } = require("@aws-sdk/client-sns");

// Get All Payments
async function getPayments() {
    const result = await dynamoDB.send(
        new ScanCommand({
            TableName: TABLE_NAME
        })
    );

    return result.Items || [];
}

// Get Payments By User ID
async function getPaymentsByUserId(userId) {
    const allPayments = await getPayments();
    return allPayments.filter(p => p.userId === userId);
}

// Create Payment (Status PENDING)
async function createPayment(userId, paymentData) {
    const amount = Number(paymentData.amount || 0);
    if (amount <= 0) {
        throw new Error("Amount must be greater than zero");
    }

    if (!paymentData.orderId) {
        throw new Error("orderId is required to create payment");
    }

    const newPayment = {
        paymentId: uuidv4(),
        userId,
        orderId: paymentData.orderId,
        customerName: paymentData.customerName || "",
        email: paymentData.email || "",
        phone: paymentData.phone || "",
        productId: paymentData.productId || null,
        quantity: paymentData.quantity || null,
        items: paymentData.items || [],
        amount: amount,
        paymentMethod: paymentData.paymentMethod || "CARD",
        status: "PENDING",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    await dynamoDB.send(
        new PutCommand({
            TableName: TABLE_NAME,
            Item: newPayment
        })
    );

    return newPayment;
}

// Process Payment Success (POST /api/payments/:paymentId/success)
async function processPaymentSuccess(paymentId, accessToken) {
    const payment = await getPaymentById(paymentId);
    if (!payment) {
        throw new Error("Payment record not found");
    }

    if (payment.status === "SUCCESS") {
        return payment;
    }

    // 1. Update Payment status to SUCCESS
    payment.status = "SUCCESS";
    payment.updatedAt = new Date().toISOString();

    await dynamoDB.send(
        new PutCommand({
            TableName: TABLE_NAME,
            Item: payment
        })
    );

    // 2. Call Order Service HTTP -> Order status becomes PLACED
    let updatedOrder = null;
    if (process.env.ORDER_SERVICE_URL && payment.orderId) {
        try {
            console.log(`Calling Order Service HTTP to update order ${payment.orderId} to PLACED`);
            const orderRes = await axios.put(
                `${process.env.ORDER_SERVICE_URL}/api/orders/${payment.orderId}/status`,
                {
                    status: "PLACED",
                    paymentId: payment.paymentId
                },
                {
                    headers: {
                        Authorization: accessToken || ""
                    }
                }
            );
            updatedOrder = orderRes.data;
            console.log(`Order ${payment.orderId} updated to PLACED successfully`);
        } catch (error) {
            console.error("Failed to update Order Service HTTP:", error.response?.data || error.message);
        }
    }

    // 3. Call Cart Service HTTP -> Remove purchased items / Clear cart
    if (process.env.CART_SERVICE_URL && payment.userId) {
        try {
            console.log(`Calling Cart Service HTTP to clear cart for user ${payment.userId}`);
            await axios.post(
                `${process.env.CART_SERVICE_URL}/api/cart/clear`,
                {
                    userId: payment.userId,
                    productIds: updatedOrder?.items ? updatedOrder.items.map(i => i.productId) : []
                },
                {
                    headers: {
                        Authorization: accessToken || ""
                    }
                }
            );
            console.log(`Cart cleared for user ${payment.userId}`);
        } catch (error) {
            console.error("Failed to call Cart Service HTTP:", error.response?.data || error.message);
        }
    }

    // 4. Publish SNS Event PAYMENT_SUCCESS (for asynchronous consumers: inventory-consumer & email-consumer)
    if (process.env.SNS_TOPIC_ARN) {
        try {
            const orderItems = updatedOrder?.items || payment.items || (payment.productId ? [{ productId: payment.productId, quantity: payment.quantity || 1 }] : []);

            console.log("Publishing PAYMENT_SUCCESS event to SNS...");
            await sns.send(
                new PublishCommand({
                    TopicArn: process.env.SNS_TOPIC_ARN,
                    Subject: "Payment Success",
                    Message: JSON.stringify({
                        event: "PAYMENT_SUCCESS",
                        paymentId: payment.paymentId,
                        orderId: payment.orderId,
                        userId: payment.userId,
                        customerName: payment.customerName || updatedOrder?.customerName || "Valued Customer",
                        email: payment.email || updatedOrder?.email || "",
                        phone: payment.phone || updatedOrder?.phone || "",
                        items: orderItems,
                        productId: payment.productId || (orderItems[0]?.productId),
                        quantity: payment.quantity || (orderItems[0]?.quantity || 1),
                        amount: payment.amount,
                        paymentMethod: payment.paymentMethod,
                        status: "SUCCESS"
                    })
                })
            );
            console.log("SNS PAYMENT_SUCCESS event published successfully");
        } catch (snsError) {
            console.error("Failed to publish SNS PAYMENT_SUCCESS event:", snsError.message);
        }
    }

    return payment;
}

// Get Payment By Id
async function getPaymentById(paymentId) {
    const result = await dynamoDB.send(
        new GetCommand({
            TableName: TABLE_NAME,
            Key: {
                paymentId
            }
        })
    );

    return result.Item || null;
}

// Update Payment
async function updatePayment(paymentId, updatedData) {
    const payment = await getPaymentById(paymentId);
    if (!payment) {
        return null;
    }

    const validStatus = [
        "PENDING",
        "SUCCESS",
        "FAILED",
        "REFUNDED"
    ];

    if (updatedData.status && !validStatus.includes(updatedData.status)) {
        throw new Error("Invalid payment status");
    }

    const updatedPayment = {
        ...payment,
        ...updatedData,
        paymentId,
        updatedAt: new Date().toISOString()
    };

    await dynamoDB.send(
        new PutCommand({
            TableName: TABLE_NAME,
            Item: updatedPayment
        })
    );

    return updatedPayment;
}

// Delete Payment
async function deletePayment(paymentId) {
    const result = await dynamoDB.send(
        new DeleteCommand({
            TableName: TABLE_NAME,
            Key: {
                paymentId
            },
            ReturnValues: "ALL_OLD"
        })
    );

    return result.Attributes || null;
}

module.exports = {
    getPayments,
    getPaymentsByUserId,
    createPayment,
    processPaymentSuccess,
    getPaymentById,
    updatePayment,
    deletePayment
};