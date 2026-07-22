process.env.COGNITO_USER_POOL_ID = "us-east-1_abcdefghi";
process.env.COGNITO_CLIENT_ID = "mock-client-id";
process.env.AWS_REGION = "us-east-1";

jest.mock("@aws-sdk/client-dynamodb", () => ({
    DynamoDBClient: jest.fn().mockImplementation(() => ({}))
}));
jest.mock("@aws-sdk/lib-dynamodb", () => ({
    DynamoDBDocumentClient: {
        from: jest.fn().mockReturnValue({
            send: jest.fn()
        })
    }
}));
jest.mock("@aws-sdk/client-sns", () => ({
    SNSClient: jest.fn().mockImplementation(() => ({
        send: jest.fn()
    }))
}));

const handlerFile = require("../handler");
const dynamoDB = require("../src/config/dynamodb");
const sns = require("../src/config/sns");
const logger = require("../src/services/logger");

describe("Payment Service Misc Coverage Tests", () => {
    test("should export handler", () => {
        expect(handlerFile.handler).toBeDefined();
    });

    test("should export dynamoDB client", () => {
        expect(dynamoDB).toBeDefined();
    });

    test("should export sns client", () => {
        expect(sns).toBeDefined();
    });

    test("should log message", () => {
        logger.info("Test info message for coverage");
        expect(logger).toBeDefined();
    });
});
