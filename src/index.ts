import { JupyterFrontEndPlugin, JupyterFrontEnd } from '@jupyterlab/application';
import { IMainMenu } from "@jupyterlab/mainmenu";
import { GcpMenu } from "./gcp";

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
    const commands = app.commands;
    const gcpMenu = new GcpMenu({ commands });

    // TODO: it should be in it's own group
    mainMenu.addMenu(gcpMenu.menu, { rank: 10 })
    gcpMenu.addGroup([
      {
        command: commandID,
      }
    ], 0 /* rank */);
  }
}

export default gcloudAuthExt;
