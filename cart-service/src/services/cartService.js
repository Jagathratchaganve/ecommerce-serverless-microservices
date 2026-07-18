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

// Get Cart (Auto-create if not exists)
async function getCartByUserId(userId) {
    const result = await dynamoDB.send(
        new GetCommand({
            TableName: TABLE_NAME,
            Key: {
                userId
            }
        })
    );

    if (result.Item) {
        return result.Item;
    }

    // Auto create cart if not exists
    const newCart = {
        userId,
        items: [],
        subtotal: 0,
        updatedAt: new Date().toISOString()
    };

    await dynamoDB.send(
        new PutCommand({
            TableName: TABLE_NAME,
            Item: newCart
        })
    );

    return newCart;
}

// Create Cart
async function createCart(userId) {
    const existingCart = await getCartByUserId(userId);
    if (existingCart && existingCart.items.length > 0) {
        return existingCart;
    }

    const newCart = {
        userId,
        items: [],
        subtotal: 0,
        updatedAt: new Date().toISOString()
    };

    await dynamoDB.send(
        new PutCommand({
            TableName: TABLE_NAME,
            Item: newCart
        })
    );

    return newCart;
}

// Add Item To Cart
async function addItemToCart(userId, itemData, accessToken) {
    const productId = itemData.productId;
    const quantity = Number(itemData.quantity || 1);

    if (!productId || quantity <= 0) {
        throw new Error("Invalid product ID or quantity");
    }

    // 1. Validate Product via Product Service HTTP
    let product;
    try {
        const productRes = await axios.get(
            `${process.env.PRODUCT_SERVICE_URL}/api/products/${productId}`,
            {
                headers: {
                    Authorization: accessToken || ""
                }
            }
        );
        product = productRes.data;
    } catch (error) {
        if (error.response && error.response.status === 404) {
            throw new Error("Product does not exist");
        }
        throw new Error("Unable to connect to Product Service");
    }

    // Validate Product Status is ACTIVE
    if (product.status && product.status !== "ACTIVE") {
        throw new Error("Product is currently inactive and cannot be added to cart");
    }

    // Fetch User Cart
    const cart = await getCartByUserId(userId);
    const existingItem = cart.items.find(item => item.productId === productId);
    const targetQuantity = existingItem ? existingItem.quantity + quantity : quantity;

    // 2. Validate Inventory Available Stock via Inventory Service HTTP
    try {
        const inventoryRes = await axios.get(
            `${process.env.INVENTORY_SERVICE_URL}/api/inventory/${productId}`,
            {
                headers: {
                    Authorization: accessToken || ""
                }
            }
        );
        const inventory = inventoryRes.data;
        if (!inventory || (inventory.availableStock !== undefined && inventory.availableStock < targetQuantity)) {
            throw new Error(`Insufficient inventory stock available. Requested: ${targetQuantity}, Available: ${inventory ? inventory.availableStock : 0}`);
        }
    } catch (error) {
        if (error.response && error.response.status === 404) {
            throw new Error("Inventory record not found for this product");
        }
        if (error.message.includes("Insufficient inventory")) {
            throw error;
        }
        console.warn("Could not verify inventory, proceeding:", error.message);
    }

    // 3. Construct Product Snapshot Item
    const price = Number(product.price || itemData.price || 0);
    const itemSubtotal = price * targetQuantity;

    const snapshotItem = {
        productId: product.productId || product.id || productId,
        productName: product.name || itemData.productName || "Product",
        imageUrl: product.imageUrl || itemData.imageUrl || "",
        price: price,
        quantity: targetQuantity,
        subtotal: itemSubtotal
    };

    if (existingItem) {
        existingItem.quantity = targetQuantity;
        existingItem.price = price;
        existingItem.subtotal = itemSubtotal;
        existingItem.productName = snapshotItem.productName;
        existingItem.imageUrl = snapshotItem.imageUrl;
    } else {
        cart.items.push(snapshotItem);
    }

    // Calculate overall Cart subtotal
    cart.subtotal = cart.items.reduce((sum, i) => sum + (Number(i.subtotal) || 0), 0);
    cart.updatedAt = new Date().toISOString();

    await dynamoDB.send(
        new PutCommand({
            TableName: TABLE_NAME,
            Item: cart
        })
    );

    return cart;
}

// Update Cart Item
async function updateCartItem(userId, productId, quantity, accessToken) {
    const cart = await getCartByUserId(userId);
    if (!cart) return null;

    const item = cart.items.find(i => i.productId === productId);
    if (!item) return null;

    const newQuantity = Number(quantity);
    if (newQuantity <= 0) {
        return await removeCartItem(userId, productId);
    }

    // Validate Inventory availableStock if accessToken is provided
    if (process.env.INVENTORY_SERVICE_URL && accessToken) {
        try {
            const inventoryRes = await axios.get(
                `${process.env.INVENTORY_SERVICE_URL}/api/inventory/${productId}`,
                { headers: { Authorization: accessToken } }
            );
            const inventory = inventoryRes.data;
            if (inventory && inventory.availableStock !== undefined && inventory.availableStock < newQuantity) {
                throw new Error(`Insufficient inventory stock available. Requested: ${newQuantity}, Available: ${inventory.availableStock}`);
            }
        } catch (err) {
            if (err.message.includes("Insufficient inventory")) throw err;
        }
    }

    item.quantity = newQuantity;
    item.subtotal = item.price * newQuantity;

    cart.subtotal = cart.items.reduce((sum, i) => sum + (Number(i.subtotal) || 0), 0);
    cart.updatedAt = new Date().toISOString();

    await dynamoDB.send(
        new PutCommand({
            TableName: TABLE_NAME,
            Item: cart
        })
    );

    return cart;
}

// Remove Cart Item
async function removeCartItem(userId, productId) {
    const cart = await getCartByUserId(userId);
    if (!cart) return null;

    cart.items = cart.items.filter(i => i.productId !== productId);
    cart.subtotal = cart.items.reduce((sum, i) => sum + (Number(i.subtotal) || 0), 0);
    cart.updatedAt = new Date().toISOString();

    await dynamoDB.send(
        new PutCommand({
            TableName: TABLE_NAME,
            Item: cart
        })
    );

    return cart;
}

// Remove Purchased Items From Cart (Post-Payment Cleanup)
async function removePurchasedItems(userId, productIds) {
    const cart = await getCartByUserId(userId);
    if (!cart) return null;

    if (!Array.isArray(productIds) || productIds.length === 0) {
        // Clear all items if productIds array is empty or not passed
        cart.items = [];
    } else {
        cart.items = cart.items.filter(i => !productIds.includes(i.productId));
    }

    cart.subtotal = cart.items.reduce((sum, i) => sum + (Number(i.subtotal) || 0), 0);
    cart.updatedAt = new Date().toISOString();

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
    removePurchasedItems,
    deleteCart
};