const { SNSClient } = require("@aws-sdk/client-sns");

const sns = new SNSClient({});

module.exports = sns;