import '../style/index.css'

import { JupyterFrontEndPlugin, JupyterFrontEnd } from '@jupyterlab/application';
import { IMainMenu } from "@jupyterlab/mainmenu";

const gcloudAuthExt: JupyterFrontEndPlugin<void> = {
  id: 'gcloud_auth',
  autoStart: true,
  requires: [IMainMenu],
  activate: (app: JupyterFrontEnd, mainMenu: IMainMenu) => {
    console.log('gcloud auth extension is activated!');
    const commandID = 'gcloud-auth-application-default-login';
    app.commands.addCommand(commandID, {
      label: 'gcloud auth application-default login',
      execute: () => {
        // TODO
        console.log(`Executed ${commandID}`);
      }
    });
    // TODO: it should be in it's own group
    mainMenu.fileMenu.addGroup([
      {
        command: commandID,
      }
    ], 40 /* rank */);
  }
}

export default gcloudAuthExt;
