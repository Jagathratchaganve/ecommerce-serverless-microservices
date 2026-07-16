const cartService = require("../services/cartService");

// Get My Cart
async function getMyCart(req, res) {

    try {

        const cart = await cartService.getCartByUserId(
            req.user.userId
        );

        if (!cart) {

            return res.status(404).json({
                success: false,
                message: "Cart not found"
            });

        }

        res.status(200).json(cart);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

}

// Create Cart
async function createCart(req, res) {

    try {

        const cart = await cartService.createCart(
            req.user.userId
        );

        res.status(201).json(cart);

    } catch (error) {

        console.error(error);

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

        console.error(error);

        res.status(500).json({
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

            req.body.quantity

        );

        if (!cart) {

            return res.status(404).json({
                success: false,
                message: "Item not found"
            });

        }

        res.status(200).json(cart);

    } catch (error) {

        console.error(error);

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
                message: "Item not found"
            });

        }

        res.status(200).json(cart);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

}

// Delete Cart
async function deleteCart(req, res) {

    try {

        const cart = await cartService.deleteCart(
            req.user.userId
        );

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

        console.error(error);

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

}

module.exports = {

    getMyCart,

    createCart,

    addItemToCart,

    updateCartItem,

    removeCartItem,

    deleteCart

};