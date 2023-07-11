import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin,
  LabShell
} from '@jupyterlab/application';

import { ISettingRegistry } from '@jupyterlab/settingregistry';

//import {CellList} from '@jupyterlab/notebook'; //gets list from ISharedNotebook
//import { Cell } from '@jupyterlab/cells';

import { INotebookTracker, NotebookPanel } from '@jupyterlab/notebook';

// Remove items in first list from second list
function removeListMembers(list1: any[], list2: any[]): any[] {
  return list2.filter(item => !list1.includes(item));
}


/**
 * The plugin registration information.
 */

// https://jupyterlab.readthedocs.io/en/stable/api/index.html
// https://jupyterlab.readthedocs.io/en/3.3.x/api/interfaces/notebook.inotebooktracker.html

const empinken_tags_: string[] = ["activity", "learner", "solution", "tutor"];
let empinken_tags = empinken_tags_
const plugin: JupyterFrontEndPlugin<void> = {
  id: 'jupyterlab_empinken_extension:plugin',
  description:
    'A JupyterLab extension adding a button to the Notebook toolbar.',
  requires: [INotebookTracker, ISettingRegistry],
  autoStart: true,
  activate: (app: JupyterFrontEnd, notebookTracker: INotebookTracker, settings: ISettingRegistry | null) => {
    const { commands } = app;
    console.log("Activating empinken")

    let tag_prefix = ''
    /**
     * Load the settings for this extension
     *
     * @param setting Extension settings
     */

    Promise.all([settings.load(plugin.id)])
      .then(([setting]) => {
        // Read the settings
        //loadSetting(setting);

        const root = document.documentElement;
        const updateSettings = (): void => {
          if (setting.get('use_tagprefix').composite as boolean) {
            tag_prefix = setting.get('tagprefix') ? setting.get('tagprefix').composite.toString() : '';
          } else tag_prefix = ''

          empinken_tags = [];
          for (const tag of empinken_tags_) {
            const prefixed_tag = tag_prefix + tag;
            empinken_tags.push(prefixed_tag);
          }
          // Update the document CSS colour settings
          for (let typ of empinken_tags_) {
            const color = setting.get(typ + '_color').composite as string;
            // if a tag rendering is disabled, set the colour as the theme
            if (setting.get(typ + '_render').composite as boolean)
              root.style.setProperty('--iou-' + typ + '-bg-color', color);
            else
              root.style.setProperty('--iou-' + typ + '-bg-color', "var(--jp-cell-editor-background)");
          }
        };
        updateSettings();

        // Listen for your plugin setting changes using Signal
        setting.changed.connect(updateSettings);
        const createEmpinkenCommand = (label: string, type: string) => {
          //this works wrt metadata
          const caption = `Execute empinken ${type} Command`;
          return {
            label,
            caption,
            execute: () => {
              let activeCell = notebookTracker.activeCell;
              //console.log(label, type, caption)
              //console.log(activeCell)
              const nodeclass = 'iou-' + type + "-node";
              if (activeCell !== null) {
                let tagList = activeCell.model.getMetadata("tags") as string[] ?? [];
                //console.log("cell metadata was", tagList, "; checking for", type);
                let tagtype = tag_prefix + type
                if (tagList.includes(tagtype)) {
                  // ...then remove it
                  const index = tagList.indexOf(tagtype, 0);
                  if (index > -1) {
                    tagList.splice(index, 1);
                  }
                  activeCell.model.setMetadata("tags", tagList)
                  // Remove class
                  activeCell.node.classList.remove(nodeclass)
                  // cell.node.classList exists
                } else {
                  // remove other tags
                  tagList = removeListMembers(empinken_tags, tagList)
                  empinken_tags_.forEach((tag: string) => {
                    activeCell.node.classList.remove('iou-' + tag + "-node")
                  })
                  // add required tag
                  tagList.push(tagtype)
                  activeCell.model.setMetadata("tags", tagList)
                  // if we want to render that tag:
                  if (setting.get(type + "_render").composite as boolean)
                    activeCell.node.classList.add(nodeclass)
                }
                //console.log("cell metadata now is", tagList);
              }
            }
          };
        };
        // This attaches a command to a button
        // TO DO: if we want to hide the buttons, we need to manually register
        // them as widgets — or not — rather than add them via the plugin.json file
        empinken_tags_.forEach((tag: string) => {
          if (setting.get(tag + '_button').composite as boolean)
            commands.addCommand('ouseful-empinken:' + tag,
              createEmpinkenCommand(tag.charAt(0).toUpperCase(),
                tag));
        })
      })

    //labshell via https://discourse.jupyter.org/t/jupyterlab-4-iterating-over-all-cells-in-a-notebook/20033/2
    const labShell = app.shell as LabShell;
    labShell.currentChanged.connect(() => {
      const notebook = app.shell.currentWidget as NotebookPanel;
      if (notebook) {
        notebook.revealed.then(() => {
          notebook.content.widgets?.forEach(cell => {
            const tagList = cell.model.getMetadata('tags') ?? [];
            console.log("cell metadata", tagList)
            tagList.forEach((tag: string) => {
              if (empinken_tags.includes(tag)) {
                //console.log("hit", tag)
                const tag_ = tag.replace(new RegExp(tag_prefix, 'g'), '')
                cell.node?.classList.add('iou-' + tag_ + '-node');
              }
            })
          })
        })
      }
    });
  }
};

/**
 * Export the plugin as default.
 */
export default plugin;
