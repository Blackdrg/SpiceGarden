module.exports = {
  testEnvironment: 'node',
  setupFiles: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@spicegarden/shared/(.*)$': '<rootDir>/../../packages/shared/$1',
    '^@spicegarden/ui/(.*)$': '<rootDir>/../../packages/ui/src/$1',
  },
  testMatch: ['**/*.test.{js,jsx}'],
  testPathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/.expo/'],
};
