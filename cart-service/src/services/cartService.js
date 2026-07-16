const axios = require("axios");

const dynamoDB = require("../config/dynamodb");

const {
    ScanCommand,
    GetCommand,
    PutCommand,
    DeleteCommand
} = require("@aws-sdk/lib-dynamodb");

const TABLE_NAME = process.env.CART_TABLE || "Cart";

// Get All Carts (Admin Purpose)
async function getCarts() {

    const result = await dynamoDB.send(

        new ScanCommand({

            TableName: TABLE_NAME

        })

    );

    return result.Items || [];

}

// Create Cart
async function createCart(userId) {

    const existingCart = await getCartByUserId(userId);

    if (existingCart) {

        throw new Error("Cart already exists.");

    }

    const newCart = {

        userId,

        items: []

    };

    await dynamoDB.send(

        new PutCommand({

            TableName: TABLE_NAME,

            Item: newCart

        })

    );

    return newCart;

}

// Get Cart
async function getCartByUserId(userId) {

    const result = await dynamoDB.send(

        new GetCommand({

            TableName: TABLE_NAME,

            Key: {

                userId

            }

        })

    );

    return result.Item || null;

}

// Add Item
async function addItemToCart(

    userId,

    itemData,

    accessToken

) {

    // Validate Product

    try {

        await axios.get(

            `${process.env.PRODUCT_SERVICE_URL}/api/products/${itemData.productId}`,

            {

                headers: {

                    Authorization: accessToken

                }

            }

        );

    } catch (error) {

        if (

            error.response &&

            error.response.status === 404

        ) {

            throw new Error("Product does not exist.");

        }

        throw new Error("Unable to connect to Product Service.");

    }

    const cart = await getCartByUserId(userId);

    if (!cart) {

        throw new Error("Cart not found.");

    }

    const existingItem = cart.items.find(

        item =>

            item.productId === itemData.productId

    );

    if (existingItem) {

        existingItem.quantity += itemData.quantity;

    } else {

        cart.items.push(itemData);

    }

    await dynamoDB.send(

        new PutCommand({

            TableName: TABLE_NAME,

            Item: cart

        })

    );

    return cart;

}

// Update Item
async function updateCartItem(

    userId,

    productId,

    quantity

) {

    const cart = await getCartByUserId(userId);

    if (!cart) {

        return null;

    }

    const item = cart.items.find(

        item =>

            item.productId === productId

    );

    if (!item) {

        return null;

    }

    item.quantity = quantity;

    await dynamoDB.send(

        new PutCommand({

            TableName: TABLE_NAME,

            Item: cart

        })

    );

    return cart;

}

// Remove Item
async function removeCartItem(

    userId,

    productId

) {

    const cart = await getCartByUserId(userId);

    if (!cart) {

        return null;

    }

    const index = cart.items.findIndex(

        item =>

            item.productId === productId

    );

    if (index === -1) {

        return null;

    }

    cart.items.splice(index, 1);

    await dynamoDB.send(

        new PutCommand({

            TableName: TABLE_NAME,

            Item: cart

        })

    );

    return cart;

}

// Delete Cart
async function deleteCart(userId) {

    const result = await dynamoDB.send(

        new DeleteCommand({

            TableName: TABLE_NAME,

            Key: {

                userId

            },

            ReturnValues: "ALL_OLD"

        })

    );

    return result.Attributes || null;

}

module.exports = {

    getCarts,

    createCart,

    getCartByUserId,

    addItemToCart,

    updateCartItem,

    removeCartItem,

    deleteCart

};