/**
 * Configuration for Playwright using default from @jupyterlab/galata
 */
const baseConfig = require('@jupyterlab/galata/lib/playwright-config');

module.exports = {
  ...baseConfig,
  // Retain video for each test:
  //use: {
  //  ...baseConfig.use,
  //  video: 'on',
  //},
  //preserveOutput: 'always',//'always', 'never', 'failures-only'
  webServer: {
    command: 'jlpm start',
    url: 'http://localhost:8888/lab',
    timeout: 120 * 1000,
    reuseExistingServer: !process.env.CI
  }
};
