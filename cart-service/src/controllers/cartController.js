const cartService = require("../services/cartService");

// Get All Carts (Admin)
async function getAllCarts(req, res) {
    try {
        const carts = await cartService.getCarts();
        res.status(200).json(carts);
    } catch (error) {
        console.error("Error fetching carts:", error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

// Get My Cart
async function getMyCart(req, res) {
    try {
        const cart = await cartService.getCartByUserId(req.user.userId);
        res.status(200).json(cart);
    } catch (error) {
        console.error("Error getting cart:", error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

// Create Cart
async function createCart(req, res) {
    try {
        const cart = await cartService.createCart(req.user.userId);
        res.status(201).json(cart);
    } catch (error) {
        console.error("Error creating cart:", error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

// Add Item To Cart
async function addItemToCart(req, res) {
    try {
        const cart = await cartService.addItemToCart(
            req.user.userId,
            req.body,
            req.headers.authorization
        );
        res.status(200).json(cart);
    } catch (error) {
        console.error("Error adding item to cart:", error);
        res.status(error.message.includes("does not exist") ? 404 : error.message.includes("Insufficient inventory") ? 400 : 500).json({
            success: false,
            message: error.message
        });
    }
}

// Update Cart Item
async function updateCartItem(req, res) {
    try {
        const cart = await cartService.updateCartItem(
            req.user.userId,
            req.params.productId,
            req.body.quantity,
            req.headers.authorization
        );

        if (!cart) {
            return res.status(404).json({
                success: false,
                message: "Item or cart not found"
            });
        }

        res.status(200).json(cart);
    } catch (error) {
        console.error("Error updating cart item:", error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

// Remove Cart Item
async function removeCartItem(req, res) {
    try {
        const cart = await cartService.removeCartItem(
            req.user.userId,
            req.params.productId
        );

        if (!cart) {
            return res.status(404).json({
                success: false,
                message: "Item or cart not found"
            });
        }

        res.status(200).json(cart);
    } catch (error) {
        console.error("Error removing cart item:", error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

// Remove Purchased Items / Clear Cart (Post-Payment API)
async function removePurchasedItems(req, res) {
    try {
        const userId = req.body.userId || req.user.userId;
        const productIds = req.body.productIds || [];

        const cart = await cartService.removePurchasedItems(userId, productIds);
        res.status(200).json({
            success: true,
            message: "Purchased items removed from cart successfully",
            cart
        });
    } catch (error) {
        console.error("Error removing purchased items from cart:", error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

// Delete Cart
async function deleteCart(req, res) {
    try {
        const cart = await cartService.deleteCart(req.user.userId);
        if (!cart) {
            return res.status(404).json({
                success: false,
                message: "Cart not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Cart deleted successfully"
        });
    } catch (error) {
        console.error("Error deleting cart:", error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

module.exports = {
    getAllCarts,
    getMyCart,
    createCart,
    addItemToCart,
    updateCartItem,
    removeCartItem,
    removePurchasedItems,
    deleteCart
};