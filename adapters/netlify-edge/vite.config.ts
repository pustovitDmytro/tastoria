import { netlifyEdgeAdapter } from "@builder.io/qwik-city/adapters/netlify-edge/vite";
import { extendConfig } from "@builder.io/qwik-city/vite";
import baseConfig from "../../vite.config";

// import { nodeResolve } from '@rollup/plugin-node-resolve';
// import builtins from 'rollup-plugin-node-builtins';

// const builtinsPlugin = { ...builtins({ crypto: true }), name: 'rollup-plugin-node-builtins' };

export default extendConfig(baseConfig, () => {
  return {
    build: {
      ssr: true,
      rollupOptions: {
        input: ["src/entry.netlify-edge.tsx", "@qwik-city-plan"],
        external: ["node:crypto", "node:buffer", "crypto", "fs", "stream", "util", "url", "events", "assert", "net", "os", "path", "tls", "http", "https", "zlib", "querystring", "child_process"],
      },
      outDir: ".netlify/edge-functions/entry.netlify-edge",
    },
    plugins: [
      netlifyEdgeAdapter(),
    ],
  };
})

