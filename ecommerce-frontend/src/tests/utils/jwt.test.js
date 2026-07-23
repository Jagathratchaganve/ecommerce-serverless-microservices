import { describe, test, expect, vi } from "vitest";
import { decodeToken, isTokenExpired, extractUserFromTokens } from "../../utils/jwt";

vi.mock("jwt-decode", () => ({
  jwtDecode: (token) => {
    if (token === "invalid") throw new Error("Invalid token");
    if (token === "expired") return { exp: 100, sub: "123", username: "john" };
    if (token === "valid") return { exp: 9999999999, sub: "123", username: "john", "cognito:groups": ["User"] };
    if (token === "admin") return { exp: 9999999999, sub: "123", username: "admin", "cognito:groups": ["Admin"] };
    return {};
  }
}));

describe("JWT Utility Tests", () => {
  test("decodeToken should decode valid tokens and return null on invalid/empty tokens", () => {
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(decodeToken("")).toBeNull();
    expect(decodeToken("invalid")).toBeNull();
    expect(decodeToken("valid")).toEqual({ exp: 9999999999, sub: "123", username: "john", "cognito:groups": ["User"] });
    consoleErrorSpy.mockRestore();
  });

  test("isTokenExpired should check expiration correctly", () => {
    expect(isTokenExpired("")).toBe(true);
    expect(isTokenExpired("expired")).toBe(true);
    expect(isTokenExpired("valid")).toBe(false);
  });

  test("extractUserFromTokens should parse User and Admin claims correctly", () => {
    const user = extractUserFromTokens("valid", "valid");
    expect(user.isAdmin).toBe(false);
    expect(user.role).toBe("User");
    expect(user.userId).toBe("123");

    const admin = extractUserFromTokens("admin", "admin");
    expect(admin.isAdmin).toBe(true);
    expect(admin.role).toBe("Admin");
  });
});
