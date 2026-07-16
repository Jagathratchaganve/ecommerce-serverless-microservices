const express = require("express");

const router = express.Router();

const paymentController = require("../controllers/paymentController");

const authenticate = require("../middleware/authenticate");
const authorize = require("../middleware/authorize");

router.use(authenticate);

router.get(
    "/",
    authorize("Admin", "User"),
    paymentController.getAllPayments
);

router.post(
    "/",
    authorize("Admin", "User"),
    paymentController.createPayment
);

router.get(
    "/:paymentId",
    authorize("Admin", "User"),
    paymentController.getPaymentById
);

router.put(
    "/:paymentId",
    authorize("Admin"),
    paymentController.updatePayment
);

router.delete(
    "/:paymentId",
    authorize("Admin"),
    paymentController.deletePayment
);

module.exports = router;