import { expect, test } from '@jupyterlab/galata';

const empinkenFileName = 'empinken_cells_demo.ipynb';

test.use({ autoGoto: true });

test.describe('Empinken Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.filebrowser.openHomeDirectory()
  });

  test('Open test notebook in subdir on the server',
   async ({ page, tmpPath }) => {

    // Get through the JupyterLab startup process
    await page.waitForSelector('#jupyterlab-splash', { state: 'detached' });
    await page.waitForSelector('div[role="main"] >> text=Launcher');

    // Get the test notebook
    const notebook = `content/${empinkenFileName}`;
    await page.notebook.openByPath(notebook);

    const imageName = 'test-notebook.png';
    // Hacky - the getNotebookInPanel is equivalent
    const outputs = page.locator('.jp-NotebookPanel-notebook');
    expect( await outputs.screenshot()).toMatchSnapshot('styles.png');
    // One of the sources of variation in full Lab UI display is memory usage
    // Could we regex replace the text of that to normalise things?
    //page.getByTitle('Current memory usage') 
    expect(await page.screenshot({fullPage: true})).toMatchSnapshot(imageName, {maxDiffPixelRatio:0.01});
    //await page.notebook.runCellByCell();

    // But we still can't get the fully scrolled notebook
    const nbPanel = await page.notebook.getNotebookInPanel(empinkenFileName);
    expect( await nbPanel.screenshot()).toMatchSnapshot('panel_nb.png');

    //const toolbarIndexes = [13, 14, 15, 16];
    //If we're the first of the installed extensions:
    const toolbarIndexes = [11, 12, 13, 14];
    const toolbarItemNames = ['Activity', 'Solution', 'Learner', 'Tutor'];

    for (let i = 0; i < toolbarIndexes.length; i++) {

      const toolbarItem = await page.notebook.getToolbarItemByIndex(toolbarIndexes[i], empinkenFileName);
      await toolbarItem.click();
      expect(await nbPanel.screenshot()).toMatchSnapshot(`panel_nb_${toolbarItemNames[i]}1.png`);
      await toolbarItem.click();
      expect(await nbPanel.screenshot()).toMatchSnapshot(`panel_nb_${toolbarItemNames[i]}2.png`);
    }
  
  });
  
})