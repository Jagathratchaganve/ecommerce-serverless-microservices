const crypto = require("crypto");

function generateSecretHash(username) {
    return crypto
        .createHmac("sha256", process.env.COGNITO_CLIENT_SECRET)
        .update(username + process.env.COGNITO_CLIENT_ID)
        .digest("base64");
}

module.exports = generateSecretHash;