require("dotenv").config();

const emailConsumer = require("./src/services/emailConsumer");

exports.handler = async (event) => {

    try {

        await emailConsumer.processEvent(event);

        return {
            statusCode: 200,
            body: JSON.stringify({
                message: "Email processed successfully"
            })
        };

    } catch (error) {

        console.error(error);

        throw error;
    }
};