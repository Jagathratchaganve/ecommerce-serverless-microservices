const express = require("express");

const router = express.Router();

const orderController = require("../controllers/orderController");

const authenticate = require("../middleware/authenticate");
const authorize = require("../middleware/authorize");

router.use(authenticate);

router.get(
    "/",
    authorize("Admin", "User"),
    orderController.getAllOrders
);

router.get(
    "/:orderId",
    authorize("Admin", "User"),
    orderController.getOrderById
);

router.post(
    "/",
    authorize("User"),
    orderController.createOrder
);

router.put(
    "/:orderId",
    authorize("Admin"),
    orderController.updateOrder
);

router.delete(
    "/:orderId",
    authorize("Admin"),
    orderController.deleteOrder
);

module.exports = router;