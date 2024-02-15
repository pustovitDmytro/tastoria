import { defineConfig } from 'cypress';

export default defineConfig({
    retries : {
        runMode : 2
    },
    // e2e : {
    //     baseUrl     : 'http://localhost:1234',
    //     supportFile : 'tests/support/e2e.ts'
    // },
    component : {
        devServer : {
            framework : 'react',
            bundler   : 'vite'
        },
        // specPattern : 'src/**/*.cy.{js,jsx,ts,tsx}',
        specPattern   : 'tests/unit/*.test.ts',
        supportFile   : 'tests/support/component.ts',
        indexHtmlFile : 'tests/support/component-index.html',
        // setupNodeEvents(on, config) {
        //     codeCoverageTask(on, config);

        //     return config;
        // },

        slowTestThreshold : 500
    },
    screenshotsFolder : 'reports/cypress-screenshots'
});
