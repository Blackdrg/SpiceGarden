module.exports = {
  rootDir: __dirname,
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  testPathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/.next/', '<rootDir>/__tests__/e2e/'],
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.test.json' }],
  },
  moduleNameMapper: {
    '\\.module\\.css$': 'identity-obj-proxy',
    '\\.(css|scss|sass)$': 'identity-obj-proxy',
    '^next/head$': '<rootDir>/__mocks__/next-head.js',
    '^next/link$': '<rootDir>/__mocks__/next-link.js',
    '^next/router$': '<rootDir>/__mocks__/next-router.js',
  },
  transformIgnorePatterns: [
    '/node_modules/(?!(@spicegarden/ui|lucide-react)/)',
  ],
}
