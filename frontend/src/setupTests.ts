import { vi } from 'vitest';
import '@testing-library/jest-dom';

// Add Jest compatibility
global.jest = vi;

// Make vi.fn() available as jest.fn()
(global as any).jest.fn = vi.fn;
(global as any).jest.mock = vi.mock;
(global as any).jest.clearAllMocks = vi.clearAllMocks;
(global as any).jest.resetAllMocks = vi.resetAllMocks;
(global as any).jest.restoreAllMocks = vi.restoreAllMocks;

// Add jest.Mock type compatibility
(global as any).jest.Mock = vi.fn;