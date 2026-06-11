module.exports = {
  root: true,
  ignorePatterns: ['node_modules', 'dist', 'build', '.next'],
  overrides: [
    {
      files: ['*.ts', '*.tsx'],
      parser: '@typescript-eslint/parser',
      parserOptions: { project: true, tsconfigRootDir: __dirname },
      plugins: ['@typescript-eslint'],
      extends: ['plugin:@typescript-eslint/recommended'],
      rules: {
        '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
        '@typescript-eslint/no-explicit-any': 'off',
      },
    },
    {
      files: ['*.tsx'],
      plugins: ['react'],
      extends: ['plugin:react/recommended', 'plugin:react-hooks/recommended'],
      settings: { react: { version: '19' } },
      rules: {
        'react/prop-types': 'off',
        'react/react-in-jsx-scope': 'off',
      },
    },
    {
      files: ['**/__tests__/**', '**/*.test.ts', '**/*.test.tsx'],
      env: { jest: true },
      plugins: ['jest'],
      extends: ['plugin:jest/recommended'],
    },
    {
      files: ['apps/backend/**/*.ts'],
      env: { node: true, jest: true },
      plugins: ['jest', '@typescript-eslint'],
      extends: ['plugin:jest/recommended'],
      rules: { 'jest/expect-expect': 'warn' },
    },
  ],
  rules: {
    'import/no-unresolved': 'off',
    'import/no-extraneous-dependencies': 'off',
  },
};
