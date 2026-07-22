const authenticate = require("../src/middleware/authenticate");
const authorize = require("../src/middleware/authorize");
const errorHandler = require("../src/middleware/errorHandler");
const requestLogger = require("../src/middleware/requestLogger");
const logger = require("../src/services/logger");
const { CognitoJwtVerifier } = require("aws-jwt-verify");

jest.mock("aws-jwt-verify", () => ({
    CognitoJwtVerifier: {
        create: jest.fn().mockReturnValue({
            verify: jest.fn()
        })
    }
}));

jest.mock("../src/services/logger", () => ({
    info: jest.fn(),
    error: jest.fn()
}));

describe("Inventory Middleware Tests", () => {
    let req, res, next, verifierMock;

    beforeEach(() => {
        jest.clearAllMocks();
        req = {
            headers: {},
            method: "GET",
            originalUrl: "/test-url"
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        next = jest.fn();
        verifierMock = CognitoJwtVerifier.create();
    });

    describe("authenticate middleware", () => {
        test("should return 401 if authorization header is missing", async () => {
            await authenticate(req, res, next);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: "Authorization header is required."
            });
            expect(next).not.toHaveBeenCalled();
        });

        test("should return 401 if header does not start with Bearer", async () => {
            req.headers.authorization = "InvalidToken123";

            await authenticate(req, res, next);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: "Invalid Authorization header."
            });
            expect(next).not.toHaveBeenCalled();
        });

        test("should call next and set req.user if verification succeeds", async () => {
            req.headers.authorization = "Bearer validtoken";
            const mockPayload = {
                sub: "user-123",
                username: "john",
                "cognito:groups": ["User"]
            };
            verifierMock.verify.mockResolvedValue(mockPayload);

            await authenticate(req, res, next);

            expect(verifierMock.verify).toHaveBeenCalledWith("validtoken");
            expect(req.user).toEqual({
                userId: "user-123",
                username: "john",
                groups: ["User"]
            });
            expect(next).toHaveBeenCalled();
        });

        test("should default to empty array if cognito:groups is missing in payload", async () => {
            req.headers.authorization = "Bearer validtoken";
            const mockPayload = {
                sub: "user-123",
                username: "john"
            };
            verifierMock.verify.mockResolvedValue(mockPayload);

            await authenticate(req, res, next);

            expect(req.user.groups).toEqual([]);
            expect(next).toHaveBeenCalled();
        });

        test("should return 401 if verification fails", async () => {
            req.headers.authorization = "Bearer invalidtoken";
            verifierMock.verify.mockRejectedValue(new Error("JWT invalid"));

            await authenticate(req, res, next);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: "Invalid or Expired Token."
            });
            expect(next).not.toHaveBeenCalled();
        });
    });

    describe("authorize middleware", () => {
        test("should return 401 if req.user is missing", () => {
            const middleware = authorize("Admin");
            middleware(req, res, next);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: "Unauthorized"
            });
        });

        test("should return 403 if user is not in required roles", () => {
            req.user = { groups: ["User"] };
            const middleware = authorize("Admin");
            middleware(req, res, next);

            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: "Access Denied."
            });
        });

        test("should default to empty array if user groups is missing", () => {
            req.user = {}; // missing groups
            const middleware = authorize("Admin");
            middleware(req, res, next);

            expect(res.status).toHaveBeenCalledWith(403);
        });

        test("should call next if user is in authorized role", () => {
            req.user = { groups: ["Admin"] };
            const middleware = authorize("Admin", "SuperAdmin");
            middleware(req, res, next);

            expect(next).toHaveBeenCalled();
        });
    });

    describe("errorHandler middleware", () => {
        test("should return 500 and error message", () => {
            const err = new Error("Something went wrong");
            errorHandler(err, req, res, next);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ message: "Something went wrong" });
        });
    });

    describe("requestLogger middleware", () => {
        test("should log request and call next", () => {
            requestLogger(req, res, next);

            expect(logger.info).toHaveBeenCalledWith({
                method: "GET",
                url: "/test-url"
            });
            expect(next).toHaveBeenCalled();
        });
    });
});
