// This script is nominally Typescript but it reads
// more like a hacky Pyhton flavoured Javascript...

// It might deliver the desired functionality
// but it leaves a lot to be desired in terms
// of code quality...

import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

import { ISettingRegistry } from '@jupyterlab/settingregistry';

// START: TH added:
import { IDisposable, DisposableDelegate } from '@lumino/disposable';

import { ToolbarButton } from '@jupyterlab/apputils';
import { DocumentRegistry } from '@jupyterlab/docregistry';

import {
  //NotebookActions,
  NotebookPanel,
  INotebookModel,
} from '@jupyterlab/notebook';
// END: TH added

/**
 * Initialization data for the jupyterlab_empinken_extension extension.
 */
const plugin: JupyterFrontEndPlugin<void> = {
  activate,
  id: 'jupyterlab_empinken_extension:plugin',
  autoStart: true,
  optional: [ISettingRegistry]
};

export class ButtonExtension
  implements DocumentRegistry.IWidgetExtension<NotebookPanel, INotebookModel>
{
  //----  
  // Settings crib via:
  // https://github.com/ocordes/jupyterlab_notebookbuttons/blob/main/src/index.ts

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
  //----

  /**
   * Create a new extension for the notebook panel widget.
   *
   * @param panel Notebook panel
   * @param context Notebook context
   * @returns Disposable on the added button
   */
  createNew(
    panel: NotebookPanel,
    //context: DocumentRegistry.IContext<INotebookModel>
  ): IDisposable {
    //const notebook = panel.content;
    
    // Read settings (via crib)
    // Set prefix for inspected tag2class tags
    // const tag_prefix = 'iou-';
    // Pick this up from settings:
    // If it's null, set it to an empty string
    const tag_prefix = this.settings.get('tagprefix') ? this.settings.get('tagprefix').composite.toString() : '';

    // If we specify the buttons we want in an array
    // we can then construct them all via the same function
    
    // Create an array to hold button definitions
    // THIS IS NOT REALLY APPROPRIATE IN TYPESCRIPT
    // A map is probably not appropriate either
    // (that's more for string:string mappings)
    // A Record is perhaps more in order?
    // https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type
    var tagButtonSpec = new Array();
    
    tagButtonSpec['activity'] = {'typ': 'activity', 'label': 'A', 'location': 10 };
    tagButtonSpec['solution'] = {'typ': 'solution', 'label': 'S', 'location': 11 }; 
    tagButtonSpec['learner'] = {'typ': 'learner', 'label': 'L', 'location': 12 };
    tagButtonSpec['tutor'] = {'typ': 'tutor', 'label': 'T', 'location': 13 };
  
    // The next batch of settings decide whether to display each button
    // and render each background
    let typ: keyof typeof tagButtonSpec;
    for (typ in tagButtonSpec) {
      const typ_ : string = typ.toString();
      tagButtonSpec[typ_]['enabled'] = this.settings.get(typ_ +'_button').composite;
      tagButtonSpec[typ_]['render'] = this.settings.get(typ_ +'_render').composite;
      tagButtonSpec[typ_]['tag'] = this.settings.get(typ_ +'_tag').composite.toString();
    }
    
    const toggleTagButtonAction = (typ) => {
        // The button will toggle a specific metadata tag on a cell 
        const notebook = panel.content;
         
        // Get a single selected cell
        const activeCell = notebook.activeCell;
         
        // Get the tags; these are defined on the more general model.metadata
        // Note that we could also set persistent state on model.metadata if required
        // We need to check tags are available...

        console.log("in and metadata is "+activeCell.model.metadata)
        let tagList = activeCell.model.metadata.get('tags') as string[];
        if (!tagList) {
          console.log("setting metadata..")
            activeCell.model.metadata.set('tags', new Array())
            tagList = activeCell.model.metadata.get('tags') as string[];
            console.log(" metadata is now "+activeCell.model.metadata)
        }
        console.log("continuing with metadata  "+activeCell.model.metadata)
         
        // What tags are defined on the cell to start with
        console.log("Cell tags at start are: " + tagList);

        /*
        // What's the markdown content?
        if (activeCell.model.type=="markdown") {
          // This gives us the raw markdown,
          // but we can't get the rendered markdown...
          console.log("md- "+activeCell.model.value.text)
          console.log("test-string- "+JSON.stringify(activeCell.model.toJSON()))
          // Nor is it obvious how to modify the raw markdown then render it.
        }
        */

        // To simply add a tag to a cell on a button click,
        // we can .push() (i.e. append) the tag to the tag list
        // optionally checking first that it's not already there...
        //if !(tagList.includes("TESTTAG"))
        //    tagList.push("TESTTAG")

        /*
        We can also toggle tags...

        Note that this works at the data level but is not reflected
        with live updates in the cell property inspector if it is displayed.
         
        However, if you click to another cell, then click back, the 
        property inspector will now display the updated state.
        */
         
        // Set the tag name
        const mappedtagname = tag_prefix + tagButtonSpec[typ]['tag'];
        // Use the abstract class name and the structure defined in the CSS file
        const tagname = 'iou-' + typ.toString();
        // If the tag exists...
        // Should we also take the opportunity to add
        // corresponding class tags here?
        if (tagList.includes(mappedtagname)) {
            console.log("I see "+mappedtagname)
 
            // ...then remove it
            const index = tagList.indexOf(mappedtagname, 0);
            if (index > -1) {
               tagList.splice(index, 1);
            }
             
            // Remove class
            activeCell.node.classList.remove(tagname + "-node")
        }
        // ...else add it
        else {
            console.log("I don't see " + mappedtagname)
            tagList.push(mappedtagname)
             
            // Add class
            activeCell.node.classList.add(tagname + "-node")
        }
         
        // What tags are now set on the cell?
        console.log("Cell tags are now: " + tagList);
         
    };

    
    // Add a button for each element in the array

    for (typ in tagButtonSpec) {
      // We can't have these things wandering
      const typ_ = typ.toString();
        if (!tagButtonSpec[typ_]['enabled'])
            continue;
        // Create the button
        tagButtonSpec[typ_]['button'] = new ToolbarButton({
            className: 'tagger-' + typ_ + '-button',
            label: tagButtonSpec[typ_]['label'],
            onClick: () => toggleTagButtonAction(typ_),
            tooltip: 'Toggle ' + tag_prefix + typ_ + ' metadata tag on a cell',
        })
         
        // Add the button to the toolbar
        panel.toolbar.insertItem(tagButtonSpec[typ_]['location'], 'toggle_' + typ_ + 'TagButtonAction', tagButtonSpec[typ_]['button']);
    }
     
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

/*
The most relevant docs appear to be:
https://jupyterlab.readthedocs.io/en/stable/api/modules/notebook.notebookactions.html
 
*/
export class ClassDemoExtension
  implements DocumentRegistry.IWidgetExtension<NotebookPanel, INotebookModel>
{
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

  /**
   * Create a new extension for the notebook panel widget.
   *
   * @param panel Notebook panel
   * @param context Notebook context
   * @returns Disposable
   */
  createNew(
    panel: NotebookPanel,
    //context: DocumentRegistry.IContext<INotebookModel>
  ): IDisposable {
    const notebook = panel.content;
    
    let tag_types: string[] = ['activity', 'solution', 'learner', 'tutor'];

    // Create a tag prefix
    // (this should be pulled from a setting()
    //const tag_prefix = 'iou-';
    const tag_prefix =  this.settings.get('tagprefix').composite.toString();

    // Create an array to hold button definitions
    var tagButtonSpec = new Array();

    // Also set up a map from settings enabled tag name to abstract tag name
    var tag2abstractTag = new Map<string, string>();

    for (let typ of tag_types) {
      console.log("Setup on "+typ);
      tagButtonSpec[typ] = new Array();
      tagButtonSpec[typ]['render'] = this.settings.get(typ+'_render').composite;
      tagButtonSpec[typ]['tag'] = this.settings.get(typ.toString() +'_tag').composite.toString();
      // Also set up a map
      tag2abstractTag.set(tagButtonSpec[typ]['tag'], typ);
    }
       
    console.log("Tag prefix is " + tag_prefix);
    console.log(tagButtonSpec)
    
    function check_tags(notebook){
        /*
        Iterate through all the cells
        If we see a cell with a tag that starts with class-
        then add a corresponding tag to different elements in the
        notebook HTML DOM
        */

        console.log("Checking to see if there are class tags to set on...")
        for (const cell of notebook.widgets) {
            let tagList = cell.model.metadata.get('tags') as string[];
            // Do we have any tags?
            if (tagList) {
              // Iterate through the tags
              for (let i = 0; i < tagList.length; i++) {
                const tag = tagList[i];
                console.log("I see tag " + tag + '(tag_prefix is ' + tag_prefix + ')' + tag.startsWith(tag_prefix));
                if ((tag_prefix=='') || tag.startsWith(tag_prefix)) {
                  const typ = tag.replace(tag_prefix, '');
                  // In TypeScript, we really should define types explicitly
                  // This means we need to pre-emptively defend against possible undefined values
                  let abstract_tag: string | undefined = '';
                  if (tag2abstractTag.has(typ))
                    abstract_tag = tag2abstractTag.get(typ);
                  console.log("Tag match on prefix; typ is " + typ );
                  console.log("Acceptable type? " +  tag_types.includes(typ));
                  //console.log("Renderable type? " +  tagButtonSpec[typ]['render']);
                  //if (tag_types.includes(typ) && (tagButtonSpec[typ]['render'])) {
                  if (abstract_tag && (tagButtonSpec[abstract_tag]['render'])) {
                    console.log("Classing tag " + tag +'/' + abstract_tag);
                    // class the cell
                    //cell.node.classList.add(tag + "-node");
                    // The iou-class is the one used in css
                    cell.node.classList.add('iou-' + abstract_tag + "-node");
                  }
                } // end: if tag starts with prefix...
              } // end: tags iterator
            } //end: if there are tags
        } // end: iterate cells
    } // end: check_tags function definition
     
    notebook.modelChanged.connect((notebook) => {
        console.log("I think we're changed");
        // This doesn't seem to do anything on notebook load
        // iterate cells and toggle DOM classes as needed, e.g.
        //check_tags(notebook);
         
    });
         
    notebook.fullyRendered.connect((notebook) => {
        /*
        I don't think this means fully rendered on a cells becuase it seems
        like we try to add the tags mutliple times on notebook load
        which is really inefficient.
        This may be unstable anyway, eg the following comment:
            https://stackoverflow.com/questions/71736749/accessing-notebook-cell-metadata-and-html-class-attributes-in-jupyterlab-extensi/71744107?noredirect=1#comment126807644_71744107
        I'll with go with in now in the expectation it will be break
        and I will hopefully be able to find another even to fire from.
         
        I get the impression the UI is some some of signal hell and
        the solution is just to keep redoing things on everything
        if anything changes. Who needs efficiency or elegance anyway...!
        After all, this is just an end-user hack-from-a-position-of-ignorance
        and works sort of enough to do something that I couldn't do before...
        */
         
        console.log("I think we're fullyRendered...(?!)");
        // iterate cells and toggle DOM classes as needed, e.g.
        check_tags(notebook);
    });
     
    return new DisposableDelegate(() => {
    });
  }
}

/**
 * Activate the extension.
 *
 * @param app Main application object
 */
function activate(
   app: JupyterFrontEnd, settingRegistry: ISettingRegistry | null): void {
    console.log('JupyterLab extension jupyterlab-empinken is activated!');
    console.log("YES WE'RE UPDATED 3")

    // Example of how to read settings from cookiecutter
    if (settingRegistry) {
      settingRegistry
        .load(plugin.id)
        .then(settings => {
          console.log('jupyterlab_empinken_extension settings loaded:', settings.composite);
          // Handle the background colours
          // The document object seems to be magically available?
          const root = document.documentElement;
          const updateSettings = (): void => {
            let tag_types: string[] = ['activity', 'solution', 'learner', 'tutor'];
            for (let typ of tag_types) {
              const color = settings.get(typ+'_color').composite as string;
              root.style.setProperty('--iou-'+typ+'-bg-color', color);
            }
          };
          updateSettings();
          // We can auto update the color
          settings.changed.connect(updateSettings);
        })
        .catch(reason => {
          console.error('Failed to load settings for jupyterlab_empinken_extension.', reason);
        });

    // Note that the extensions example gives an alternative way of managing the settings:
    // https://github.com/jupyterlab/extension-examples/blob/master/settings/src/index.ts
    // For an example of how to pass settings into button extension, see eg:
    // https://github.com/ocordes/jupyterlab_notebookbuttons/blob/main/src/index.ts
    // Also note that the properties have a structure/composite definition
    // in the properties area of the plugin.json file
    // An "additionalProperties: true" setting allows uses to add settings via the settings editor.

    app.docRegistry.addWidgetExtension('Notebook', new ClassDemoExtension(settingRegistry));
    app.docRegistry.addWidgetExtension('Notebook', new ButtonExtension(settingRegistry));
  }
}

export default plugin;
