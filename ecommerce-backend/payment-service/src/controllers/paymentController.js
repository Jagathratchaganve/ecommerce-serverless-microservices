const paymentService = require("../services/paymentService");

// Get All Payments (Admin)
async function getAllPayments(req, res) {
    try {
        const payments = await paymentService.getPayments();
        res.status(200).json(payments);
    } catch (error) {
        console.error("Error getting payments:", error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

// Create Payment (Status PENDING)
async function createPayment(req, res) {
    try {
        const payment = await paymentService.createPayment(
            req.user.userId,
            req.body
        );

        res.status(201).json(payment);
    } catch (error) {
        console.error("Error creating payment:", error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

// Confirm Payment Success (POST /api/payments/:paymentId/success)
async function confirmPaymentSuccess(req, res) {
    try {
        const payment = await paymentService.processPaymentSuccess(
            req.params.paymentId,
            req.headers.authorization
        );

        res.status(200).json({
            success: true,
            message: "Payment confirmed successfully",
            payment
        });
    } catch (error) {
        console.error("Error confirming payment success:", error);
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

        // Check ownership if not Admin
        const isAdmin = req.user.groups && req.user.groups.includes("Admin");
        if (!isAdmin && payment.userId !== req.user.userId) {
            return res.status(403).json({
                success: false,
                message: "Access Denied. You do not own this payment."
            });
        }

        res.status(200).json(payment);
    } catch (error) {
        console.error("Error getting payment by id:", error);
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
        console.error("Error updating payment:", error);
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
        console.error("Error deleting payment:", error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

module.exports = {
    getAllPayments,
    createPayment,
    confirmPaymentSuccess,
    getPaymentById,
    updatePayment,
    deletePayment
};