import '@testing-library/jest-dom';

global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

(globalThis as unknown as Record<string, unknown>).fetch = () =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({}),
  } as unknown as Response);
