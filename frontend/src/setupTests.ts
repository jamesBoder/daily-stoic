import { vi } from 'vitest';
import '@testing-library/jest-dom';

// jsdom doesn't implement matchMedia — stub it out so hooks that call it don't throw
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Add Jest compatibility
(global as any).jest = vi;

// Make vi.fn() available as jest.fn()
(global as any).jest.fn = vi.fn;
(global as any).jest.mock = vi.mock;
(global as any).jest.clearAllMocks = vi.clearAllMocks;
(global as any).jest.resetAllMocks = vi.resetAllMocks;
(global as any).jest.restoreAllMocks = vi.restoreAllMocks;

// Add jest.Mock type compatibility
(global as any).jest.Mock = vi.fn;