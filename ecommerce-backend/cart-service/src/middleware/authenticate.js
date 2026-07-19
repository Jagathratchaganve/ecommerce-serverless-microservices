const { CognitoJwtVerifier } = require("aws-jwt-verify");

const verifier = CognitoJwtVerifier.create({

    userPoolId: process.env.COGNITO_USER_POOL_ID,

    tokenUse: "access",

    clientId: process.env.COGNITO_CLIENT_ID

});

module.exports = async (req, res, next) => {

    try {

        const authHeader = req.headers.authorization;

        if (!authHeader) {

            return res.status(401).json({

                success: false,

                message: "Authorization header is required."

            });

        }

        if (!authHeader.startsWith("Bearer ")) {

            return res.status(401).json({

                success: false,

                message: "Invalid Authorization header."

            });

        }

        const token = authHeader.split(" ")[1];

        console.log("Incoming Token:", token);

        const payload = await verifier.verify(token);

        console.log("Verified Payload:");
        console.log(payload);

        req.user = {

            userId: payload.sub,

            username: payload.username,

            groups: payload["cognito:groups"] || []

        };

        next();

    } catch (error) {

    console.error("FULL ERROR");
    console.error(error);

    return res.status(401).json({

        success: false,

        message: "Invalid or Expired Token."

    });

}

};