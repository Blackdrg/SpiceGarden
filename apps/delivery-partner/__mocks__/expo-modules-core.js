module.exports = {
  requireNativeModule: () => ({
    setValueWithKeyAsync: jest.fn(),
    getValueWithKeyAsync: jest.fn(),
    deleteValueWithKeyAsync: jest.fn(),
    setValueWithKeySync: jest.fn(),
    getValueWithKeySync: jest.fn(),
    deleteValueWithKeySync: jest.fn(),
    canUseBiometricAuthentication: jest.fn(() => true),
  }),
};
