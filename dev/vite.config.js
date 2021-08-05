// https://vitejs.dev/config/

import path from 'path';

export default {
  resolve: {
    alias: {
      'cov': path.resolve(__dirname, './..'),
    },
  },

  // dev server options
  server: {
    https: true,
    port: 8080,
    open: true,
  },

  esbuild: {
    // to build esri widgets properly
    jsxFactory: 'tsx',
  },
};
