/** @type {import('eslint').Linter.Config[]} */
const tsParser = require('@typescript-eslint/parser');
const tsPlugin = require('@typescript-eslint/eslint-plugin');
const reactPlugin = require('eslint-plugin-react');
const reactHooksPlugin = require('eslint-plugin-react-hooks');

const ignorePatterns = [
  'node_modules/**',
  'dist/**',
  'build/**',
  'coverage/**',
  'out/**',
  '**/.next/**',
  '**/*.spec.ts',
  '**/*.test.ts',
  '**/__tests__/**',
  '**/*.test.*',
  '*.min.js',
  '*.d.ts',
  '*.js.map',
  'apps/customer-mobile/detox.config.js',
  'apps/customer-mobile/jest.setup.js',
  'apps/delivery-partner/detox.config.js',
  'apps/delivery-partner/jest.setup.js',
  'apps/backend/test/load/**',
  '**/*.js',
];

const sharedRules = {
  'react/react-in-jsx-scope': 'off',
  '@typescript-eslint/no-unused-vars': 'off',
  'no-unused-vars': 'off',
  '@typescript-eslint/no-require-imports': 'off',
  '@typescript-eslint/no-explicit-any': 'off',
  '@typescript-eslint/no-empty-object-type': 'off',
  '@typescript-eslint/ban-ts-comment': 'off',
  '@typescript-eslint/no-unused-expressions': 'off',
  '@typescript-eslint/no-empty-function': 'off',
  'react/prop-types': 'off',
  'react/display-name': 'off',
  'react-hooks/refs': 'off',
  'react-hooks/immutability': 'off',
  'react-hooks/set-state-in-effect': 'off',
  'react-hooks/preserve-manual-memoization': 'off',
  'react-hooks/purity': 'off',
  'react/no-unescaped-entities': 'off',
  'react/jsx-key': 'off',
  'react-hooks/exhaustive-deps': 'warn',
};

const tsConfig = {
  files: ['**/*.{ts,tsx}'],
  languageOptions: {
    parser: tsParser,
    parserOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      ecmaFeatures: { jsx: true },
    },
    globals: {
      browser: true,
      node: true,
      jest: true,
      console: 'readonly',
      fetch: 'readonly',
      setTimeout: 'readonly',
      clearTimeout: 'readonly',
      setInterval: 'readonly',
      clearInterval: 'readonly',
      require: 'readonly',
      module: 'readonly',
      __dirname: 'readonly',
      process: 'readonly',
      exports: 'readonly',
      Promise: 'readonly',
    },
  },
  plugins: {
    '@typescript-eslint': tsPlugin,
    react: reactPlugin,
    'react-hooks': reactHooksPlugin,
  },
  settings: {
    react: { version: 'detect' },
  },
  rules: sharedRules,
};

module.exports = [
  { ignores: ignorePatterns },
  tsConfig,
  {
    files: ['apps/backend/src/main.js', 'apps/backend/src/main.ts'],
    rules: {
      '@typescript-eslint/no-var-requires': 'off',
    },
  },
  {
    files: [
      'apps/customer-mobile/detox.config.js',
      'apps/customer-mobile/jest.setup.js',
      'apps/delivery-partner/detox.config.js',
      'apps/delivery-partner/jest.setup.js',
      'apps/backend/test/load/**/*.js',
    ],
    languageOptions: {
      parser: require('espree'),
      parserOptions: { ecmaVersion: 2020 },
    },
    rules: {
      '@typescript-eslint/no-var-requires': 'off',
    },
  },
  {
    files: ['packages/shared/**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-unused-vars': 'off',
      'no-unused-vars': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
  {
    files: ['packages/ui/**/*.{ts,tsx}'],
    rules: {
      'react-hooks/set-state-in-effect': 'off',
      'react/prop-types': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
];
