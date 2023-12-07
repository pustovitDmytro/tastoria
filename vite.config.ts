import { defineConfig } from 'vite';
import { qwikVite } from '@builder.io/qwik/optimizer';
import { qwikCity } from '@builder.io/qwik-city/vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import { version } from './package.json';

process.env.PUBLIC_TASTORIA_BUILD_DATE = (new Date()).toISOString();
process.env.PUBLIC_TASTORIA_VERSION = version;

export default defineConfig(() => {
    return {
        plugins : [
            qwikCity(),
            qwikVite(),
            tsconfigPaths()
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
        }
    };
});
