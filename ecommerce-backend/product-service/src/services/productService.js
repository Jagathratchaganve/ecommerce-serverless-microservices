const axios = require("axios");
const { v4: uuidv4 } = require("uuid");

const dynamoDB = require("../config/dynamodb");

const {
    ScanCommand,
    GetCommand,
    PutCommand,
    UpdateCommand,
    DeleteCommand
} = require("@aws-sdk/lib-dynamodb");

const TABLE_NAME = process.env.PRODUCT_TABLE || "Products";

// Get All Products
async function getProducts() {
    const result = await dynamoDB.send(
        new ScanCommand({
            TableName: TABLE_NAME
        })
    );

    return result.Items || [];
}

// Create Product
async function createProduct(productData, accessToken) {
    const productId = uuidv4();

    // Remove stock / quantity if provided (Inventory owns stock)
    const { stock, quantity, ...cleanProductData } = productData;

    const newProduct = {
        id: productId,
        productId: productId,
        name: cleanProductData.name || "",
        brand: cleanProductData.brand || "",
        category: cleanProductData.category || "",
        description: cleanProductData.description || "",
        price: Number(cleanProductData.price || 0),
        discountPrice: Number(cleanProductData.discountPrice || 0),
        imageUrl: cleanProductData.imageUrl || "",
        status: cleanProductData.status || "ACTIVE",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    await dynamoDB.send(
        new PutCommand({
            TableName: TABLE_NAME,
            Item: newProduct
        })
    );

    // Automatically create Inventory record via HTTP (NOT SNS)
    const inventoryServiceUrl = process.env.INVENTORY_SERVICE_URL;
    if (inventoryServiceUrl) {
        try {
            console.log(`Calling Inventory Service to create inventory for product: ${productId}`);
            await axios.post(
                `${inventoryServiceUrl}/api/inventory`,
                {
                    productId: productId,
                    totalStock: 0,
                    availableStock: 0,
                    reservedStock: 0
                },
                {
                    headers: {
                        Authorization: accessToken || ""
                    }
                }
            );
            console.log(`Inventory auto-created for product: ${productId}`);
        } catch (error) {
            console.error("HTTP Call to Inventory Service failed:", error.response?.data || error.message);
            // Re-throw or proceed depending on strictness
            throw new Error(`Product created but failed to initialize inventory: ${error.response?.data?.message || error.message}`);
        }
    }

    return newProduct;
}

// Get Product By Id
async function getProductById(id) {
    const result = await dynamoDB.send(
        new GetCommand({
            TableName: TABLE_NAME,
            Key: {
                id
            }
        })
    );

    return result.Item || null;
}

// Update Product
async function updateProduct(id, updatedData) {
    // Remove stock and quantity from product update payload
    const { stock, quantity, id: _, productId: __, createdAt: ___, ...cleanData } = updatedData;
    cleanData.updatedAt = new Date().toISOString();

    const updateExpression = [];
    const expressionAttributeNames = {};
    const expressionAttributeValues = {};

    for (const key in cleanData) {
        updateExpression.push(`#${key} = :${key}`);
        expressionAttributeNames[`#${key}`] = key;
        expressionAttributeValues[`:${key}`] = cleanData[key];
    }

    if (updateExpression.length === 0) {
        return await getProductById(id);
    }

    try {
        const result = await dynamoDB.send(
            new UpdateCommand({
                TableName: TABLE_NAME,
                Key: {
                    id
                },
                UpdateExpression: `SET ${updateExpression.join(", ")}`,
                ExpressionAttributeNames: expressionAttributeNames,
                ExpressionAttributeValues: expressionAttributeValues,
                ReturnValues: "ALL_NEW"
            })
        );

        return result.Attributes;
    } catch (error) {
        console.error("Error updating product:", error);
        return null;
    }
}

// Delete Product
async function deleteProduct(id) {
    const result = await dynamoDB.send(
        new DeleteCommand({
            TableName: TABLE_NAME,
            Key: {
                id
            },
            ReturnValues: "ALL_OLD"
        })
    );

    return result.Attributes || null;
}

module.exports = {
    getProducts,
    createProduct,
    getProductById,
    updateProduct,
    deleteProduct
};