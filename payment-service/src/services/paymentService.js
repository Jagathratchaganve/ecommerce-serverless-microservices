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
async function createPayment(paymentData) {

    if (paymentData.amount <= 0) {
        throw new Error(
            "Amount must be greater than zero"
        );
    }

    const newPayment = {
        paymentId: uuidv4(),
        orderId: paymentData.orderId,
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