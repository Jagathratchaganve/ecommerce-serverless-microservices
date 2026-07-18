const express = require("express");

const router = express.Router();

const orderController = require("../controllers/orderController");

const authenticate = require("../middleware/authenticate");
const authorize = require("../middleware/authorize");

router.use(authenticate);

router.get(
    "/all",
    authorize("Admin"),
    orderController.getAllOrders
);

router.get(
    "/my",
    authorize("Admin", "User"),
    orderController.getMyOrders
);

router.get(
    "/:orderId",
    authorize("Admin", "User"),
    orderController.getOrderById
);

router.post(
    "/",
    authorize("Admin", "User"),
    orderController.createOrder
);

router.put(
    "/:orderId/status",
    authorize("Admin", "User"),
    orderController.updateOrder
);

router.put(
    "/:orderId",
    authorize("Admin", "User"),
    orderController.updateOrder
);

router.delete(
    "/:orderId",
    authorize("Admin"),
    orderController.deleteOrder
);

module.exports = router;