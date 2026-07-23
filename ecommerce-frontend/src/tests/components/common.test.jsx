import React from "react";
import { describe, test, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { LoadingSpinner } from "../../components/common/LoadingSpinner";
import { EmptyState } from "../../components/common/EmptyState";
import { ConfirmationDialog } from "../../components/common/ConfirmationDialog";
import { Modal } from "../../components/common/Modal";
import { Pagination } from "../../components/common/Pagination";
import { ProductCardSkeleton, TableRowSkeleton } from "../../components/common/SkeletonLoader";
import { Footer } from "../../components/common/Footer";
import { Navbar } from "../../components/common/Navbar";

vi.mock("../../contexts/AuthContext", () => ({
  useAuth: () => ({
    isAuthenticated: true,
    user: { name: "Alice", email: "alice@example.com" },
    logout: vi.fn(),
    isAdmin: false
  })
}));

vi.mock("../../contexts/CartContext", () => ({
  useCart: () => ({
    cart: { items: [{ productId: "p1", quantity: 2 }] },
    itemCount: 2
  })
}));

vi.mock("../../contexts/ProductContext", () => ({
  useProducts: () => ({
    searchQuery: "",
    setSearchQuery: vi.fn(),
    categories: ["Electronics", "Laptops"]
  })
}));

vi.mock("../../contexts/ThemeContext", () => ({
  useTheme: () => ({
    isDarkMode: false,
    toggleTheme: vi.fn()
  })
}));

describe("Common UI Components Tests", () => {
  describe("LoadingSpinner", () => {
    test("renders spinner and text when provided", () => {
      render(<LoadingSpinner size="lg" text="Loading data..." />);
      expect(screen.getByText("Loading data...")).toBeInTheDocument();
    });
  });

  describe("EmptyState", () => {
    test("renders title, description, and button action", () => {
      const mockAction = vi.fn();
      render(
        <BrowserRouter>
          <EmptyState
            title="No items"
            description="Your cart is empty"
            actionText="Shop Now"
            onAction={mockAction}
          />
        </BrowserRouter>
      );

      expect(screen.getByText("No items")).toBeInTheDocument();
      expect(screen.getByText("Your cart is empty")).toBeInTheDocument();
      
      const btn = screen.getByRole("link", { name: "Shop Now" });
      expect(btn).toBeInTheDocument();
    });
  });

  describe("ConfirmationDialog", () => {
    test("renders dialog and handles cancel/confirm clicks", () => {
      const onConfirm = vi.fn();
      const onClose = vi.fn();

      render(
        <ConfirmationDialog
          isOpen={true}
          title="Delete Item?"
          message="Are you sure?"
          confirmText="Yes"
          onConfirm={onConfirm}
          onClose={onClose}
        />
      );

      expect(screen.getByText("Delete Item?")).toBeInTheDocument();
      expect(screen.getByText("Are you sure?")).toBeInTheDocument();

      fireEvent.click(screen.getByText("Yes"));
      expect(onConfirm).toHaveBeenCalled();

      fireEvent.click(screen.getByText("Cancel"));
      expect(onClose).toHaveBeenCalled();
    });

    test("returns null if not open", () => {
      const { container } = render(
        <ConfirmationDialog isOpen={false} onConfirm={() => {}} onClose={() => {}} />
      );
      expect(container.firstChild).toBeNull();
    });
  });

  describe("Modal", () => {
    test("renders children when open", () => {
      const onClose = vi.fn();
      const { container } = render(
        <Modal isOpen={true} title="My Modal" onClose={onClose}>
          <div>Modal Content</div>
        </Modal>
      );

      expect(screen.getByText("My Modal")).toBeInTheDocument();
      expect(screen.getByText("Modal Content")).toBeInTheDocument();

      // Modal close button has X icon inside a button, find the button inside header
      const closeBtn = container.querySelector("header button") || container.querySelector("button");
      expect(closeBtn).toBeInTheDocument();
      fireEvent.click(closeBtn);
      expect(onClose).toHaveBeenCalled();
    });

    test("returns null if not open", () => {
      const { container } = render(<Modal isOpen={false} onClose={() => {}} />);
      expect(container.firstChild).toBeNull();
    });
  });

  describe("Pagination", () => {
    test("renders page buttons and triggers page changes", () => {
      const onPageChange = vi.fn();
      const { container } = render(
        <Pagination
          currentPage={2}
          totalPages={5}
          onPageChange={onPageChange}
          totalItems={50}
          itemsPerPage={10}
        />
      );

      expect(screen.getByText("Page 2 of 5")).toBeInTheDocument();
      
      const buttons = container.querySelectorAll("button");
      // buttons[0] is prev, buttons[1] is next
      fireEvent.click(buttons[1]); // Next
      expect(onPageChange).toHaveBeenCalledWith(3);
    });
  });

  describe("SkeletonLoader", () => {
    test("renders TableRowSkeleton", () => {
      render(
        <table>
          <tbody>
            <TableRowSkeleton columns={3} />
          </tbody>
        </table>
      );
      expect(screen.getAllByRole("cell").length).toBe(3);
    });

    test("renders ProductCardSkeleton", () => {
      const { container } = render(<ProductCardSkeleton />);
      expect(container.firstChild).toBeInTheDocument();
    });
  });

  describe("Footer", () => {
    test("renders copyright and sections", () => {
      render(
        <BrowserRouter>
          <Footer />
        </BrowserRouter>
      );
      expect(screen.getByText(/All rights reserved/i)).toBeInTheDocument();
    });
  });

  describe("Navbar", () => {
    test("renders category navigation pills", () => {
      render(
        <BrowserRouter>
          <Navbar />
        </BrowserRouter>
      );
      expect(screen.getByText("All Categories")).toBeInTheDocument();
      expect(screen.getByText("Electronics")).toBeInTheDocument();
    });
  });
});
