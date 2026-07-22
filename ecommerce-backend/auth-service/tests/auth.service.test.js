const authService = require("../src/services/authService");
const cognitoClient = require("../src/config/cognito");

jest.mock("../src/config/cognito", () => ({
    send: jest.fn()
}));

describe("Auth Service Tests", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        process.env.COGNITO_CLIENT_ID = "test-client-id";
        process.env.COGNITO_USER_POOL_ID = "test-user-pool-id";
        process.env.USER_GROUP = "User";
        process.env.COGNITO_CLIENT_SECRET = "test-client-secret";
    });

    describe("healthCheck", () => {
        test("should return success message", async () => {
            const result = await authService.healthCheck();
            expect(result).toEqual({
                success: true,
                message: "Authentication Service Working Successfully"
            });
        });
    });

    describe("signUp", () => {
        test("should throw error if required parameters are missing", async () => {
            await expect(authService.signUp({})).rejects.toThrow("Name, Email and Password are required.");
            await expect(authService.signUp({ name: "Test" })).rejects.toThrow("Name, Email and Password are required.");
        });

        test("should succeed on valid parameters", async () => {
            cognitoClient.send.mockResolvedValue({});
            const result = await authService.signUp({
                name: "John Doe",
                email: "john@example.com",
                password: "Password123!"
            });
            expect(result.success).toBe(true);
            expect(result.message).toContain("Verification code sent successfully");
            expect(cognitoClient.send).toHaveBeenCalled();
        });

        test("should handle UsernameExistsException", async () => {
            const err = new Error("User exists");
            err.name = "UsernameExistsException";
            cognitoClient.send.mockRejectedValue(err);

            await expect(authService.signUp({
                name: "John Doe",
                email: "john@example.com",
                password: "Password123!"
            })).rejects.toThrow("User already exists.");
        });

        test("should handle InvalidPasswordException", async () => {
            const err = new Error("Invalid password");
            err.name = "InvalidPasswordException";
            cognitoClient.send.mockRejectedValue(err);

            await expect(authService.signUp({
                name: "John Doe",
                email: "john@example.com",
                password: "123"
            })).rejects.toThrow("Invalid password");
        });

        test("should handle InvalidParameterException", async () => {
            const err = new Error("Invalid parameter");
            err.name = "InvalidParameterException";
            cognitoClient.send.mockRejectedValue(err);

            await expect(authService.signUp({
                name: "John Doe",
                email: "john@example.com",
                password: "Password123!"
            })).rejects.toThrow("Invalid parameter");
        });

        test("should handle other exceptions", async () => {
            const err = new Error("Some error");
            cognitoClient.send.mockRejectedValue(err);

            await expect(authService.signUp({
                name: "John Doe",
                email: "john@example.com",
                password: "Password123!"
            })).rejects.toThrow("Some error");
        });
    });

    describe("confirmSignUp", () => {
        test("should throw error if email or code is missing", async () => {
            await expect(authService.confirmSignUp({ email: "test@example.com" })).rejects.toThrow("Email and Confirmation Code are required.");
        });

        test("should succeed on correct parameters", async () => {
            cognitoClient.send.mockResolvedValue({});
            const result = await authService.confirmSignUp({
                email: "john@example.com",
                confirmationCode: "123456"
            });
            expect(result.success).toBe(true);
            expect(result.message).toBe("Account verified successfully.");
            expect(cognitoClient.send).toHaveBeenCalledTimes(2); // ConfirmSignUp and AdminAddUserToGroup
        });

        test("should handle CodeMismatchException", async () => {
            const err = new Error("Code mismatch");
            err.name = "CodeMismatchException";
            cognitoClient.send.mockRejectedValue(err);

            await expect(authService.confirmSignUp({
                email: "john@example.com",
                confirmationCode: "000000"
            })).rejects.toThrow("Invalid verification code.");
        });

        test("should handle ExpiredCodeException", async () => {
            const err = new Error("Expired code");
            err.name = "ExpiredCodeException";
            cognitoClient.send.mockRejectedValue(err);

            await expect(authService.confirmSignUp({
                email: "john@example.com",
                confirmationCode: "111111"
            })).rejects.toThrow("Verification code expired.");
        });

        test("should handle UserNotFoundException", async () => {
            const err = new Error("Not found");
            err.name = "UserNotFoundException";
            cognitoClient.send.mockRejectedValue(err);

            await expect(authService.confirmSignUp({
                email: "john@example.com",
                confirmationCode: "111111"
            })).rejects.toThrow("User not found.");
        });

        test("should handle NotAuthorizedException", async () => {
            const err = new Error("Not authorized");
            err.name = "NotAuthorizedException";
            cognitoClient.send.mockRejectedValue(err);

            await expect(authService.confirmSignUp({
                email: "john@example.com",
                confirmationCode: "111111"
            })).rejects.toThrow("Not authorized");
        });

        test("should handle other errors", async () => {
            const err = new Error("Unknown error");
            cognitoClient.send.mockRejectedValue(err);

            await expect(authService.confirmSignUp({
                email: "john@example.com",
                confirmationCode: "111111"
            })).rejects.toThrow("Unknown error");
        });
    });

    describe("login", () => {
        test("should throw error if email or password is missing", async () => {
            await expect(authService.login({ email: "test@example.com" })).rejects.toThrow("Email and Password are required.");
        });

        test("should succeed on valid credentials", async () => {
            cognitoClient.send.mockResolvedValue({
                AuthenticationResult: {
                    AccessToken: "access-token",
                    IdToken: "id-token",
                    RefreshToken: "refresh-token",
                    ExpiresIn: 3600,
                    TokenType: "Bearer"
                }
            });

            const result = await authService.login({
                email: "john@example.com",
                password: "Password123!"
            });

            expect(result.success).toBe(true);
            expect(result.message).toBe("Login successful.");
            expect(result.data.accessToken).toBe("access-token");
        });

        test("should handle NotAuthorizedException", async () => {
            const err = new Error("Not authorized");
            err.name = "NotAuthorizedException";
            cognitoClient.send.mockRejectedValue(err);

            await expect(authService.login({
                email: "john@example.com",
                password: "WrongPassword"
            })).rejects.toThrow("Invalid email or password.");
        });

        test("should handle UserNotConfirmedException", async () => {
            const err = new Error("Not confirmed");
            err.name = "UserNotConfirmedException";
            cognitoClient.send.mockRejectedValue(err);

            await expect(authService.login({
                email: "john@example.com",
                password: "Password123!"
            })).rejects.toThrow("Please verify your email first.");
        });

        test("should handle UserNotFoundException", async () => {
            const err = new Error("Not found");
            err.name = "UserNotFoundException";
            cognitoClient.send.mockRejectedValue(err);

            await expect(authService.login({
                email: "unknown@example.com",
                password: "Password123!"
            })).rejects.toThrow("User not found.");
        });

        test("should handle default exceptions", async () => {
            const err = new Error("Unexpected error");
            err.name = "UnexpectedException";
            cognitoClient.send.mockRejectedValue(err);

            await expect(authService.login({
                email: "john@example.com",
                password: "Password123!"
            })).rejects.toThrow("Unexpected error");
        });
    });

    describe("adminCreateUser", () => {
        test("should throw error if required parameters are missing", async () => {
            await expect(authService.adminCreateUser({})).rejects.toThrow("Name, Email, Password and Role are required.");
        });

        test("should throw error if role is invalid", async () => {
            await expect(authService.adminCreateUser({
                name: "John",
                email: "john@example.com",
                password: "Password123!",
                role: "InvalidRole"
            })).rejects.toThrow("Role must be Admin or User.");
        });

        test("should succeed on valid inputs", async () => {
            cognitoClient.send.mockResolvedValue({});
            const result = await authService.adminCreateUser({
                name: "John Admin",
                email: "admin@example.com",
                password: "Password123!",
                role: "Admin"
            });

            expect(result.success).toBe(true);
            expect(result.message).toBe("Admin created successfully.");
            expect(cognitoClient.send).toHaveBeenCalledTimes(3); // Create, set password, add to group
        });

        test("should handle UsernameExistsException", async () => {
            const err = new Error("Exists");
            err.name = "UsernameExistsException";
            cognitoClient.send.mockRejectedValue(err);

            await expect(authService.adminCreateUser({
                name: "John",
                email: "john@example.com",
                password: "Password123!",
                role: "User"
            })).rejects.toThrow("User already exists.");
        });

        test("should handle InvalidPasswordException", async () => {
            const err = new Error("Weak password");
            err.name = "InvalidPasswordException";
            cognitoClient.send.mockRejectedValue(err);

            await expect(authService.adminCreateUser({
                name: "John",
                email: "john@example.com",
                password: "123",
                role: "User"
            })).rejects.toThrow("Weak password");
        });

        test("should handle ResourceNotFoundException", async () => {
            const err = new Error("Not found");
            err.name = "ResourceNotFoundException";
            cognitoClient.send.mockRejectedValue(err);

            await expect(authService.adminCreateUser({
                name: "John",
                email: "john@example.com",
                password: "Password123!",
                role: "User"
            })).rejects.toThrow("User Pool or Group not found.");
        });

        test("should handle default exceptions", async () => {
            const err = new Error("General error");
            err.name = "GeneralException";
            cognitoClient.send.mockRejectedValue(err);

            await expect(authService.adminCreateUser({
                name: "John",
                email: "john@example.com",
                password: "Password123!",
                role: "User"
            })).rejects.toThrow("General error");
        });
    });
});
