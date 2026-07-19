const dynamoDB = require("../config/dynamodb");
const { GetCommand, PutCommand } = require("@aws-sdk/lib-dynamodb");

const TABLE_NAME = process.env.INVENTORY_TABLE || "Inventory";

async function processEvent(event) {
    console.log("Processing SQS Event:", JSON.stringify(event, null, 2));

    if (!event.Records || !Array.isArray(event.Records)) {
        console.log("No records in event.");
        return { statusCode: 200, body: "No records to process" };
    }

    for (const record of event.Records) {
        try {
            const snsMessage = typeof record.body === "string" ? JSON.parse(record.body) : record.body;

            // Handle direct message or SNS wrapped message
            const payload = typeof snsMessage.Message === "string" ? JSON.parse(snsMessage.Message) : (snsMessage.Message || snsMessage);

            console.log("Parsed Event Payload:", payload);

            // Filter event: Ignore any event that is not PAYMENT_SUCCESS
            if (payload.event !== "PAYMENT_SUCCESS") {
                console.log(`Ignoring event type: ${payload.event || 'UNKNOWN'}`);
                continue;
            }

            // Extract items list or single product
            const items = payload.items && Array.isArray(payload.items) && payload.items.length > 0
                ? payload.items
                : [{ productId: payload.productId, quantity: payload.quantity || 1 }];

            for (const item of items) {
                const productId = item.productId;
                const orderedQuantity = Number(item.quantity || 1);

                if (!productId) {
                    console.warn("Skipping item with missing productId:", item);
                    continue;
                }

                const result = await dynamoDB.send(
                    new GetCommand({
                        TableName: TABLE_NAME,
                        Key: {
                            productId
                        }
                    })
                );

                const inventory = result.Item;

                if (!inventory) {
                    console.warn(`Inventory record not found for productId: ${productId}`);
                    continue;
                }

                // Reduce availableStock (Never reduce totalStock)
                const currentAvailable = Number(inventory.availableStock !== undefined ? inventory.availableStock : (inventory.quantity || 0));
                const newAvailable = Math.max(0, currentAvailable - orderedQuantity);

                inventory.availableStock = newAvailable;
                inventory.lastUpdated = new Date().toISOString();

                await dynamoDB.send(
                    new PutCommand({
                        TableName: TABLE_NAME,
                        Item: inventory
                    })
                );

                console.log(`Successfully updated inventory for ${productId}: availableStock set to ${newAvailable} (Reduced by ${orderedQuantity})`);
            }
        } catch (recordError) {
            console.error("Error processing record in inventory consumer:", recordError);
        }
    }

    return {
        statusCode: 200,
        body: "Inventory Stock Reduction Processed Successfully"
    };
}

module.exports = {
    processEvent
};