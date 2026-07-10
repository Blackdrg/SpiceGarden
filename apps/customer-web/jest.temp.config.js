module.exports = {
  testEnvironment: 'jest-environment-jsdom',
  testMatch: ['**/?(*.)+(spec|test).[tj]s?(x)'],
  transform: {},
  moduleNameMapper: {
    '\\.module\\.css$': 'identity-obj-proxy',
  },
};
