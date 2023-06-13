// https://vitejs.dev/config/

export default {
  root: './dev',
  server: {
    port: 8080,
    open: true,
  },
  esbuild: {
    jsxFactory: 'tsx',
  },
};
