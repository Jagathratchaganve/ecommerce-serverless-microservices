const paymentService =
require('../services/paymentService');

async function getAllPayments(
    req,
    res
) {

    try {

        const payments =
        await paymentService.getPayments();

        res.status(200).json(
            payments
        );

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }
}

async function createPayment(
    req,
    res
) {

    try {

        const payment =
        await paymentService.createPayment(
            req.body
        );

        res.status(201).json(
            payment
        );

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }
}

async function getPaymentById(
    req,
    res
) {

    const payment =
    await paymentService.getPaymentById(
        req.params.paymentId
    );

    if (!payment) {

        return res.status(404).json({
            message:
            'Payment not found'
        });

    }

    res.json(payment);
}

async function updatePayment(
    req,
    res
) {

    try {

        const payment =
        await paymentService.updatePayment(
            req.params.paymentId,
            req.body
        );

        if (!payment) {

            return res.status(404).json({
                message:
                'Payment not found'
            });

        }

        res.json(payment);

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }
}

async function deletePayment(
    req,
    res
) {

    const payment =
    await paymentService.deletePayment(
        req.params.paymentId
    );

    if (!payment) {

        return res.status(404).json({
            message:
            'Payment not found'
        });

    }

    res.json({
        message:
        'Payment deleted successfully'
    });
}

module.exports = {
    getAllPayments,
    createPayment,
    getPaymentById,
    updatePayment,
    deletePayment
};