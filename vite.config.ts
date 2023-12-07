import { defineConfig } from 'vite';
import { qwikVite } from '@builder.io/qwik/optimizer';
import { qwikCity } from '@builder.io/qwik-city/vite';
import tsconfigPaths from 'vite-tsconfig-paths';

process.env.PUBLIC_TASTORIA_BUILD_DATE = (new Date()).toISOString();

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
