module.exports = {
  root: true,
  env: { browser: true, es2022: true },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended'
  ],
  ignorePatterns: ['dist', 'coverage', '.eslintrc.cjs', 'vite.config.ts', 'vitest.config.ts'],
  parser: '@typescript-eslint/parser',
  plugins: ['react-refresh'],
  rules: {
    'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        // Omit-by-destructuring (`const { type: _type, ...rest } = props`) is
        // how Button forwards only valid attributes to its `asChild` element.
        ignoreRestSiblings: true,
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_'
      }
    ]
  },
  overrides: [
    {
      // A context module canonically exports both its Provider component and
      // the hook that reads it; splitting them would only add indirection.
      files: ['src/context/**/*.{ts,tsx}'],
      rules: { 'react-refresh/only-export-components': 'off' }
    },
    {
      files: ['tests/**/*.{ts,tsx}'],
      env: { node: true },
      globals: { JSX: 'readonly' }
    }
  ]
};
