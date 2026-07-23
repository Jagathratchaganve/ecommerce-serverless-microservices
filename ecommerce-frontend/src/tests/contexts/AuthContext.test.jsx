import React from "react";
import { describe, test, expect, vi, beforeEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { AuthProvider, useAuth } from "../../contexts/AuthContext";
import { authService } from "../../services/authService";
import { isTokenExpired, extractUserFromTokens } from "../../utils/jwt";

vi.mock("../../services/authService", () => ({
  authService: {
    login: vi.fn(),
    signUp: vi.fn(),
    confirmSignUp: vi.fn(),
    adminCreateUser: vi.fn()
  }
}));

vi.mock("../../utils/jwt", () => ({
  isTokenExpired: vi.fn(),
  extractUserFromTokens: vi.fn()
}));

const AuthTestComponent = () => {
  const { user, isAuthenticated, signup, confirmSignup, adminCreateUser, logout } = useAuth();
  return (
    <div>
      <span data-testid="auth-state">{isAuthenticated ? "authenticated" : "unauthenticated"}</span>
      <span data-testid="username">{user ? user.name : "none"}</span>
      <button data-testid="signup-btn" onClick={() => signup("Alice", "test@a.com", "pwd")}>Signup</button>
      <button data-testid="confirm-btn" onClick={() => confirmSignup("test@a.com", "123456")}>Confirm</button>
      <button data-testid="admin-create" onClick={() => adminCreateUser({ name: "Bob" })}>Admin Create</button>
      <button data-testid="logout-btn" onClick={() => logout()}>Logout</button>
    </div>
  );
};

describe("AuthContext Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  test("should load user session from localStorage on mount if token is valid", () => {
    localStorage.setItem("accessToken", "token123");
    isTokenExpired.mockReturnValue(false);
    extractUserFromTokens.mockReturnValue({ name: "Alice", role: "User" });

    render(
      <AuthProvider>
        <AuthTestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId("auth-state").textContent).toBe("authenticated");
    expect(screen.getByTestId("username").textContent).toBe("Alice");
  });

  test("should logout on mount if token is expired", () => {
    localStorage.setItem("accessToken", "token123");
    isTokenExpired.mockReturnValue(true);

    render(
      <AuthProvider>
        <AuthTestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId("auth-state").textContent).toBe("unauthenticated");
  });

  test("should login successfully and save tokens", async () => {
    authService.login.mockResolvedValue({
      success: true,
      data: { accessToken: "access", idToken: "id", refreshToken: "refresh" }
    });
    extractUserFromTokens.mockReturnValue({ name: "Bob", role: "User" });

    let authContextValue;
    const TestComponent = () => {
      authContextValue = useAuth();
      return null;
    };

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    let res;
    await act(async () => {
      res = await authContextValue.login("test@a.com", "pwd");
    });

    expect(res.success).toBe(true);
    expect(res.user.name).toBe("Bob");
    expect(localStorage.getItem("accessToken")).toBe("access");
  });

  test("should fail login on service error", async () => {
    const errorResponse = new Error("Invalid Credentials");
    errorResponse.response = { data: { message: "Wrong credentials" } };
    authService.login.mockRejectedValue(errorResponse);

    let authContextValue;
    const TestComponent = () => {
      authContextValue = useAuth();
      return null;
    };

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await expect(
      act(async () => {
        await authContextValue.login("test@a.com", "pwd");
      })
    ).rejects.toThrow("Wrong credentials");
  });

  test("should signup successfully", async () => {
    authService.signUp.mockResolvedValue({ success: true, message: "Code sent" });

    render(
      <AuthProvider>
        <AuthTestComponent />
      </AuthProvider>
    );

    await act(async () => {
      screen.getByTestId("signup-btn").click();
    });

    expect(authService.signUp).toHaveBeenCalled();
  });

  test("should confirm signup successfully", async () => {
    authService.confirmSignUp.mockResolvedValue({ success: true });

    render(
      <AuthProvider>
        <AuthTestComponent />
      </AuthProvider>
    );

    await act(async () => {
      screen.getByTestId("confirm-btn").click();
    });

    expect(authService.confirmSignUp).toHaveBeenCalled();
  });

  test("should admin create user", async () => {
    authService.adminCreateUser.mockResolvedValue({ success: true });

    render(
      <AuthProvider>
        <AuthTestComponent />
      </AuthProvider>
    );

    await act(async () => {
      screen.getByTestId("admin-create").click();
    });

    expect(authService.adminCreateUser).toHaveBeenCalled();
  });

  test("should logout successfully", () => {
    localStorage.setItem("accessToken", "token");
    render(
      <AuthProvider>
        <AuthTestComponent />
      </AuthProvider>
    );

    act(() => {
      screen.getByTestId("logout-btn").click();
    });

    expect(localStorage.getItem("accessToken")).toBeNull();
  });
});
