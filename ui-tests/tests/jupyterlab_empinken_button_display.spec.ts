import { expect, galata, test } from '@jupyterlab/galata';

test.describe('Empinken Tests', () => {
  test.use({
    autoGoto: true,

    // Ensure that desired and known settings are tested against
    mockSettings: {
      ...galata.DEFAULT_SETTINGS,
      'jupyterlab_empinken_extension:plugin': {
        activity_button: true,
        solution_button: false,
        learner_button: false,
        tutor_button: true
      }
    }
  });

  test('Empinken toolbar button display', async ({ page, tmpPath }) => {
    await page.notebook.createNew('new_nb.ipynb');

    // Wait for kernel to be ready
    // This is more strictly a wait for cells to complete running, 
    // but can we assume it's also looking for a ready kernel?
    await page.notebook.waitForRun();
    
    // The link icon for the Notebook may or may not display in time
    // which can break this test; wait extra if required,
    // or set an explicit wait on the notebook element?
    await page.waitForTimeout(500);

    const toolbar = page.locator('.jp-NotebookPanel-toolbar');

    expect(await toolbar.screenshot()).toMatchSnapshot(
      `nb_partial_toolbar.png`
    );
  });
});
