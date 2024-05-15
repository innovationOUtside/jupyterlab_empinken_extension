import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

import { ISettingRegistry } from '@jupyterlab/settingregistry';
import { INotebookTracker } from '@jupyterlab/notebook';
import { ICommandPalette } from '@jupyterlab/apputils';

import {
  update_empinken_settings,
  create_empinken_commands
} from './empinken_commands';

/**
 * Initialisation data for the jupyterlab_empinken_extension extension.
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

    // User-settings for the extension are defined in ../schema/plugin.json .properties
    if (settingRegistry) {
      settingRegistry
        .load(plugin.id)
        .then(loaded_settings => {
          console.log(
            'jupyterlab_empinken_extension settings loaded:',
            loaded_settings.composite
          );

          // Handle the background colours
          // The document object is always available.
          const root = document.documentElement;
          const updateSettings = (): void => {
            console.log('jupyterlab_empinken_extension settings updated');
            update_empinken_settings(loaded_settings, root);
          };
          updateSettings();
          // Update settings if the settings are changed
          // In the case of empinken, the following will happen
          // immediately the settings are saved (click in the settings canvas to trigger the update):
          // - [Y] update the CSS variables with new colour settings.
          // - [Y] enable/disable display of background colour for each empinken type.
          // - [N] enable/disable button display (requires refresh of browser window).
          loaded_settings.changed.connect(updateSettings);
          // Create empinken commands and add appropriate notebook buttons.
          create_empinken_commands(
            app,
            notebookTracker,
            palette,
            loaded_settings
          );
        })
        .catch(reason => {
          console.error(
            'Failed to load settings for jupyterlab_empinken_extension.',
            reason
          );
          // Create empinken commands.
          // The lack of settings means buttons will not be displayed.
          // No CSS variables will have been set via the extension,
          // but they may have been defined via a custom CSS file.
          create_empinken_commands(app, notebookTracker, palette, null);
        });
    } else {
      // Create empinken commands.
      // The lack of settings means buttons will not be displayed.
      // No CSS variables will have been set via the extension,
      // but they may have been defined via a custom CSS file
      create_empinken_commands(app, notebookTracker, palette, null);
    }
  }
};

export default plugin;
