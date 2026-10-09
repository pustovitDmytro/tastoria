import { defineConfig } from 'cypress';

const e = process.env;
const port = Number(e.CYPRESS_PORT ?? 5173);

export default defineConfig({
    defaultCommandTimeout : 60_000,
    retries               : {
        runMode : 2
    },
    env : {
        email    : e.TEST_USER_EMAIL,
        password : e.TEST_USER_PASSWORD
    },
    e2e : {
        baseUrl     : e.CYPRESS_BASE_URL ?? `http://localhost:${port}`,
        supportFile : 'tests/support/e2e.ts',
        specPattern : 'tests/e2e/*.test.ts'
    },
    component : {
        devServer : {
            framework : 'react',
            bundler   : 'vite'
        },
        specPattern   : 'tests/unit/*.test.ts',
        supportFile   : 'tests/support/component.ts',
        indexHtmlFile : 'tests/support/component-index.html',
        // setupNodeEvents(on, config) {
        //     codeCoverageTask(on, config);

        //     return config;
        // },

        slowTestThreshold : 30_000
    },
    screenshotsFolder : 'reports/cypress-screenshots'
});
