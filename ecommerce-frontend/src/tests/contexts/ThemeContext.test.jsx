import React from "react";
import { describe, test, expect, beforeEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { ThemeProvider, useTheme } from "../../contexts/ThemeContext";

const ThemeTestComponent = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  return (
    <div>
      <span data-testid="theme-state">{isDarkMode ? "dark" : "light"}</span>
      <button data-testid="toggle-btn" onClick={toggleTheme}>Toggle</button>
    </div>
  );
};

describe("ThemeContext Tests", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove("dark");
  });

  test("should throw error if useTheme is used outside provider", () => {
    const TestComponent = () => {
      useTheme();
      return null;
    };

    const consoleError = console.error;
    console.error = () => {}; // suppress React print
    expect(() => render(<TestComponent />)).toThrow("useTheme must be used within a ThemeProvider");
    console.error = consoleError;
  });

  test("should load default theme from localStorage", () => {
    localStorage.setItem("theme", "dark");
    render(
      <ThemeProvider>
        <ThemeTestComponent />
      </ThemeProvider>
    );

    expect(screen.getByTestId("theme-state").textContent).toBe("dark");
    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });

  test("should toggle theme and update localStorage and document classList", () => {
    render(
      <ThemeProvider>
        <ThemeTestComponent />
      </ThemeProvider>
    );

    expect(screen.getByTestId("theme-state").textContent).toBe("light");
    expect(document.documentElement.classList.contains("dark")).toBe(false);

    act(() => {
      screen.getByTestId("toggle-btn").click();
    });

    expect(screen.getByTestId("theme-state").textContent).toBe("dark");
    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(localStorage.getItem("theme")).toBe("dark");
  });
});
