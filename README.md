# jupyterlab-empinken-extension
Coloured JupyterLab / RetroLab notebook cells based on cell tags

Jupyterlite demo: https://innovationoutside.github.io/jupyterlab_empinken_extension/

[![Binder](https://mybinder.org/badge_logo.svg)](https://mybinder.org/v2/gh/innovationOUtside/jupyterlab_empinken_extension/HEAD?labpath=content%2Fdemo.ipynb)

This extension optionally enables four notebook toolbar buttons that can toggle persistent tag state on notebook markdown and code cells.

To install the prebuilt extension from a wheel:

`pip3 install --upgrade jupyterlab-empinken-extension`

To install the wheel from this repo:

`pip3 install --upgrade https://raw.githubusercontent.com/innovationOUtside/jupyterlab_empinken_extension/main/dist/jupyterlab_empinken_extension-0.1.1-py3-none-any.whl`

*You may need to restart the JupyterLab server? [NOT TESTED]*

*I have no idea how to construct the repo so that you could `pip install git+REPO` and it wouldn't go through the build process. TBH, I'm surprised I made it this far...*

The extension detects appropriate tags and adds corresponding classes to the notebook cell HTML DOM, which allows the backgrounds of the styles to be styled:

![image](https://user-images.githubusercontent.com/82988/162999814-f3b78849-5c5b-4399-940c-3a73048b40f6.png)

Extension settings can be accessed from the Settings menu (Advanced Settings) and used to define the parsed tag patterns and the corresponding background colours.

![image](https://user-images.githubusercontent.com/82988/163000240-66b291b9-d2b4-4565-9b01-c9785d6df3a8.png)

The extension also allows the display of each of the toolbar buttons to be individually controlled, as well as whether cells with parsed tags have HTML DOM classes added or not.  


## Related Blog Posts

- [Notes on the JupyterLab Notebook HTML DOM Model, Part 1: Rendered Markdown Cells](https://blog.ouseful.info/2022/04/06/trying-to-make-sense-of-the-jupyterlab-notebook-html-dom-model-part-1-rendered-markdown-cells/)
- [Notes on the JupyterLab Notebook HTML DOM Model, Part 2: Code Cells](https://blog.ouseful.info/2022/04/07/trying-to-make-sense-of-the-jupyterlab-notebook-html-dom-model-part-2-code-cells/)
- [Notes on the JupyterLab Notebook HTML DOM Model, Part 3: Setting Classes Based on Cell Tags From a JupyterLab Extension](https://blog.ouseful.info/2022/04/07/notes-on-the-jupyterlab-notebook-html-dom-model-part-3-setting-classes-based-on-cell-tags-from-jupyterlab-extensions/)
- [Notes on the JupyterLab Notebook HTML DOM Model, Part 4: Styling Custom Classes](https://blog.ouseful.info/2022/04/08/notes-on-the-jupyterlab-notebook-html-dom-model-part-4-styling-custom-classes/)
- [Notes on the JupyterLab Notebook HTML DOM Model, Part 5: Setting DOM Classes and Cell Tags From Notebook Toolbar Buttons](https://blog.ouseful.info/2022/04/08/notes-on-the-jupyterlab-notebook-html-dom-model-part-5-setting-dom-classes-and-cell-tags-from-notebook-toolbar-buttons/)
- [Notes on the JupyterLab Notebook HTML DOM Model, Part 6: Pulling an Extension Together](https://blog.ouseful.info/2022/04/08/notes-on-the-jupyterlab-notebook-html-dom-model-part-6-pulling-an-extension-together/)
- [Notes on the JupyterLab Notebook HTML DOM Model, Part 7: Extension User Settings](https://blog.ouseful.info/2022/04/11/notes-on-the-jupyterlab-notebook-html-dom-model-part-7-extension-user-settings/)
- [Notes on the JupyterLab Notebook HTML DOM Model, Part 8: Setting CSS Variable Values from an Extension](https://blog.ouseful.info/2022/04/11/notes-on-the-jupyterlab-notebook-html-dom-model-part-8-setting-css-variable-values-from-an-extension/)
- [Notes on the JupyterLab Notebook HTML DOM Model, Part 8.5: A Reproducible Development Process](https://blog.ouseful.info/2022/04/12/notes-on-the-jupyterlab-notebook-html-dom-model-part-8-5-a-reproducible-development-process/)
- [Notes on the JupyterLab Notebook HTML DOM Model, Part 9: Building and Distributing a Pre-Built Extension](https://blog.ouseful.info/2022/04/12/notes-on-the-jupyterlab-notebook-html-dom-model-part-9-building-and-distributing-a-pre-built-extension/)
- [Demoing JupyterLab Extensions from an Extension Repo Using Github Pages and JupyterLite](https://blog.ouseful.info/2022/04/14/demoing-jupyterlab-extensions-from-an-extension-repo-using-github-pages-and-jupyerlite/)
