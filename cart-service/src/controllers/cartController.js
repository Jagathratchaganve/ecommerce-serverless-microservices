const cartService =
require('../services/cartService');

async function getAllCarts(req, res) {

    try {

        const carts =
        await cartService.getCarts();

        res.status(200).json(carts);

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }
}

async function createCart(req, res) {

    try {

        const cart =
        await cartService.createCart(
            req.body
        );

        res.status(201).json(cart);

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }
}

async function getCartByUserId(req, res) {

    const cart =
    await cartService.getCartByUserId(
        req.params.userId
    );

    if (!cart) {

        return res.status(404).json({
            message: 'Cart not found'
        });
    }

    res.json(cart);
}

async function addItemToCart(req, res) {

    try {

        const cart =
        await cartService.addItemToCart(
            req.params.userId,
            req.body
        );

        res.json(cart);

    } catch (error) {

        res.status(500).json({
            message: error.message
        });
    }
}

async function updateCartItem(req, res) {

    const cart =
    await cartService.updateCartItem(
        req.params.userId,
        req.params.productId,
        req.body.quantity
    );

    if (!cart) {

        return res.status(404).json({
            message: 'Item not found'
        });
    }

    res.json(cart);
}

async function removeCartItem(req, res) {

    const cart =
    await cartService.removeCartItem(
        req.params.userId,
        req.params.productId
    );

    if (!cart) {

        return res.status(404).json({
            message: 'Item not found'
        });
    }

    res.json(cart);
}

async function deleteCart(req, res) {

    const cart =
    await cartService.deleteCart(
        req.params.userId
    );

    if (!cart) {

        return res.status(404).json({
            message: 'Cart not found'
        });
    }

    res.json({
        message:
        'Cart deleted successfully'
    });
}

module.exports = {
    getAllCarts,
    createCart,
    getCartByUserId,
    addItemToCart,
    updateCartItem,
    removeCartItem,
    deleteCart
};