# jupyterlab-empinken-extension
Coloured JupyterLab / RetroLab notebook cells based on cell tags

This extension optionally enables frour notebook toolbar buttons that can toggle persistent tag state on notebook markdown and code cells.

The extension detects appropriate tags and adds corresponding classes to the notebook cell HTML DOM, which allows the backgrounds of the styles to be styled:

![image](https://user-images.githubusercontent.com/82988/162999814-f3b78849-5c5b-4399-940c-3a73048b40f6.png)

Extension settings can be accessed from the Settings menu (Advanced Settings) and used to define the parsed tag patterns and the corresponding background colours.

![image](https://user-images.githubusercontent.com/82988/163000240-66b291b9-d2b4-4565-9b01-c9785d6df3a8.png)

The extension also allows the display of each of the toolbar buttons to be individually controlled, as well as whether cells with parsed tags have HTML DOM classes added or not.  
