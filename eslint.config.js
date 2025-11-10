const { defineConfig } = require('eslint/config');
const tsParser = require('@typescript-eslint/parser');
const js = require('@eslint/js');
const { FlatCompat } = require('@eslint/eslintrc');

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

module.exports = defineConfig([
  {
    languageOptions: {
      parser: tsParser,
      ecmaVersion: 2020,
      sourceType: 'commonjs',
      parserOptions: {},
    },

    extends: compat.extends('eslint:recommended', 'plugin:@typescript-eslint/recommended'),

    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
        },
      ],

      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-require-imports': 'off',
    },
  },
]);
