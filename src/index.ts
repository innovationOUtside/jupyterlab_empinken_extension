import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

import { ISettingRegistry } from '@jupyterlab/settingregistry';
import { INotebookTracker } from '@jupyterlab/notebook';
import { ICommandPalette } from '@jupyterlab/apputils';

import { create_empinken_commands, tags } from './empinken_commands';

/**
 * Initialization data for the jupyterlab_empinken_extension extension.
 */
const plugin: JupyterFrontEndPlugin<void> = {
  id: 'jupyterlab_empinken_extension:plugin',
  description:
    'A JupyterLab extension for colouring notebook cell backgrounds.',
  autoStart: true,
  requires: [INotebookTracker, ICommandPalette],
  optional: [ISettingRegistry],
  activate: (
    app: JupyterFrontEnd,
    notebookTracker: INotebookTracker,
    palette: ICommandPalette,
    settingRegistry: ISettingRegistry | null
  ) => {
    console.log(
      'JupyterLab extension jupyterlab_empinken_extension is activated!'
    );

    let settings: ISettingRegistry.ISettings | null = null;
    if (settingRegistry) {
      settingRegistry
        .load(plugin.id)
        .then(loaded_settings => {
          settings = loaded_settings;
          console.log(
            'jupyterlab_empinken_extension settings loaded:',
            settings.composite
          );

          // Handle the background colours
          // The document object seems to be magically available?
          const root = document.documentElement;
          const updateSettings = (): void => {
            if (settings!=null) {
            // The CSS tag type are used in the pre-defined CSS variables (see: base.css) 
            for (let typ of tags) {
              let color = settings.get(`${typ}_color`).composite as string;
              const render = settings.get(`${typ}_render`).composite as boolean;
              if (!render)
                 color = "transparent";
              root.style.setProperty(`--iou-${typ}-bg-color`, color);
            }
          }
          };
          updateSettings();
          // We can auto update the color
          settings.changed.connect(updateSettings);

          create_empinken_commands(app, notebookTracker, palette, settings);
        })
        .catch(reason => {
          console.error(
            'Failed to load settings for jupyterlab_empinken_extension.',
            reason
          );
        });
    } else {
      // If settingRegistry is null, call create_empinken_commands with null settings
      create_empinken_commands(app, notebookTracker, palette, null);
    }
  }
};

export default plugin;
