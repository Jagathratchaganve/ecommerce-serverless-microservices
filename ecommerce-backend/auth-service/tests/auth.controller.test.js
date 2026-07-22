const authController = require("../src/controllers/authController");
const authService = require("../src/services/authService");

jest.mock("../src/services/authService");
jest.mock("../src/config/logger", () => ({
    info: jest.fn(),
    error: jest.fn()
}));

describe("Auth Controller Tests", () => {
    let req, res;

    beforeEach(() => {
        jest.clearAllMocks();
        req = {
            body: {},
            headers: {}
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
    });

    describe("healthCheck", () => {
        test("should return 200 with service status", async () => {
            const serviceResponse = { success: true, message: "OK" };
            authService.healthCheck.mockResolvedValue(serviceResponse);

            await authController.healthCheck(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(serviceResponse);
        });

        test("should return 500 when service throws an error", async () => {
            authService.healthCheck.mockRejectedValue(new Error("Database offline"));

            await authController.healthCheck(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: "Database offline"
            });
        });
    });

    describe("signUp", () => {
        test("should return 201 and service response on success", async () => {
            const serviceResponse = { success: true, message: "User registered" };
            authService.signUp.mockResolvedValue(serviceResponse);
            req.body = { email: "john@example.com", name: "John", password: "pwd" };

            await authController.signUp(req, res);

            expect(authService.signUp).toHaveBeenCalledWith(req.body);
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith(serviceResponse);
        });

        test("should return 400 when validation or registration fails", async () => {
            authService.signUp.mockRejectedValue(new Error("Email invalid"));

            await authController.signUp(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: "Email invalid"
            });
        });
    });

    describe("confirmSignUp", () => {
        test("should return 200 on successful verification", async () => {
            const serviceResponse = { success: true, message: "Account confirmed" };
            authService.confirmSignUp.mockResolvedValue(serviceResponse);

            await authController.confirmSignUp(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(serviceResponse);
        });

        test("should return 400 on error", async () => {
            authService.confirmSignUp.mockRejectedValue(new Error("Code expired"));

            await authController.confirmSignUp(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: "Code expired"
            });
        });
    });

    describe("login", () => {
        test("should return 200 on successful login", async () => {
            const serviceResponse = { success: true, data: { token: "123" } };
            authService.login.mockResolvedValue(serviceResponse);

            await authController.login(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(serviceResponse);
        });

        test("should return 401 on login failure", async () => {
            authService.login.mockRejectedValue(new Error("Invalid credentials"));

            await authController.login(req, res);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: "Invalid credentials"
            });
        });
    });

    describe("adminCreateUser", () => {
        test("should return 201 on success", async () => {
            const serviceResponse = { success: true };
            authService.adminCreateUser.mockResolvedValue(serviceResponse);

            await authController.adminCreateUser(req, res);

            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith(serviceResponse);
        });

        test("should return 400 on error", async () => {
            authService.adminCreateUser.mockRejectedValue(new Error("Group not found"));

            await authController.adminCreateUser(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: "Group not found"
            });
        });
    });
});
