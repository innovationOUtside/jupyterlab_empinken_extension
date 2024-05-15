/*
Test that tagged cells are rendered and that buttons work
to toggle coloured backgrounds.
*/

import { expect, galata, test } from '@jupyterlab/galata';
import { Locator } from '@playwright/test';
import * as path from 'path';

import type { NotebookPanel } from '@jupyterlab/notebook';

test.use({
  autoGoto: true,

  // Ensure that desired and known settings are tested against
  mockSettings: {
    ...galata.DEFAULT_SETTINGS,
    'jupyterlab_empinken_extension:plugin': {
      tagprefix: 'style-',
      activity_render: true,
      solution_render: true,
      learner_render: true,
      tutor_render: true,
      activity_color: 'lightblue',
      solution_color: 'lightgreen',
      learner_color: 'lightyellow',
      tutor_color: 'lightpink',
      activity_tag: 'activity',
      solution_tag: 'solution',
      learner_tag: 'student',
      tutor_tag: 'commentate',
      activity_button: true,
      solution_button: true,
      learner_button: true,
      tutor_button: true
    }
  }
});

test.describe('Empinken Tests', () => {
  test.beforeEach(async ({ page }) => {
    // May be useful if we are running the server in specified directory
    // and want to load in files from it?
    //await page.filebrowser.openHomeDirectory()
  });

  test('Open test notebook in subdir on the server', async ({
    page,
    tmpPath
  }) => {
    /**
     * Via: https://github.com/jupyterlab/jupyterlab/blob/main/galata/test/jupyterlab/notebook-mermaid-diagrams.test.ts#L16
     * Workaround for playwright not handling screenshots
     * for elements larger than viewport, derived from:
     * https://github.com/microsoft/playwright/issues/13486#issuecomment-1112012053
     */
    async function resizePageAndScreenshot(locator: Locator) {
      const page = locator.page();
      const box = await locator.boundingBox();
      const originalSize = page.viewportSize();
      if (box.width > originalSize.width || box.height > originalSize.height) {
        const scaleFactor = Math.max(
          originalSize.width / box.width,
          originalSize.height / box.height
        );
        await page.setViewportSize({
          width: Math.ceil(box.width * scaleFactor),
          height: Math.ceil(box.height * scaleFactor)
        });
      }
      const screenshot = await locator.screenshot();
      await page.setViewportSize(originalSize);
      return screenshot;
    }

    // Get the test notebook
    const notebookName = 'empinken_simple_md.ipynb';

    await page.contents.uploadFile(
      path.resolve(__dirname, `notebooks/${notebookName}`),
      `${tmpPath}/${notebookName}`
    );
    await page.notebook.openByPath(`${tmpPath}/${notebookName}`);
    // As well as domcontentloaded, we could wait for `networkidle`
    // which is 500ms after the network activity ceases.
    await page.notebook.page.waitForLoadState('domcontentloaded');
    // Wait for kernel to have settled down
    // This is actually a wait for cells to stop running, but
    // presumably also captures that a kernel should have beem
    // ready to run a cell.
    await page.notebook.waitForRun();
    // Capture the notebook "content" area
    const output = page.locator('.jp-NotebookPanel-notebook');

    await output.waitFor();
    // If we need extra time to wait for notebook to render
    //await page.waitForTimeout(100);
    expect(await resizePageAndScreenshot(output)).toMatchSnapshot(
      'test-notebook.png',
      { maxDiffPixelRatio: 0.01 }
    );
  });

  test('Toggle buttons on new notebook', async ({ page, tmpPath }) => {
    await page.notebook.createNew('new_nb.ipynb');

    await page.notebook.addCell('markdown', 'Some markdown');
    // Capture the notebook "content" area
    const output = page.locator('.jp-NotebookPanel-notebook');
    expect(await output.screenshot()).toMatchSnapshot('panel_nb1.png');

    // Open cell tags panel
    await page.getByRole('tab', { name: 'Property Inspector' }).click();
    await page.getByText('Common Tools').click();
    // Close file browser panel
    await page.getByRole('tab', { name: 'File Browser (⇧ ⌘ F)' }).click();

    let tags_output = page.locator('.jp-CellTags');

    expect(await tags_output.screenshot()).toMatchSnapshot(`tags_nb.png`);

    // Toggle each of the empinken cell states
    const toolbarItemNames = ['A', 'L', 'S', 'T'];

    for (let item of toolbarItemNames) {
      // Click to style
      // This requires the toolbar button to be visible
      // which is why we previously close the file sidebar to make room
      await page
        .getByLabel('notebook actions')
        .getByText(item, { exact: true })
        .click();

      expect(await output.screenshot()).toMatchSnapshot(
        `panel_nb_${item}1.png`
      );
      tags_output = page.locator('.jp-CellTags');
      expect(await tags_output.screenshot()).toMatchSnapshot(
        `tags_nb_${item}1.png`
      );
      // Click to unstyle
      await page
        .getByLabel('notebook actions')
        .getByText(item, { exact: true })
        .click();
      expect(await output.screenshot()).toMatchSnapshot(
        'panel_nb2.png' //`panel_nb_${item}2.png`
      );
      expect(await tags_output.screenshot()).toMatchSnapshot(`tags_nb.png`);
    }

    for (let item of toolbarItemNames) {
      await page
        .getByLabel('notebook actions')
        .getByText(item, { exact: true })
        .click();
      expect(await output.screenshot()).toMatchSnapshot(
        `panel_nb_${item}3.png`
      );
    }
  });

  test('Notebook toolbar', async ({ page, tmpPath }) => {
    await page.notebook.createNew('new_nb.ipynb');
    const toolbar = page.locator('.jp-NotebookPanel-toolbar');
    expect(await toolbar.screenshot()).toMatchSnapshot(`nb_toolbar.png`);
  });
});
