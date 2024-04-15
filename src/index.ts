import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

import { ISettingRegistry } from '@jupyterlab/settingregistry';
import { INotebookTracker } from '@jupyterlab/notebook';
import { ICommandPalette } from '@jupyterlab/apputils';

import { create_empinken_commands } from './empinken_commands';

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

    let settings = null;
    if (settingRegistry) {
      settingRegistry
        .load(plugin.id)
        .then(loaded_settings => {
          settings = loaded_settings;
          console.log(
            'jupyterlab_empinken_extension settings loaded:',
            settings.composite
          );
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
