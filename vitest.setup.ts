import "@testing-library/jest-dom";

// Mock ResizeObserver for JSDOM
class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}
global.ResizeObserver = ResizeObserverMock;
