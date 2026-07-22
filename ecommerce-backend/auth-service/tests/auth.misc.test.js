const handlerFile = require("../handler");
const logger = require("../src/config/logger");
const request = require("supertest");
const app = require("../src/app");

describe("Auth Service Misc Coverage Tests", () => {
    test("should export handler", () => {
        expect(handlerFile.handler).toBeDefined();
    });

    test("should cover logger functions", () => {
        const consoleLogSpy = jest.spyOn(console, "log").mockImplementation(() => {});
        const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
        logger.info("test info");
        logger.error("test error");
        expect(consoleLogSpy).toHaveBeenCalled();
        expect(consoleErrorSpy).toHaveBeenCalled();
        consoleLogSpy.mockRestore();
        consoleErrorSpy.mockRestore();
    });

    test("GET / root path", async () => {
        const res = await request(app).get("/");
        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.message).toContain("Running");
    });
});
