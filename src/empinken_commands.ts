/********* JUPYTERLAB_EMPINKEN _EXTENSION *********

The `jupyterlab_empinken_extension` provides a range of tools
for manipulating the displayed background colour of notebook code cells.

The name derives from an original classic notebook extension that was used to
add a pink background colour to appropriately tagged cells as a way for academic tutors
to highlight notebook cells in which they were providing feedback comments back to students.

The extension works as follows:

- cell metadata tags are used to label cells that should be recoloured.
- the jupyterlab-celltagsclasses extension (installed as a dependency)
  maps cell metadata tags onto CSS classes (using the form: cell-tag-TAG) 
  on the HTML cell view;
- CSS style rules are used to set the background cell colour on 
  appropriately classed cell elements.

Whilst metadata tags may be manually applied to cells via the JupyterLab UI,
toolbar buttons are also supported to allow tags to be applied to the active
cell or multiple selected cells.

Tags may be applied to all notebook cell types (markdown cell, code cell, etc.).

Clicking the notebook button toggles the metadata tag for the 
corresponding empinken cell type.

Using the notebook button to add a tag also ensures that at most ONE of the 
supported empinken tags is added to a cell at any one time.

User settings (defined in ../scheme/plugin.json) determine:

- which empinken buttons are displayed on the notebook toolbar;
- what background colour is applied to an empinken tagged cell;
- whether the background colour should be applied for each empinken cell type;
- what empinken tag prefix (if any) should be applied to
  empinken cell types (defaults to `style-`)

*/

import { JupyterFrontEnd } from '@jupyterlab/application';
import { INotebookTracker } from '@jupyterlab/notebook';
import { ICommandPalette } from '@jupyterlab/apputils';
import { Cell } from '@jupyterlab/cells';
import { ISettingRegistry } from '@jupyterlab/settingregistry';

// The jupyterlab-celltagsclasses extension provides a range of utility functions
// for working with notebook cells, including:
// - metadata handling on a cell's logical model
import { md_insert, md_remove, md_has } from 'jupyterlab-celltagsclasses';
// - working with cells' in the rendered JupyterLab UI view
import { Scope, apply_on_cells } from 'jupyterlab-celltagsclasses';

// Define a collection of empinken cell types.
export const typs: string[] = ['activity', 'solution', 'learner', 'tutor'];

// Metadata tags used by the extension are generated as a combination of a
// settings provided prefix and the empinken cell type.
function getFullTag(prefix: string, tag: string): string {
  return `${prefix}${tag}`;
}

// When a button is clicked, toggle the corresponding
// empinken tag on the appropriate cell(s).
// Also ensure that AT MOST ONE empinken tag is applied
// to any particular cell.
const toggleTag = (
  cell: Cell,
  typ: string,
  prefix: string,
  settings: ISettingRegistry.ISettings | null
) => {
  // This is made unnecessarily complicated because we provide
  // a level of indirection between the empinken cell type and the associated tag.
  // This means we need to generate the tag list from the settings,
  // rather than derive them directly from the empinken cell types.
  // This is also going to be brittle when it comes to the CSS, because
  // the cell classes are derived directly from the cell tag using the
  // jupyterlab-celltagsclasses extension.
  const tags = typs.map(
    t => (settings?.get(`${t}_tag`).composite as string) || t
  );

  // The full tag is the prefix and the partial tag as specified in the settings
  const tag = (settings?.get(`${typ}_tag`).composite as string) || typ;
  const fullTag = getFullTag(prefix, tag);
  // Metadata path to the tags
  const tags_path = 'tags';
  // Does that tag exist in the cell metadata?
  const hasTag = md_has(cell, tags_path, fullTag);
  if (hasTag) {
    // Remove the desired tag
    md_remove(cell, tags_path, fullTag);
  } else {
    // We only allow one empinken tag per cell,
    // so remove all empinken tags if any are present
    tags.forEach(typ => md_remove(cell, tags_path, getFullTag(prefix, typ)));
    // Set the tag
    md_insert(cell, tags_path, fullTag);
  }
  console.log(`Toggled cell tag ${fullTag}`, cell.node);
};

// If the user settings for the extension are updated,
// act on the updates if we can.
// In particular:
// - update cell background colours
// - ignore cell colours if the render setting
//   for an empinken cell type is not true.
export function update_empinken_settings(
  settings: ISettingRegistry.ISettings,
  root: HTMLElement
) {
  // Cells are coloured according to CSS variables
  // used in CSS rules applied to appropriately classed cells.
  // The CSS rules are defined in ../style/base.css.
  // The jupyterlab-celltagsclasses extensions creates a class of the form cell-tag-TAG
  // for a cell tag TAG. The class is removed if the TAG is removed.
  for (const typ of typs) {
    // Get the background colour for an empinken type from user-settings.
    let color = settings.get(`${typ}_color`).composite as string;
    // Get the background render flag for an empinken type from user-settings.
    const render = settings.get(`${typ}_render`).composite as boolean;
    // if we don't want to render the background colour, make it transparent
    if (!render) {
      color = 'transparent';
    }
    // Set the CSS variable for the empinken cell type
    root.style.setProperty(`--iou-${typ}-bg-color`, color);
  }
}

// When the extension is loaded, create a set of empinken commands,
// and register notebook toolbar buttons as required.
export const create_empinken_commands = (
  app: JupyterFrontEnd,
  notebookTracker: INotebookTracker,
  palette: ICommandPalette,
  settings: ISettingRegistry.ISettings | null
) => {
  // A settings defined prefix is available that may be added
  // to each empinken cell type when setting the metadata tag.
  const prefix =
    settings && typeof settings.get('tagprefix').composite === 'string'
      ? (settings.get('tagprefix').composite as string)
      : '';

  // Add commands and command buttons.
  // These can be controlled from the extension settings.
  // Currently, JupyterLab needs to be reloaded in a browser tab / window
  // for the button display regime to be updated.
  const add_command = (
    suffix: string,
    typ: string,
    label: string,
    scope: Scope, // Which cells are tags applied to
    keys: string[], // Keyboard shortcut combinations
    settings: ISettingRegistry.ISettings | null,
    the_function: (cell: Cell) => void
  ) => {
    // By default (in the absence of settings),
    // we will try to display the buttons
    let display_button = true;
    // If there are settings, respect them:
    if (settings !== null) {
      display_button = settings.get(`${typ}_button`).composite as boolean;
    }
    // Register the button as required
    if (display_button) {
      // Register a command in a de facto `ouseful_empinken` command namespace
      const command = `ouseful_empinken:${suffix}`;
      // Add the command...
      app.commands.addCommand(command, {
        label,
        execute: () => {
          console.log(label);
          // ... to the desired cell(s)
          apply_on_cells(notebookTracker, scope, the_function);
        }
      });
      // Register the toolbar buttons
      palette.addItem({ command, category: 'empinken_buttons' });
      // Register keyboard shortcut bindings
      app.commands.addKeyBinding({
        command,
        keys,
        selector: '.jp-Notebook'
      });
    }
  };

  // For each empinken cell type, add an appropriate command.
  typs.forEach(typ => {
    // Use a simple label text label for the button
    // Really this should be a vector image?
    const label = typ[0].toUpperCase();
    console.log(`typ ${typ} has tag ${typ} ok? `);
    // Add the command and also register and display buttons if required
    add_command(
      `empkn_${typ}`, // The command name suffix
      typ, // The empinken cell type
      label, // The button label
      Scope.Multiple, // Cell scope: Active, Multiple (all selected), All
      [], // Keyboard shortcuts
      settings, // User preference settings
      (cell: Cell) => toggleTag(cell, typ, prefix, settings) // The command function
    );
  });
};
