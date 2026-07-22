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

const handlerFile = require("../handler");
const dynamoDB = require("../src/config/dynamodb");

describe("Inventory Consumer Handler and Config Tests", () => {
    test("should export handler and execute it successfully", async () => {
        expect(handlerFile.handler).toBeDefined();
        
        // Mock early return inside processEvent when event is empty
        const result = await handlerFile.handler({});
        expect(result).toEqual({ statusCode: 200, body: "No records to process" });
    });

    test("should export dynamoDB client", () => {
        expect(dynamoDB).toBeDefined();
    });
});
