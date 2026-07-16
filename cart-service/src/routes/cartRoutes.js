const express = require("express");

const router = express.Router();

const cartController = require("../controllers/cartController");

const authenticate = require("../middleware/authenticate");
const authorize = require("../middleware/authorize");

router.use(authenticate);

router.get(
    "/",
    authorize("Admin", "User"),
    cartController.getMyCart
);

router.post(
    "/",
    authorize("Admin", "User"),
    cartController.createCart
);

router.post(
    "/items",
    authorize("Admin", "User"),
    cartController.addItemToCart
);

router.put(
    "/items/:productId",
    authorize("Admin", "User"),
    cartController.updateCartItem
);

router.delete(
    "/items/:productId",
    authorize("Admin", "User"),
    cartController.removeCartItem
);

router.delete(
    "/",
    authorize("Admin", "User"),
    cartController.deleteCart
);

module.exports = router;