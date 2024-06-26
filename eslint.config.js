import globals from 'globals';
import pluginJs from '@eslint/js';
import tseslint from 'typescript-eslint';

export default [
  { languageOptions: { globals: { ...globals.browser, ...globals.node } } },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['src/*.{ts,tsx}', 'scripts/*.js', 'dev/*.{js,ts,tsx}'],
  },
  {
    ignores: ['package.json', 'package-lock.json', 'node_modules/**', 'dev/**', 'dist/**', 'docs/**'],
  },
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': 'warn',
    },
  },
];
