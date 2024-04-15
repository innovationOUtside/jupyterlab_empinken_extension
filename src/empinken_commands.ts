import { JupyterFrontEnd } from '@jupyterlab/application';
import { INotebookTracker } from '@jupyterlab/notebook';
import { ICommandPalette } from '@jupyterlab/apputils';
import { Cell } from '@jupyterlab/cells';
import { Scope, apply_on_cells } from 'jupyterlab-celltagsclasses';
import { md_insert, md_remove, md_has } from 'jupyterlab-celltagsclasses';
import { ISettingRegistry } from '@jupyterlab/settingregistry';

const tags = ['a', 's', 'l', 't'];

function getFullTag(prefix: string, tag: string): string {
  return `${prefix}${tag}`;
}

const toggleTag = (cell: Cell, tag: string, prefix: string) => {
  const fullTag = getFullTag(prefix, tag);
  const hasTag = md_has(cell, 'tags', fullTag);
  if (hasTag) {
    // Remove the desired tag (a, s, l, t)
    md_remove(cell, 'tags', fullTag);
  } else {
    // Remove all other related tags (a, s, l, t) if present
    tags.forEach(relatedTag =>
      md_remove(cell, 'tags', getFullTag(prefix, relatedTag))
    );
    // Set the tag
    md_insert(cell, 'tags', fullTag);
  }
  console.log(`Toggled cell tag ${fullTag}`, cell.node);
};

export const create_empinken_commands = (
  app: JupyterFrontEnd,
  notebookTracker: INotebookTracker,
  palette: ICommandPalette,
  settings: ISettingRegistry.ISettings | null
) => {
  const prefix =
    settings && typeof settings.get('tagprefix').composite === 'string'
      ? (settings.get('tagprefix').composite as string)
      : '';

  const add_command = (
    suffix: string,
    label: string,
    scope: Scope,
    keys: string[],
    the_function: (cell: Cell) => void
  ) => {
    const command = `ouseful_empinken:${suffix}`;
    app.commands.addCommand(command, {
      label,
      execute: () => {
        console.log(label);
        apply_on_cells(notebookTracker, scope, the_function);
      }
    });
    palette.addItem({ command, category: 'celltagsclasses' });
    app.commands.addKeyBinding({
      command,
      keys,
      selector: '.jp-Notebook'
    });
  };

  tags.forEach(tag => {
    add_command(`empkn_${tag}`, tag, Scope.Active, [], (cell: Cell) =>
      toggleTag(cell, tag, prefix)
    );
  });
};
