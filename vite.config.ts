import { defineConfig } from 'vite';
import { qwikVite } from '@builder.io/qwik/optimizer';
import { qwikCity } from '@builder.io/qwik-city/vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import svgx from '@svgx/vite-plugin-qwik';
import basicSsl from '@vitejs/plugin-basic-ssl';
import { vitePluginTypescriptTransform } from 'vite-plugin-typescript-transform';
import ts from 'typescript';
import { version } from './package.json';

process.env.PUBLIC_TASTORIA_BUILD_DATE = (new Date()).toISOString();
process.env.PUBLIC_TASTORIA_VERSION = version;

export default defineConfig(() => {
    return {
        plugins : [
            // basicSsl(),
            // babel({
            //     babelConfig : {
            //         babelrc : true
            //     }
            // }),
            svgx(),
            qwikCity(),
            qwikVite(),
            tsconfigPaths(),
            vitePluginTypescriptTransform({
                enforce : 'pre',
                filter  : {
                    files : {
                        include : /firebase.ts$/
                    }
                },
                tsconfig : {
                    override : {
                        jsx : ts.JsxEmit.Preserve
                    }
                }
            })
        ],
        dev : {
            headers : {
                'Cache-Control' : 'public, max-age=0'
            }
        },
        preview : {
            headers : {
                'Cache-Control' : 'public, max-age=600'
            }
        },
        define : {
            TASTORIA_BUILD_DATE : JSON.stringify((new Date()).toISOString()),
            TASTORIA_VERSION    : JSON.stringify(version)
        }
    };
});
