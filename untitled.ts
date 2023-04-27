
   
import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

//https://jupyterlab.readthedocs.io/en/3.1.x/api/classes/notebook.notebookactions-1.html
import { NotebookActions } from '@jupyterlab/notebook';
//import { IKernelConnection } from '@jupyterlab/services/Kernel IKernelConnection';
import { ISettingRegistry } from '@jupyterlab/settingregistry';

/**
 * Initialization data for the jupyterlab-cell-flash extension.
 */
const extension: JupyterFrontEndPlugin<void> = {
  id: 'jupyterlab-cell-flash:plugin',
  autoStart: true,
  optional: [ISettingRegistry],//, IKernelConnection],
  activate: async (app: JupyterFrontEnd, settingRegistry: ISettingRegistry, //kernelConnection: IKernelConnection
                  ) => {
    if (settingRegistry) {
      const setting = await settingRegistry.load(extension.id);
      const root = document.documentElement;
      const updateSettings = (): void => {
        const color = setting.get('color').composite as string;
        const duration = setting.get('duration').composite as number;
        root.style.setProperty('--jp-cell-flash-color', color);
        root.style.setProperty('--jp-cell-flash-duration', `${duration}s`);
      };
      updateSettings();
      setting.changed.connect(updateSettings);
    }

   /*
   IKernelConnection.connectionStatusChanged.connect((kernel, conn_stat) => {
    
          console.log("KERNEL ****"+conn_stat)
    });
    */
    NotebookActions.executed.connect((_, args) => {
      const { cell } = args;
        const { success } = args;
    if (success)
      cell.inputArea.promptNode.classList.add("executed-success");
    else
        cell.inputArea.promptNode.classList.add("executed-error");
        cell.inputArea.promptNode.classList.remove("scheduled");
    });

        NotebookActions.executionScheduled.connect((_, args) => {
      const { cell } = args;
           
      cell.inputArea.promptNode.classList.remove("executed");
            cell.inputArea.promptNode.classList.add("scheduled");
    });  
      
      // If the kernel is stopped, we need to clear all the status indications
      // https://jupyterlab.readthedocs.io/en/3.1.x/api/modules/services.kernel.html#connectionstatus
      // Status based on IKernelConnection
      // Clear classes on the following Status values?
      //"starting"  "terminating" | "restarting" | "autorestarting" | "dead"
      // or maybe just starting and restarting?
      // Cell status should reflect likely state...
      // We could add a button to clear status settings
  }
};

export default extension;