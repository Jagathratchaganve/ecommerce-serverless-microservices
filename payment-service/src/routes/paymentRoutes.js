const express = require('express');

const router =
express.Router();

const paymentController =
require('../controllers/paymentController');

router.get(
    '/',
    paymentController.getAllPayments
);

router.post(
    '/',
    paymentController.createPayment
);

router.get(
    '/:paymentId',
    paymentController.getPaymentById
);

router.put(
    '/:paymentId',
    paymentController.updatePayment
);

router.delete(
    '/:paymentId',
    paymentController.deletePayment
);

module.exports = router;