import { JupyterFrontEnd } from '@jupyterlab/application'
import { INotebookTracker } from '@jupyterlab/notebook'
import { ICommandPalette } from '@jupyterlab/apputils'
import { Cell } from '@jupyterlab/cells'
import { Scope, apply_on_cells } from 'jupyterlab-celltagsclasses'
import { md_insert, md_remove, md_has, md_toggle } from 'jupyterlab-celltagsclasses'
import { ISettingRegistry } from '@jupyterlab/settingregistry';

const tags = ["a", "s", "l", "t"];

const toggleTag = (cell: Cell, tag: string) => {
  const hasTag = md_has(cell, "tags", `test-${tag}`);
  if (hasTag) {
    // Remove the desired tag (a, s, l, t)
    md_remove(cell, "tags", `test-${tag}`);
  } else {
    // Remove all other related tags (a, s, l, t) if present
    tags.forEach((relatedTag) => md_remove(cell, "tags", `test-${relatedTag}`));
    // Set the tag
    md_insert(cell, "tags", `test-${tag}`);
  }
  console.log(`Toggled cell tag test-${tag}`, cell.node);
};

const cell_meta = (cell: Cell) => {
  console.log('set cell tag', cell.node)
  md_insert(cell, "tags", "test-tag")
  //const model = cell.model
  //const source = cell.model.sharedModel.getSource()
  //model.sharedModel.setSource(source.toUpperCase())
}

const cell_toggle = (cell: Cell) => {
  console.log('toggle cell tag', cell.node)
  md_toggle(cell, "tags", "test-tag")
  //const model = cell.model
  //const source = cell.model.sharedModel.getSource()
  //model.sharedModel.setSource(source.toUpperCase())
}


const cell_toggle_a = (cell: Cell) => {
  toggleTag(cell, "a");
};

const cell_toggle_s = (cell: Cell) => {
  toggleTag(cell, "s");
};

const cell_toggle_l = (cell: Cell) => {
  toggleTag(cell, "l");
};

const cell_toggle_t = (cell: Cell) => {
  toggleTag(cell, "t");
};

export const create_test_commands = (
  app: JupyterFrontEnd,
  notebookTracker: INotebookTracker,
  palette: ICommandPalette,
  settings: ISettingRegistry | null
) => {
  const add_command = (
    suffix: string,
    label: string,
    scope: Scope,
    keys: string[],
    the_function: (cell: Cell) => void,
    ) => {
    const command = `ouseful_empinken:${suffix}`
    app.commands.addCommand(command, {
      label,
      execute: () => {
        console.log(label)
        apply_on_cells(notebookTracker, scope, the_function)
      },
    })
    palette.addItem({ command, category: 'celltagsclasses' })
    app.commands.addKeyBinding({
      command,
      keys,
      selector: '.jp-Notebook',
    })
  }
  
  add_command(
    'testmeta',
    'testmeta thing X',
    Scope.Active,
    [],
    cell_meta,
  )
    add_command(
    'empkn_toggle',
    'tags toggle thing',
    Scope.Active,
    [],
    cell_toggle,
  )

      add_command(
    'empkn_a',
    'a',
    Scope.Active,
    [],
    cell_toggle_a,
  )

      add_command(
    'empkn_l',
    'l',
    Scope.Active,
    [],
    cell_toggle_l,
  )

      add_command(
    'empkn_s',
    's',
    Scope.Active,
    [],
    cell_toggle_s,
  )

    add_command(
    'empkn_t',
    't',
    Scope.Active,
    [],
    cell_toggle_t,
  )

}