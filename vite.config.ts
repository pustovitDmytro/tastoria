import { defineConfig } from 'vite';
import { qwikVite } from '@builder.io/qwik/optimizer';
import { qwikCity } from '@builder.io/qwik-city/vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import svgx from '@svgx/vite-plugin-qwik';
import basicSsl from '@vitejs/plugin-basic-ssl';
import { vitePluginTypescriptTransform } from 'vite-plugin-typescript-transform';
import ts from 'typescript';
import { execSync } from 'child_process';
import { version } from './package.json';

function gitCommit() {
    try {
        return execSync('git rev-parse --short=7 HEAD', { stdio: [ 'ignore', 'pipe', 'ignore' ] }).toString().trim();
    } catch {
        return '';
    }
}

const env = process.env;
const buildNumber = env.BUILD_NUMBER ?? (env.CIRCLE_BUILD_NUM ? `ci-${env.CIRCLE_BUILD_NUM}` : '');
const buildCommit = env.BUILD_COMMIT ?? env.CIRCLE_SHA1?.slice(0, 7) ?? gitCommit();

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
                        include : /firebase\/ui.ts$/
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
            // semantic-release-bundle patches the built bundle by matching VERSION:"<prev>", keep that key as is
            TASTORIA_BUILD : {
                DATE    : new Date().toISOString(),
                VERSION : version,
                NUMBER  : buildNumber,
                COMMIT  : buildCommit
            }
        }
    };
});
