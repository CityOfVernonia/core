// https://vitejs.dev/config/

import { defineConfig } from 'vite';

export default defineConfig({
  root: './dev',
  server: {
    port: 8080,
    open: true,
  },
  esbuild: {
    jsxFactory: 'tsx',
  },
  css: {
    preprocessorOptions: {
      scss: {
        silenceDeprecations: ['import'],
      },
    },
  },
});
