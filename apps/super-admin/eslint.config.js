const baseConfig = require('../../eslint.config.cjs');

module.exports = [
  ...baseConfig,
  {
    files: ['**/*.{js,jsx}'],
    ignores: [
      '**/*.spec.*',
      '**/*.test.*',
      '**/__tests__/**',
    ],
  },
];
