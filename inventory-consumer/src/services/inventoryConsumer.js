const dynamoDB =
require("../config/dynamodb");

const {

    GetCommand,

    PutCommand

} = require("@aws-sdk/lib-dynamodb");

const TABLE_NAME =
process.env.INVENTORY_TABLE || "Inventory";

async function processEvent(event) {

    console.log(
        JSON.stringify(event, null, 2)
    );

    for (const record of event.Records) {

        const snsMessage =
        JSON.parse(record.body);

        const paymentEvent =
        JSON.parse(
            snsMessage.Message
        );

        console.log(
            "Received Event:",
            paymentEvent
        );

        const productId =
        paymentEvent.productId;

        const orderedQuantity =
        paymentEvent.quantity;

        const result =
        await dynamoDB.send(

            new GetCommand({

                TableName: TABLE_NAME,

                Key: {

                    productId

                }

            })

        );

        const inventory =
        result.Item;

        if (!inventory) {

            console.log(
                "Inventory not found."
            );

            continue;
        }

        inventory.quantity =
        inventory.quantity -
        orderedQuantity;

        await dynamoDB.send(

            new PutCommand({

                TableName: TABLE_NAME,

                Item: inventory

            })

        );

        console.log(

            `Inventory Updated for ${productId}`

        );

    }

    return {

        statusCode: 200,

        body: "Inventory Updated"

    };

}

module.exports = {

    processEvent

};