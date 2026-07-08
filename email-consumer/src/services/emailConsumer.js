const transporter = require("../config/mail");

async function processEvent(event) {

    for (const record of event.Records) {

        const snsMessage = JSON.parse(record.body);

        const paymentEvent = JSON.parse(snsMessage.Message);
        console.log("========== PAYMENT EVENT ==========");
        console.log(paymentEvent);

        console.log("Customer Name:", paymentEvent.customerName);
        console.log("Email:", paymentEvent.email);
        console.log("Phone:", paymentEvent.phone);
        console.log("==================================");

        if (!paymentEvent.email) {

            console.log("Email missing");
        
            return;
        }
        
        const mailOptions = {
            from: process.env.EMAIL,
            to: paymentEvent.email,

            subject: "Order Confirmation - Payment Successful",

            html: `
                <h2>Hello ${paymentEvent.customerName},</h2>

                <p>Your payment has been completed successfully.</p>

                <table border="1" cellpadding="8" cellspacing="0">
                    <tr>
                        <td><b>Order ID</b></td>
                        <td>${paymentEvent.orderId}</td>
                    </tr>

                    <tr>
                        <td><b>Payment ID</b></td>
                        <td>${paymentEvent.paymentId}</td>
                    </tr>

                    <tr>
                        <td><b>Product ID</b></td>
                        <td>${paymentEvent.productId}</td>
                    </tr>

                    <tr>
                        <td><b>Quantity</b></td>
                        <td>${paymentEvent.quantity}</td>
                    </tr>

                    <tr>
                        <td><b>Amount</b></td>
                        <td>₹${paymentEvent.amount}</td>
                    </tr>

                    <tr>
                        <td><b>Payment Method</b></td>
                        <td>${paymentEvent.paymentMethod}</td>
                    </tr>

                    <tr>
                        <td><b>Status</b></td>
                        <td>${paymentEvent.status}</td>
                    </tr>
                </table>

                <br>

                <p>Thank you for shopping with us.</p>

                <p><b>JR E-Commerce Team</b></p>
            `
        };

        await transporter.sendMail(mailOptions);

        console.log(
            `Email sent to ${paymentEvent.email}`
        );
    }
}

module.exports = {
    processEvent
};