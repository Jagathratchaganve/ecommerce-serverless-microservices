const axios = require("axios");

const dynamoDB = require("../config/dynamodb");

const {
    ScanCommand,
    GetCommand,
    PutCommand,
    UpdateCommand,
    DeleteCommand
} = require("@aws-sdk/lib-dynamodb");

const TABLE_NAME = process.env.INVENTORY_TABLE || "Inventory";

// Get All Inventory
async function getInventory() {

    const result = await dynamoDB.send(
        new ScanCommand({
            TableName: TABLE_NAME
        })
    );

    return result.Items || [];
}

// Create Inventory
async function createInventory(inventoryData) {

    // Verify Product Exists
    try {

        await axios.get(
            `${process.env.PRODUCT_SERVICE_URL}/api/products/${inventoryData.productId}`
        );

    } catch (error) {

        if (error.response && error.response.status === 404) {
            throw new Error("Product does not exist");
        }

        throw new Error("Unable to connect to Product Service");
    }

    // Check Inventory Already Exists
    const existingItem = await getInventoryByProductId(
        inventoryData.productId
    );

    if (existingItem) {
        throw new Error(
            "Inventory already exists for this product"
        );
    }

    await dynamoDB.send(
        new PutCommand({
            TableName: TABLE_NAME,
            Item: inventoryData
        })
    );

    return inventoryData;
}

// Get Inventory By Product Id
async function getInventoryByProductId(productId) {

    const result = await dynamoDB.send(
        new GetCommand({
            TableName: TABLE_NAME,
            Key: {
                productId
            }
        })
    );

    return result.Item || null;
}

// Update Inventory
async function updateInventory(productId, updatedData) {

    const updateExpression = [];
    const expressionAttributeNames = {};
    const expressionAttributeValues = {};

    for (const key in updatedData) {

        updateExpression.push(`#${key} = :${key}`);

        expressionAttributeNames[`#${key}`] = key;

        expressionAttributeValues[`:${key}`] = updatedData[key];
    }

    try {

        const result = await dynamoDB.send(
            new UpdateCommand({
                TableName: TABLE_NAME,
                Key: {
                    productId
                },
                UpdateExpression: `SET ${updateExpression.join(", ")}`,
                ExpressionAttributeNames: expressionAttributeNames,
                ExpressionAttributeValues: expressionAttributeValues,
                ReturnValues: "ALL_NEW"
            })
        );

        return result.Attributes;

    } catch (error) {

        return null;
    }
}

// Delete Inventory
async function deleteInventory(productId) {

    const result = await dynamoDB.send(
        new DeleteCommand({
            TableName: TABLE_NAME,
            Key: {
                productId
            },
            ReturnValues: "ALL_OLD"
        })
    );

    return result.Attributes || null;
}

module.exports = {
    getInventory,
    createInventory,
    getInventoryByProductId,
    updateInventory,
    deleteInventory
};