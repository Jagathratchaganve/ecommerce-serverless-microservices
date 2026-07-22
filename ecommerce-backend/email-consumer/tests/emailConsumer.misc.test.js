process.env.EMAIL = "test@gmail.com";

jest.mock("nodemailer", () => ({
    createTransport: jest.fn().mockReturnValue({
        sendMail: jest.fn()
    })
}));

const handlerFile = require("../handler");
const transporter = require("../src/config/mail");

describe("Email Consumer Handler and Config Tests", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("should export handler and process event successfully", async () => {
        expect(handlerFile.handler).toBeDefined();

        const result = await handlerFile.handler({});
        expect(result.statusCode).toBe(200);
        expect(JSON.parse(result.body).message).toBe("Email processed successfully");
    });

    test("should throw error if processEvent throws error", async () => {
        const emailConsumer = require("../src/services/emailConsumer");
        jest.spyOn(emailConsumer, "processEvent").mockRejectedValueOnce(new Error("Email service down"));
        
        const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});

        await expect(handlerFile.handler({})).rejects.toThrow("Email service down");

        consoleErrorSpy.mockRestore();
        emailConsumer.processEvent.mockRestore();
    });

    test("should export transporter", () => {
        expect(transporter).toBeDefined();
    });
});
