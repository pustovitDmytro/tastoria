import { netlifyEdgeAdapter } from "@builder.io/qwik-city/adapters/netlify-edge/vite";
import { extendConfig } from "@builder.io/qwik-city/vite";
import baseConfig from "../../vite.config";

import { nodeResolve } from '@rollup/plugin-node-resolve';

// const replacePlugin = {
//         {
//         name      : 'replace-plugin',
//         resolveId : {
//             order : 'pre',
//             async handler(source, importer, resolveOptions) {
//                 if (source === 'firebase/storage') return '/home/dima/Projects/pet/tastoria/node_modules/@firebase/storage/dist/index.node.cjs.js';
//             }
//         }
//     },
// }

export default extendConfig(baseConfig, () => {
  return {
    // ssr : {
    //   external   : [ 'stream' ],
    //   noExternal : 'ANANANANA'
    // },
    build: {
      ssr: true,
      rollupOptions: {
        input: ["src/entry.netlify-edge.tsx", "@qwik-city-plan"],
      },
      // commonjsOptions: {
      //   esmExternals: true,
      //   ignore: ['stream']
      // },
      outDir: ".netlify/edge-functions/entry.netlify-edge",
    },
    plugins: [
      netlifyEdgeAdapter() 
    ],
  };
});
