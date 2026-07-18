module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/test'],
  testMatch: ['**/*.spec.ts', '**/*.spec.js', '**/*-spec.ts', '**/*-spec.js', '**/*.spec.cjs', '**/*-spec.cjs'],
  setupFilesAfterEnv: ['<rootDir>/test/jest-setup.ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/main.ts',
    '!src/db/entities/**/*.ts'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'json', 'json-summary'],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  testTimeout: 30000,
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
    'mongo-connection.spec.ts',
    'mongo-connection.spec.js',
    'mongo-connection.spec.cjs',
    'test/integration/',
  ]
};