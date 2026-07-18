const axios = require("axios");
const dynamoDB = require("../config/dynamodb");

const {
    ScanCommand,
    GetCommand,
    PutCommand,
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

// Create Inventory (Called automatically by Product Service HTTP request)
async function createInventory(inventoryData, accessToken) {
    const productId = inventoryData.productId;
    if (!productId) {
        throw new Error("productId is required to create inventory");
    }

    // Check if inventory record already exists
    const existingItem = await getInventoryByProductId(productId);
    if (existingItem) {
        return existingItem;
    }

    const newItem = {
        productId,
        totalStock: Number(inventoryData.totalStock || 0),
        availableStock: Number(inventoryData.availableStock || 0),
        reservedStock: Number(inventoryData.reservedStock || 0),
        lastUpdated: new Date().toISOString()
    };

    await dynamoDB.send(
        new PutCommand({
            TableName: TABLE_NAME,
            Item: newItem
        })
    );

    return newItem;
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

// Update Inventory (Admin Stock Update)
async function updateInventory(productId, updatedData) {
    const existing = await getInventoryByProductId(productId);
    if (!existing) {
        // If not exists, initialize with updatedData
        const newItem = {
            productId,
            totalStock: Number(updatedData.totalStock || 0),
            availableStock: Number(updatedData.availableStock || 0),
            reservedStock: Number(updatedData.reservedStock || 0),
            lastUpdated: new Date().toISOString()
        };

        await dynamoDB.send(
            new PutCommand({
                TableName: TABLE_NAME,
                Item: newItem
            })
        );

        return newItem;
    }

    const totalStock = updatedData.totalStock !== undefined ? Number(updatedData.totalStock) : Number(existing.totalStock || 0);
    const availableStock = updatedData.availableStock !== undefined ? Number(updatedData.availableStock) : Number(existing.availableStock || 0);
    const reservedStock = updatedData.reservedStock !== undefined ? Number(updatedData.reservedStock) : Number(existing.reservedStock || 0);

    const updatedItem = {
        ...existing,
        totalStock,
        availableStock,
        reservedStock,
        lastUpdated: new Date().toISOString()
    };

    await dynamoDB.send(
        new PutCommand({
            TableName: TABLE_NAME,
            Item: updatedItem
        })
    );

    return updatedItem;
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