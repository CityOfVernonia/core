// https://vitejs.dev/config/

export default {
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
