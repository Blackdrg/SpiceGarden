// Jest setup for restaurant-dashboard
// Mock window.confirm for tests
Object.defineProperty(window, 'confirm', {
  value: jest.fn(() => true),
});

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => { store[key] = value; },
    removeItem: (key) => { delete store[key]; },
    clear: () => { store = {}; },
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Setup DOM matchers
require('@testing-library/jest-dom');