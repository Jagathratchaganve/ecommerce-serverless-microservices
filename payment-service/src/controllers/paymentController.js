const paymentService = require("../services/paymentService");

// Get All Payments
async function getAllPayments(req, res) {

    try {

        const payments = await paymentService.getPayments();

        res.status(200).json(payments);

    } catch (error) {

        console.error(error);

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

}

// Create Payment
async function createPayment(req, res) {

    try {

        const payment = await paymentService.createPayment(

            req.user.userId,

            req.body

        );

        res.status(201).json(payment);

    } catch (error) {

        console.error(error);

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

}

// Get Payment By Id
async function getPaymentById(req, res) {

    try {

        const payment = await paymentService.getPaymentById(

            req.params.paymentId

        );

        if (!payment) {

            return res.status(404).json({

                success: false,

                message: "Payment not found"

            });

        }

        res.status(200).json(payment);

    } catch (error) {

        console.error(error);

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

}

// Update Payment
async function updatePayment(req, res) {

    try {

        const payment = await paymentService.updatePayment(

            req.params.paymentId,

            req.body

        );

        if (!payment) {

            return res.status(404).json({

                success: false,

                message: "Payment not found"

            });

        }

        res.status(200).json(payment);

    } catch (error) {

        console.error(error);

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

}

// Delete Payment
async function deletePayment(req, res) {

    try {

        const payment = await paymentService.deletePayment(

            req.params.paymentId

        );

        if (!payment) {

            return res.status(404).json({

                success: false,

                message: "Payment not found"

            });

        }

        res.status(200).json({

            success: true,

            message: "Payment deleted successfully"

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

    getAllPayments,

    createPayment,

    getPaymentById,

    updatePayment,

    deletePayment

};