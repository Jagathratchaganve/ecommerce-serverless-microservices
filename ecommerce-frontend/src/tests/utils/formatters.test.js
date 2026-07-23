import { describe, test, expect } from "vitest";
import {
  formatCurrency,
  calculateDiscountPercentage,
  formatDate,
  getStatusBadgeClass
} from "../../utils/formatters";

describe("Formatting Utilities Tests", () => {
  describe("formatCurrency", () => {
    test("should format amount as INR Currency", () => {
      const formatted = formatCurrency(1234.56);
      // Clean non-breaking spaces
      const normalized = formatted.replace(/\u00a0/g, " ");
      expect(normalized).toContain("₹");
      expect(normalized).toContain("1,235"); // rounds to max fraction 0
    });

    test("should handle empty or null values", () => {
      const formatted = formatCurrency(null);
      const normalized = formatted.replace(/\u00a0/g, " ");
      expect(normalized).toContain("₹");
      expect(normalized).toContain("0");
    });
  });

  describe("calculateDiscountPercentage", () => {
    test("should calculate correct percentage", () => {
      expect(calculateDiscountPercentage(100, 80)).toBe(20);
      expect(calculateDiscountPercentage(1000, 650)).toBe(35);
    });

    test("should return 0 on invalid inputs", () => {
      expect(calculateDiscountPercentage(0, 50)).toBe(0);
      expect(calculateDiscountPercentage(100, 150)).toBe(0);
      expect(calculateDiscountPercentage(100, -10)).toBe(0);
    });
  });

  describe("formatDate", () => {
    test("should format date string correctly", () => {
      const dateStr = "2026-07-22T10:00:00.000Z";
      const formatted = formatDate(dateStr);
      expect(formatted).toContain("2026");
      expect(formatted).toContain("Jul");
    });

    test("should return N/A if date is empty", () => {
      expect(formatDate("")).toBe("N/A");
      expect(formatDate(null)).toBe("N/A");
    });
  });

  describe("getStatusBadgeClass", () => {
    test("should return correct classes for SUCCESS, PLACED, DELIVERED", () => {
      expect(getStatusBadgeClass("SUCCESS")).toContain("bg-emerald-100");
      expect(getStatusBadgeClass("placed")).toContain("bg-emerald-100");
    });

    test("should return correct classes for PENDING, SHIPPED, OUT_FOR_DELIVERY", () => {
      expect(getStatusBadgeClass("PENDING")).toContain("bg-amber-100");
      expect(getStatusBadgeClass("shipped")).toContain("bg-amber-100");
    });

    test("should return correct classes for CANCELLED, FAILED, RETURNED", () => {
      expect(getStatusBadgeClass("FAILED")).toContain("bg-rose-100");
      expect(getStatusBadgeClass("cancelled")).toContain("bg-rose-100");
    });

    test("should return default classes for unknown status", () => {
      expect(getStatusBadgeClass("UNKNOWN")).toContain("bg-slate-100");
    });
  });
});
