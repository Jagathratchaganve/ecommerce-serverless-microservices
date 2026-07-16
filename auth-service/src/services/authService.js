const cognitoClient = require("../config/cognito");

const {
    SignUpCommand,
    ConfirmSignUpCommand,
    InitiateAuthCommand,
    AdminCreateUserCommand,
    AdminSetUserPasswordCommand,
    AdminAddUserToGroupCommand
} = require("@aws-sdk/client-cognito-identity-provider");

const generateSecretHash = require("../utils/secretHash");

// ======================
// Health Check
// ======================

exports.healthCheck = async () => {

    return {
        success: true,
        message: "Authentication Service Working Successfully"
    };

};

// ======================
// User Signup
// ======================

exports.signUp = async (data) => {

    const { name, email, password } = data;

    if (!name || !email || !password) {
        throw new Error("Name, Email and Password are required.");
    }

    try {

        const params = {

            ClientId: process.env.COGNITO_CLIENT_ID,

            Username: email,

            Password: password,

            SecretHash: generateSecretHash(email),

            UserAttributes: [

                {
                    Name: "email",
                    Value: email
                },

                {
                    Name: "name",
                    Value: name
                }

            ]

        };

        await cognitoClient.send(
            new SignUpCommand(params)
        );

        return {

            success: true,

            message: "Verification code sent successfully to your email."

        };

    } catch (error) {

        switch (error.name) {

            case "UsernameExistsException":
                throw new Error("User already exists.");

            case "InvalidPasswordException":
                throw new Error(error.message);

            case "InvalidParameterException":
                throw new Error(error.message);

            default:
                throw new Error(error.message);

        }

    }

};

// ======================
// Confirm Signup
// ======================

exports.confirmSignUp = async (data) => {

    const { email, confirmationCode } = data;

    if (!email || !confirmationCode) {
        throw new Error("Email and Confirmation Code are required.");
    }

    try {

        await cognitoClient.send(

            new ConfirmSignUpCommand({

                ClientId: process.env.COGNITO_CLIENT_ID,

                Username: email,

                ConfirmationCode: confirmationCode,

                SecretHash: generateSecretHash(email)

            })

        );

        await cognitoClient.send(

            new AdminAddUserToGroupCommand({

                UserPoolId: process.env.COGNITO_USER_POOL_ID,

                Username: email,

                GroupName: process.env.USER_GROUP

            })

        );

        return {

            success: true,

            message: "Account verified successfully."

        };

    } catch (error) {

        switch (error.name) {

            case "CodeMismatchException":
                throw new Error("Invalid verification code.");

            case "ExpiredCodeException":
                throw new Error("Verification code expired.");

            case "UserNotFoundException":
                throw new Error("User not found.");

            case "NotAuthorizedException":
                throw new Error(error.message);

            default:
                throw new Error(error.message);

        }

    }

};

// ======================
// Login
// ======================

exports.login = async (data) => {

    const { email, password } = data;

    if (!email || !password) {
        throw new Error("Email and Password are required.");
    }

    try {

        const params = {

            AuthFlow: "USER_PASSWORD_AUTH",

            ClientId: process.env.COGNITO_CLIENT_ID,

            AuthParameters: {

                USERNAME: email,

                PASSWORD: password,

                SECRET_HASH: generateSecretHash(email)

            }

        };

        const response = await cognitoClient.send(
            new InitiateAuthCommand(params)
        );

        const auth = response.AuthenticationResult;

        return {

            success: true,

            message: "Login successful.",

            data: {

                accessToken: auth.AccessToken,

                idToken: auth.IdToken,

                refreshToken: auth.RefreshToken,

                expiresIn: auth.ExpiresIn,

                tokenType: auth.TokenType

            }

        };

    } catch (error) {

        switch (error.name) {

            case "NotAuthorizedException":
                throw new Error("Invalid email or password.");

            case "UserNotConfirmedException":
                throw new Error("Please verify your email first.");

            case "UserNotFoundException":
                throw new Error("User not found.");

            default:
                throw new Error(error.message);

        }

    }

};

// ======================
// Admin Create User
// ======================

exports.adminCreateUser = async (data) => {

    const {

        name,

        email,

        password,

        role

    } = data;

    if (!name || !email || !password || !role) {

        throw new Error(
            "Name, Email, Password and Role are required."
        );

    }

    if (!["Admin", "User"].includes(role)) {

        throw new Error(
            "Role must be Admin or User."
        );

    }

    try {

        // Create User

        await cognitoClient.send(

            new AdminCreateUserCommand({

                UserPoolId: process.env.COGNITO_USER_POOL_ID,

                Username: email,

                MessageAction: "SUPPRESS",

                UserAttributes: [

                    {
                        Name: "email",
                        Value: email
                    },

                    {
                        Name: "email_verified",
                        Value: "true"
                    },

                    {
                        Name: "name",
                        Value: name
                    }

                ]

            })

        );

        // Set Permanent Password

        await cognitoClient.send(

            new AdminSetUserPasswordCommand({

                UserPoolId: process.env.COGNITO_USER_POOL_ID,

                Username: email,

                Password: password,

                Permanent: true

            })

        );

        // Add User to Group

        await cognitoClient.send(

            new AdminAddUserToGroupCommand({

                UserPoolId: process.env.COGNITO_USER_POOL_ID,

                Username: email,

                GroupName: role

            })

        );

        return {

            success: true,

            message: `${role} created successfully.`

        };

    } catch (error) {

        switch (error.name) {

            case "UsernameExistsException":
                throw new Error("User already exists.");

            case "InvalidPasswordException":
                throw new Error(error.message);

            case "ResourceNotFoundException":
                throw new Error("User Pool or Group not found.");

            default:
                throw new Error(error.message);

        }

    }

};