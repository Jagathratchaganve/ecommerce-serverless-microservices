const request = require("supertest");
const app = require("../src/app");
const authService = require("../src/services/authService");

jest.mock("../src/services/authService");
jest.mock("../src/config/logger", () => ({
    info: jest.fn(),
    error: jest.fn()
}));

describe("Auth Routes Tests", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("GET /api/auth/health", async () => {
        authService.healthCheck.mockResolvedValue({ success: true, message: "OK" });

        const res = await request(app).get("/api/auth/health");

        expect(res.statusCode).toBe(200);
        expect(res.body.message).toBe("OK");
    });

    test("POST /api/auth/signup", async () => {
        authService.signUp.mockResolvedValue({ success: true });

        const res = await request(app)
            .post("/api/auth/signup")
            .send({ email: "test@example.com", name: "John", password: "Password123!" });

        expect(res.statusCode).toBe(201);
        expect(res.body.success).toBe(true);
    });

    test("POST /api/auth/confirm-signup", async () => {
        authService.confirmSignUp.mockResolvedValue({ success: true });

        const res = await request(app)
            .post("/api/auth/confirm-signup")
            .send({ email: "test@example.com", confirmationCode: "123456" });

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
    });

    test("POST /api/auth/login", async () => {
        authService.login.mockResolvedValue({ success: true, data: { accessToken: "token" } });

        const res = await request(app)
            .post("/api/auth/login")
            .send({ email: "test@example.com", password: "pwd" });

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
    });

    test("POST /api/auth/admin/create-user", async () => {
        authService.adminCreateUser.mockResolvedValue({ success: true });

        const res = await request(app)
            .post("/api/auth/admin/create-user")
            .send({ email: "admin@example.com", name: "Admin", password: "pwd", role: "Admin" });

        expect(res.statusCode).toBe(201);
        expect(res.body.success).toBe(true);
    });
});
