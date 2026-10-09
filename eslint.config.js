import js from '@eslint/js';
import { defineConfig, globalIgnores } from 'eslint/config';
import prettier from 'eslint-config-prettier';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default defineConfig([
  globalIgnores(['dist', 'coverage', 'test-results', 'playwright-report']),
  js.configs.recommended,
  tseslint.configs.strictTypeChecked,
  {
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    files: ['**/*.js'],
    extends: [tseslint.configs.disableTypeChecked],
  },
  {
    files: ['src/**/*.{ts,tsx}'],
    extends: [reactHooks.configs.flat.recommended],
  },
  {
    // Tests must not wait on timers or narrow or disable the run.
    files: ['**/*.test.{ts,tsx}', 'e2e/**/*.ts'],
    rules: {
      'no-restricted-globals': [
        'error',
        {
          name: 'setTimeout',
          message: 'Use web-first assertions or fake timers, never sleeps.',
        },
      ],
      'no-restricted-properties': [
        'error',
        {
          object: 'window',
          property: 'setTimeout',
          message: 'Never sleep in tests.',
        },
        {
          object: 'globalThis',
          property: 'setTimeout',
          message: 'Never sleep in tests.',
        },
      ],
      'no-restricted-syntax': [
        'error',
        {
          selector:
            'MemberExpression[object.name=/^(test|it|describe)$/][property.name=/^(skip|only)$/]',
          message:
            'Skipped or focused tests never reach main; use test.todo for a planned case.',
        },
        {
          selector:
            'MemberExpression[object.property.name="describe"][property.name=/^(skip|only)$/]',
          message:
            'Skipped or focused tests never reach main; use test.todo for a planned case.',
        },
      ],
    },
  },
  prettier,
]);
