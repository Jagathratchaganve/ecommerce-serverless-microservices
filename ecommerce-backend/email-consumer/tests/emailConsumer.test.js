process.env.EMAIL = "test@gmail.com";

const mockSendMail = jest.fn();
jest.mock("nodemailer", () => ({
    createTransport: jest.fn().mockReturnValue({
        sendMail: mockSendMail
    })
}));

const emailConsumer = require("../src/services/emailConsumer");
const transporter = require("../src/config/mail");

describe("Email Consumer Tests", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockSendMail.mockReset();
    });

    test("should return early if event has no records", async () => {
        await emailConsumer.processEvent({});
        expect(mockSendMail).not.toHaveBeenCalled();
    });

    test("should ignore event if type is not PAYMENT_SUCCESS", async () => {
        const event = {
            Records: [
                {
                    body: {
                        Message: { event: "OTHER_EVENT" } // Object form
                    }
                }
            ]
        };

        await emailConsumer.processEvent(event);

        expect(mockSendMail).not.toHaveBeenCalled();
    });

    test("should ignore event and print UNKNOWN if event type is missing", async () => {
        const event = {
            Records: [
                {
                    body: {
                        Message: {
                            email: "customer@gmail.com"
                        }
                    }
                }
            ]
        };
        await emailConsumer.processEvent(event);
        expect(mockSendMail).not.toHaveBeenCalled();
    });

    test("should skip if email is missing in event payload", async () => {
        const event = {
            Records: [
                {
                    body: {
                        Message: {
                            event: "PAYMENT_SUCCESS",
                            email: ""
                        }
                    }
                }
            ]
        };

        await emailConsumer.processEvent(event);

        expect(mockSendMail).not.toHaveBeenCalled();
    });

    test("should compile template and send email successfully for PAYMENT_SUCCESS event (Stringified JSON)", async () => {
        const event = {
            Records: [
                {
                    body: JSON.stringify({
                        Message: JSON.stringify({
                            event: "PAYMENT_SUCCESS",
                            email: "customer@gmail.com",
                            customerName: "Alice",
                            orderId: "o-123",
                            paymentId: "p-456",
                            paymentMethod: "UPI",
                            amount: 1500,
                            items: [
                                { productId: "p1", productName: "Item 1", quantity: 2, price: 500 },
                                { productId: "p2", productName: "Item 2", quantity: 1, price: 500 }
                            ]
                        })
                    })
                }
            ]
        };

        mockSendMail.mockResolvedValue({});

        await emailConsumer.processEvent(event);

        expect(mockSendMail).toHaveBeenCalled();
        const mailOptions = mockSendMail.mock.calls[0][0];
        expect(mailOptions.to).toBe("customer@gmail.com");
        expect(mailOptions.subject).toContain("o-123");
        expect(mailOptions.html).toContain("Alice");
        expect(mailOptions.html).toContain("Item 1");
        expect(mailOptions.html).toContain("UPI");
        expect(mailOptions.html).toContain("₹1500");
    });

    test("should support single item format in PAYMENT_SUCCESS event", async () => {
        const event = {
            Records: [
                {
                    body: {
                        Message: {
                            event: "PAYMENT_SUCCESS",
                            email: "customer@gmail.com",
                            customerName: "Alice",
                            orderId: "o-123",
                            paymentId: "p-456",
                            paymentMethod: "UPI",
                            amount: 1500,
                            productId: "p1",
                            quantity: 3
                        }
                    }
                }
            ]
        };

        mockSendMail.mockResolvedValue({});

        await emailConsumer.processEvent(event);

        expect(mockSendMail).toHaveBeenCalled();
        const mailOptions = mockSendMail.mock.calls[0][0];
        expect(mailOptions.html).toContain("Product");
        expect(mailOptions.html).toContain("3");
    });

    test("should support items as empty array falling back to single product root info", async () => {
        const event = {
            Records: [
                {
                    body: {
                        Message: {
                            event: "PAYMENT_SUCCESS",
                            email: "customer@gmail.com",
                            items: [],
                            productId: "p1",
                            quantity: 3,
                            amount: 500
                        }
                    }
                }
            ]
        };

        mockSendMail.mockResolvedValue({});

        await emailConsumer.processEvent(event);

        expect(mockSendMail).toHaveBeenCalled();
    });

    test("should support items as non-array object falling back to single product root info", async () => {
        const event = {
            Records: [
                {
                    body: {
                        Message: {
                            event: "PAYMENT_SUCCESS",
                            email: "customer@gmail.com",
                            items: { dummy: true },
                            productId: "p1",
                            quantity: 3,
                            amount: 500
                        }
                    }
                }
            ]
        };

        mockSendMail.mockResolvedValue({});

        await emailConsumer.processEvent(event);

        expect(mockSendMail).toHaveBeenCalled();
    });

    test("should support items fallback when quantity and amount are missing", async () => {
        const event = {
            Records: [
                {
                    body: {
                        Message: {
                            event: "PAYMENT_SUCCESS",
                            email: "customer@gmail.com",
                            productId: "p1",
                            quantity: undefined,
                            amount: undefined
                        }
                    }
                }
            ]
        };

        mockSendMail.mockResolvedValue({});

        await emailConsumer.processEvent(event);

        expect(mockSendMail).toHaveBeenCalled();
    });

    test("should support fallbacks for item fields in array", async () => {
        const event = {
            Records: [
                {
                    body: {
                        Message: {
                            event: "PAYMENT_SUCCESS",
                            email: "customer@gmail.com",
                            items: [
                                { productId: "p1" }, // missing productName, quantity, price/subtotal
                                {} // missing everything
                            ]
                        }
                    }
                }
            ]
        };

        mockSendMail.mockResolvedValue({});
        await emailConsumer.processEvent(event);
        expect(mockSendMail).toHaveBeenCalled();
    });

    test("should fallback to root payload if Message key is missing", async () => {
        const event = {
            Records: [
                {
                    body: {
                        event: "PAYMENT_SUCCESS",
                        email: "customer@gmail.com",
                        productId: "p1",
                        quantity: 1
                    }
                }
            ]
        };

        mockSendMail.mockResolvedValue({});

        await emailConsumer.processEvent(event);

        expect(mockSendMail).toHaveBeenCalled();
    });

    test("should handle record processing errors gracefully", async () => {
        const event = {
            Records: [
                {
                    body: "invalid-json"
                }
            ]
        };

        await expect(emailConsumer.processEvent(event)).resolves.not.toThrow();
    });
});
