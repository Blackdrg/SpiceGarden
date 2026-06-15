/* eslint-disable react/react-in-jsx-scope */
/* eslint-disable @typescript-eslint/no-unused-vars */
jest.mock('@react-native-async-storage/async-storage', () => ({
  default: {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
    getAllKeys: jest.fn(),
  },
}));

globalThis.fetch = () =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({}),
  });
