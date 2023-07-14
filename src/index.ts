import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin,
  LabShell
} from '@jupyterlab/application';

import { ToolbarButton } from "@jupyterlab/apputils";
import { DocumentRegistry } from "@jupyterlab/docregistry";
import { IDisposable, DisposableDelegate } from '@lumino/disposable';
import { ISettingRegistry } from '@jupyterlab/settingregistry';

//import {CellList} from '@jupyterlab/notebook'; //gets list from ISharedNotebook
//import { Cell } from '@jupyterlab/cells';

import { INotebookTracker, NotebookPanel, INotebookModel } from '@jupyterlab/notebook';

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
let empinken_tags2 = empinken_tags_
var tag2abstractTag = new Map<string, string>();

export class ButtonExtension implements DocumentRegistry.IWidgetExtension<NotebookPanel, INotebookModel> {
  settings: ISettingRegistry.ISettings;

  constructor(protected settingRegistry: ISettingRegistry) {
    console.log('constructor');
    // read the settings
    this.setup_settings();
  }

  setup_settings(): void {
    Promise.all([this.settingRegistry.load(plugin.id)])
      .then(([settings]) => {
        console.log('reading settings');
        this.settings = settings;
        // update of settings is done automatically
        //settings.changed.connect(() => {
        //  this.update_settings(settings);
        //});
      })
      .catch((reason: Error) => {
        console.error(reason.message);
      });
  }

  createNew(panel: NotebookPanel, context: DocumentRegistry.IContext<INotebookModel>): IDisposable {
    // Create the toolbar buttons
    const tagButtonSpec: {
      [key: string]: {
        typ: string, label: string,
        button: ToolbarButton,
        enabled: boolean,
        newtag: string,
      }
    } = {};

    let tag_prefix = ''
    if (this.settings.get('use_tagprefix').composite as boolean) {
      tag_prefix = this.settings.get('tagprefix') ? this.settings.get('tagprefix').composite.toString() : '';
    } else tag_prefix = ''

    const click_button = (typ: string) => {
      console.log('button pressed', typ)
      console.log("empinken_tags", empinken_tags)
      console.log("empinken_tags2", empinken_tags2)
      
      let activeCell = panel.content.activeCell;
      //console.log(label, type, caption)
      //console.log(activeCell)
      const nodeclass = 'iou-' + typ + "-node";
      const newtag = this.settings.get(typ + "_tag").composite as string;
      if (activeCell !== null) {
        let tagList = activeCell.model.getMetadata("tags") as string[] ?? [];
        //console.log("cell metadata was", tagList, "; checking for", type);
        let tagtype = tag_prefix + newtag;
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
          tagList = removeListMembers(empinken_tags2, tagList)
          empinken_tags_.forEach((tag: string) => {
            activeCell.node.classList.remove('iou-' + tag + "-node")
          })
          // add required tag
          tagList.push(tagtype)
          activeCell.model.setMetadata("tags", tagList)
          // if we want to render that tag:
          if (this.settings.get(typ + "_render").composite as boolean)
            activeCell.node.classList.add(nodeclass)
        }
        //console.log("cell metadata now is", tagList);
      }
    }

    let location = 10;
    //panel.content.activeCell
    empinken_tags_.forEach((tag) => {
      const tlabel = tag.charAt(0).toUpperCase()
      const newtag = this.settings.get(tag + '_tag').composite as string;
      tagButtonSpec[tag] = {
        'typ': tag,
        'label': tlabel,
        'newtag': newtag,
        'button': new ToolbarButton({
          className: 'tagger-' + tag + '-button',
          label: tlabel,
          // TO DO : currently missing data-command="ouseful-empinken:TAG" attribute
          // in JL HTML on button
          onClick: () => click_button(tag),//createEmpinkenCommand(tlabel, tag), //'ouseful-empinken:' + tag,
          tooltip: 'Toggle ' + tag + ' metadata tag on a cell',
        }),
        'enabled': this.settings.get(tag + '_button').composite as boolean
      };
      // Add the button to the toolbar
      if (tagButtonSpec[tag]['enabled']) {
        panel.toolbar.insertItem(location, 'toggle_' + tag + 'TagButtonAction', tagButtonSpec[tag]['button']);
        location++;
      }

    });

    return new DisposableDelegate(() => {
      // Tidy up with destructors for each button
      let typ: keyof typeof tagButtonSpec;
      for (typ in tagButtonSpec) {
        if (tagButtonSpec[typ]['enabled'])
          tagButtonSpec[typ]['button'].dispose();
      }
    });

  }
}


const plugin: JupyterFrontEndPlugin<void> = {
  id: 'jupyterlab_empinken_extension:plugin',
  description:
    'A JupyterLab extension adding a button to the Notebook toolbar.',
  requires: [INotebookTracker, ISettingRegistry],
  autoStart: true,
  activate: (app: JupyterFrontEnd, notebookTracker: INotebookTracker, settings: ISettingRegistry | null) => {
    //const { commands } = app;
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
        // TO DO  - update settings needs to be outside the promise?
        // Somehow we need to have ensured we have ipdated settings before
        // we iterate the notebook
        const updateSettings = (): void => {
          if (setting.get('use_tagprefix').composite as boolean) {
            tag_prefix = setting.get('tagprefix') ? setting.get('tagprefix').composite.toString() : '';
          } else tag_prefix = ''

          empinken_tags = [];
          empinken_tags2 = []; //as per settings
          for (const tag of empinken_tags_) {
            const prefixed_tag = tag_prefix +tag;
            const prefixed_tag2 = tag_prefix + setting.get(tag + "_tag").composite as string;
            empinken_tags.push(prefixed_tag);
            empinken_tags2.push(prefixed_tag2);
            tag2abstractTag.set(prefixed_tag2, tag);
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

        // This attaches a command to a button
        // TO DO: if we want to hide the buttons, we need to manually register
        // them as widgets — or not — rather than add them via the plugin.json file
        // empinken_tags_.forEach((tag: string) => {
        //   if (setting.get(tag + '_button').composite as boolean)
        //     commands.addCommand('ouseful-empinken:' + tag,
        //       createEmpinkenCommand(tag.charAt(0).toUpperCase(),
        //         tag));
        // })
      })

    //labshell via https://discourse.jupyter.org/t/jupyterlab-4-iterating-over-all-cells-in-a-notebook/20033/2
    const labShell = app.shell as LabShell;
    labShell.currentChanged.connect(() => {
      const notebook = app.shell.currentWidget as NotebookPanel;
      if (notebook) {
        notebook.revealed.then(() => {
          console.log("nb empinken_tags", empinken_tags )
          console.log("nb empinken_tags2", empinken_tags2)
          notebook.content.widgets?.forEach(cell => {
            const tagList = cell.model?.getMetadata('tags') ?? [];
            console.log("cell metadata", tagList)
            tagList.forEach((tag: string) => {
              if (empinken_tags2.includes(tag)) {
                let abstract_tag = tag2abstractTag.has(tag) ? tag2abstractTag.get(tag) : tag;
                // Decode the tag_
                const tag_ = abstract_tag.replace(new RegExp(tag_prefix, 'g'), '')
                console.log("hit", tag, "abstract", abstract_tag, "add class", 'iou-' + tag_ + '-node' )
                cell.node?.classList.add('iou-' + tag_ + '-node');
              } else console.log("miss", tag)
            })
          })
        })
      }
    });
    app.docRegistry.addWidgetExtension('Notebook', new ButtonExtension(settings));
  }
};

/**
 * Export the plugin as default.
 */
export default plugin;
