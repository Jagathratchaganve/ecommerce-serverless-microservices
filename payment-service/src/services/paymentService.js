const { v4: uuidv4 } = require("uuid");

const dynamoDB = require("../config/dynamodb");

const {
    ScanCommand,
    GetCommand,
    PutCommand,
    DeleteCommand
} = require("@aws-sdk/lib-dynamodb");

const TABLE_NAME =
    process.env.PAYMENT_TABLE || "Payment";

const sns = require("../config/sns");

const {
    PublishCommand
} = require("@aws-sdk/client-sns");

// Get All Payments
async function getPayments() {

    const result = await dynamoDB.send(
        new ScanCommand({
            TableName: TABLE_NAME
        })
    );

    return result.Items || [];
}

// Create Payment
async function createPayment(userId, paymentData) {

    if (paymentData.amount <= 0) {
        throw new Error(
            "Amount must be greater than zero"
        );
    }

    const newPayment = {
        paymentId: uuidv4(),
        userId,
        orderId: paymentData.orderId,

        customerName: paymentData.customerName,
        email: paymentData.email,
        phone: paymentData.phone,

        productId: paymentData.productId,
        quantity: paymentData.quantity,

        amount: paymentData.amount,
        paymentMethod: paymentData.paymentMethod,
        status: "SUCCESS"
    };

    await dynamoDB.send(
        new PutCommand({
            TableName: TABLE_NAME,
            Item: newPayment
        })
    );

    await sns.send(
    new PublishCommand({
        TopicArn: process.env.SNS_TOPIC_ARN,
        Subject: "Payment Success",
        Message: JSON.stringify({
            event: "PAYMENT_SUCCESS",

            paymentId: newPayment.paymentId,
            orderId: newPayment.orderId,

            customerName: newPayment.customerName,
            email: newPayment.email,
            phone: newPayment.phone,

            productId: newPayment.productId,
            quantity: newPayment.quantity,

            amount: newPayment.amount,
            paymentMethod: newPayment.paymentMethod,
            status: newPayment.status
        })
    })
    );

    return newPayment;
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
async function updatePayment(
    paymentId,
    updatedData
) {

    const payment =
    await getPaymentById(paymentId);

    if (!payment) {
        return null;
    }

    const validStatus = [
        "PENDING",
        "SUCCESS",
        "FAILED",
        "REFUNDED"
    ];

    if (
        updatedData.status &&
        !validStatus.includes(updatedData.status)
    ) {
        throw new Error(
            "Invalid payment status"
        );
    }

    const updatedPayment = {
        ...payment,
        ...updatedData,
        paymentId
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
    createPayment,
    getPaymentById,
    updatePayment,
    deletePayment
};