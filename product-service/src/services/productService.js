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
async function createProduct(productData) {

    const newProduct = {
        id: uuidv4(),
        ...productData
    };

    await dynamoDB.send(
        new PutCommand({
            TableName: TABLE_NAME,
            Item: newProduct
        })
    );

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