import { expect, afterEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";
import * as matchers from "@testing-library/jest-dom/matchers";

// Extend Vitest expect with Testing Library matchers
expect.extend(matchers);

// Cleanup jsdom and clear mocks after each test
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

// Mock window/global properties if necessary (e.g. matchMedia, IntersectionObserver)
global.matchMedia = global.matchMedia || function() {
  return {
    matches: false,
    addListener: function() {},
    removeListener: function() {}
  };
};
