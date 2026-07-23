import React from "react";
import { describe, test, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { ProtectedRoute } from "../../routes/ProtectedRoute";
import { useAuth } from "../../contexts/AuthContext";
import { Navigate, useLocation } from "react-router-dom";

vi.mock("../../contexts/AuthContext", () => ({
  useAuth: vi.fn()
}));

vi.mock("react-router-dom", () => ({
  Navigate: vi.fn(({ to }) => <div data-testid="navigate" data-to={to} />),
  useLocation: vi.fn(() => ({ pathname: "/current-path" }))
}));

vi.mock("../../components/common/LoadingSpinner", () => ({
  LoadingSpinner: ({ text }) => <div data-testid="loading">{text}</div>
}));

describe("ProtectedRoute Component Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("should show loading spinner when auth loading is true", () => {
    useAuth.mockReturnValue({ isAuthenticated: false, isAdmin: false, loading: true });
    render(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    );

    expect(screen.getByTestId("loading")).toBeInTheDocument();
    expect(screen.queryByText("Protected Content")).not.toBeInTheDocument();
  });

  test("should redirect to /login when not authenticated", () => {
    useAuth.mockReturnValue({ isAuthenticated: false, isAdmin: false, loading: false });
    render(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    );

    expect(screen.getByTestId("navigate")).toBeInTheDocument();
    expect(screen.getByTestId("navigate").getAttribute("data-to")).toBe("/login");
  });

  test("should redirect to /403 when admin is required but user is not admin", () => {
    useAuth.mockReturnValue({ isAuthenticated: true, isAdmin: false, loading: false });
    render(
      <ProtectedRoute requireAdmin={true}>
        <div>Admin Content</div>
      </ProtectedRoute>
    );

    expect(screen.getByTestId("navigate")).toBeInTheDocument();
    expect(screen.getByTestId("navigate").getAttribute("data-to")).toBe("/403");
  });

  test("should render children when authenticated and requireAdmin is false", () => {
    useAuth.mockReturnValue({ isAuthenticated: true, isAdmin: false, loading: false });
    render(
      <ProtectedRoute requireAdmin={false}>
        <div>Protected Content</div>
      </ProtectedRoute>
    );

    expect(screen.getByText("Protected Content")).toBeInTheDocument();
  });

  test("should render children when admin is required and user is admin", () => {
    useAuth.mockReturnValue({ isAuthenticated: true, isAdmin: true, loading: false });
    render(
      <ProtectedRoute requireAdmin={true}>
        <div>Admin Content</div>
      </ProtectedRoute>
    );

    expect(screen.getByText("Admin Content")).toBeInTheDocument();
  });
});
