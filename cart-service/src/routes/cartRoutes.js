const express = require('express');

const router = express.Router();

const cartController =
require('../controllers/cartController');

router.get(
    '/',
    cartController.getAllCarts
);

router.post(
    '/',
    cartController.createCart
);

router.get(
    '/:userId',
    cartController.getCartByUserId
);

router.post(
    '/:userId/items',
    cartController.addItemToCart
);

router.put(
    '/:userId/items/:productId',
    cartController.updateCartItem
);

router.delete(
    '/:userId/items/:productId',
    cartController.removeCartItem
);

router.delete(
    '/:userId',
    cartController.deleteCart
);

module.exports = router;