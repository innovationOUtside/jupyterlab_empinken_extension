# Integration Testing

*Based on https://github.com/jupyterlab/jupyterlab_apod/tree/3.5/ui-tests*

This folder contains the integration tests of the extension.

They are defined using [Playwright](https://playwright.dev/docs/intro) test runner
and [Galata](https://github.com/jupyterlab/jupyterlab/tree/master/galata) helper.

The Playwright configuration is defined in [playwright.config.js](./playwright.config.js).

The JupyterLab server configuration to use for the integration test is defined
in [jupyter_server_test_config.py](./jupyter_server_test_config.py).

*To run the JupyterLab server on a different port number, run eg `export TARGET_URL=http://127.0.0.1:8977` and then set `url: 'http://localhost:8977/lab',` in `playwright.config.js`*

The default configuration will produce video for failing tests and an HTML report.

Playwrite test scripts can be genratd from intractive recordings:

```sh
cd ./ui-tests
jlpm playwright codegen localhost:8888
```

## Run the tests

1. Check the extension is installed in JupyterLab.

2. Install test dependencies (needed only once):

```sh
cd ./ui-tests
jlpm install
jlpm playwright install
cd ..
```

3. Ensure gold standard screenshots are available. These can be updated by running:

`jlpm playwright test --update-snapshots`

> Some discrepancy may occurs between the snapshots generated on your computer and
> the one generated on the CI. To ease updating the snapshots on a PR, you can
> type `please update playwright snapshots` to trigger the update by a bot on the CI.
> Once the bot has computed new snapshots, it will commit them to the PR branch.
> (See `.github/workflows/update-intgration-tests.yml`)

4. Execute the [Playwright](https://playwright.dev/docs/intro) tests:

```sh
cd ./ui-tests
jlpm playwright test
```

Test results will be shown in the terminal. In case of any test failures, the test report will be opened in your browser at the end of the tests execution; see
[Playwright documentation](https://playwright.dev/docs/test-reporters#html-reporter)
for configuring that behaviour.
