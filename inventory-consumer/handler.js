require("dotenv").config();

const inventoryConsumer =
require("./src/services/inventoryConsumer");

exports.handler = async (event) => {

    return await inventoryConsumer.processEvent(event);

};