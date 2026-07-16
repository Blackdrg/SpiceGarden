module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/test/integration'],
  testMatch: ['**/*.spec.ts', '**/*.spec.js'],
  setupFilesAfterEnv: ['<rootDir>/test/jest-setup.integration.ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/main.ts',
    '!src/db/entities/**/*.ts'
  ],
  coverageDirectory: 'coverage/integration',
  coverageReporters: ['text', 'json', 'json-summary'],
  testTimeout: 60000,
  moduleFileExtensions: ['ts', 'js', 'json', 'node'],
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      tsconfig: '<rootDir>/tsconfig.test.json',
      useESM: false,
    }]
  },
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
  ]
};
