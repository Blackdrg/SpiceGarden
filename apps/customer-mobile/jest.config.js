module.exports = {
  testEnvironment: 'node',
  globals: {
    __DEV__: true,
  },
  setupFiles: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@spicegarden/shared/(.*)$': '<rootDir>/../../packages/shared/$1',
    '^@spicegarden/ui/(.*)$': '<rootDir>/../../packages/ui/src/$1',
    '^react-native-safe-area-context$': '<rootDir>/__mocks__/react-native-safe-area-context.js',
    '^expo-haptics$': '<rootDir>/__mocks__/expo-haptics.js',
    '\\.(png|jpg|jpeg|gif|svg)$': '<rootDir>/__mocks__/fileMock.js',
    '\\.(css|scss|sass)$': '<rootDir>/../../packages/ui/__mocks__/styleMock.js',
    '^react-native-reanimated$': '<rootDir>/__mocks__/react-native-reanimated.js',
    '^.+\\.module\\.(css|scss|sass)$': '<rootDir>/../../packages/ui/__mocks__/styleMock.js',
  },
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|@expo|expo|expo-image|expo-modules-core|@spicegarden)/)',
  ],
  testMatch: ['**/*.test.{js,jsx}', '**/*.integration.test.{js,jsx}'],
  testPathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/.expo/'],
};
