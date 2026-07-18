const transporter = require("../config/mail");

async function processEvent(event) {
    console.log("Email Consumer processing event:", JSON.stringify(event, null, 2));

    if (!event.Records || !Array.isArray(event.Records)) {
        console.log("No records to process in email consumer.");
        return;
    }

    for (const record of event.Records) {
        try {
            const snsMessage = typeof record.body === "string" ? JSON.parse(record.body) : record.body;
            const paymentEvent = typeof snsMessage.Message === "string" ? JSON.parse(snsMessage.Message) : (snsMessage.Message || snsMessage);

            console.log("Parsed Payment Event:", paymentEvent);

            // Ignore every event except PAYMENT_SUCCESS
            if (paymentEvent.event !== "PAYMENT_SUCCESS") {
                console.log(`Email Consumer ignoring event type: ${paymentEvent.event || "UNKNOWN"}`);
                continue;
            }

            if (!paymentEvent.email) {
                console.log("Email missing from payment event, skipping notification.");
                continue;
            }

            // Build product list HTML rows
            const items = paymentEvent.items && Array.isArray(paymentEvent.items) && paymentEvent.items.length > 0
                ? paymentEvent.items
                : [{ productId: paymentEvent.productId, productName: "Product", quantity: paymentEvent.quantity || 1, price: paymentEvent.amount }];

            let itemsTableRows = "";
            for (const item of items) {
                itemsTableRows += `
                    <tr>
                        <td style="padding: 8px; border: 1px solid #ddd;">${item.productName || item.productId || 'Item'}</td>
                        <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${item.quantity || 1}</td>
                        <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">₹${item.price || item.subtotal || '-'}</td>
                    </tr>
                `;
            }

            const mailOptions = {
                from: process.env.EMAIL,
                to: paymentEvent.email,
                subject: `Order Confirmation - Order #${paymentEvent.orderId}`,
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; border: 1px solid #eee; padding: 20px; border-radius: 8px;">
                        <h2 style="color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 10px;">Order Confirmation</h2>
                        <p>Hello <b>${paymentEvent.customerName || 'Customer'}</b>,</p>
                        <p>Thank you for your order! Your payment has been successfully processed and your order is now <b>PLACED</b>.</p>

                        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
                            <p style="margin: 5px 0;"><b>Order Number:</b> ${paymentEvent.orderId}</p>
                            <p style="margin: 5px 0;"><b>Payment Transaction ID:</b> ${paymentEvent.paymentId}</p>
                            <p style="margin: 5px 0;"><b>Payment Method:</b> ${paymentEvent.paymentMethod}</p>
                            <p style="margin: 5px 0;"><b>Order Status:</b> <span style="color: #27ae60; font-weight: bold;">${paymentEvent.status || 'SUCCESS'}</span></p>
                        </div>

                        <h3>Order Details</h3>
                        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                            <thead>
                                <tr style="background-color: #f2f2f2;">
                                    <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Product</th>
                                    <th style="padding: 8px; border: 1px solid #ddd; text-align: center;">Quantity</th>
                                    <th style="padding: 8px; border: 1px solid #ddd; text-align: right;">Price</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${itemsTableRows}
                            </tbody>
                            <tfoot>
                                <tr>
                                    <td colspan="2" style="padding: 8px; border: 1px solid #ddd; font-weight: bold; text-align: right;">Total Amount Paid:</td>
                                    <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold; text-align: right; color: #e74c3c;">₹${paymentEvent.amount}</td>
                                </tr>
                            </tfoot>
                        </table>

                        <p>We are preparing your package and will update you once it is shipped!</p>

                        <br>
                        <p style="margin: 0;">Thank you for shopping with us!</p>
                        <p style="margin: 5px 0; color: #7f8c8d;"><b>JR E-Commerce Team</b></p>
                    </div>
                `
            };

            await transporter.sendMail(mailOptions);
            console.log(`Order confirmation email sent successfully to ${paymentEvent.email}`);
        } catch (err) {
            console.error("Error processing record in email consumer:", err);
        }
    }
}

module.exports = {
    processEvent
};