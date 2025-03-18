import globals from 'globals';
import pluginJs from '@eslint/js';
import tseslint from 'typescript-eslint';
import eslintConfigPrettier from 'eslint-config-prettier';

export default [
  { languageOptions: { globals: { ...globals.browser, ...globals.node } } },
  eslintConfigPrettier,
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['src/*.{ts,tsx}', 'dev/app.ts', 'scripts/*.js'],
  },
  {
    ignores: ['package.json', 'package-lock.json', 'node_modules/**', 'docs', 'dist/**', 'dev/public/**'],
  },
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': 'warn',
    },
  },
];
