import { JupyterFrontEndPlugin, JupyterFrontEnd } from '@jupyterlab/application';
import { IMainMenu } from "@jupyterlab/mainmenu";
import { GcpMenu } from "./gcp";
import { URLExt } from '@jupyterlab/coreutils';
import { ServerConnection } from '@jupyterlab/services';
import { Widget } from "@phosphor/widgets";
import { Dialog } from "@jupyterlab/apputils";

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
        const settings = ServerConnection.makeSettings();
        const fullUrl = URLExt.join(settings.baseUrl, "gcloud-auth");
        const fullRequest = {
          method: 'POST'
        };
        ServerConnection.makeRequest(fullUrl, fullRequest, settings).then(response => {
          response.text().then(function processUrl(authUrl: string) {
            const dialog = new Dialog({
              title: "Auth",
              body: new AuthForm(authUrl),
              buttons: [
                  Dialog.okButton()
                ]
            });
            dialog.launch();
          })
        });
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

class AuthForm extends Widget {

  constructor(authLink: string) {
      super({
          node: AuthForm.createFormNode(authLink)
      });
  }

  private static createFormNode(authLink: string): HTMLElement {
      const node = document.createElement("div");
      const br = document.createElement("br");
      const authLinkText = document.createElement("a");
      authLinkText.textContent = authLink;
      node.appendChild(authLinkText);
      node.appendChild(br);
      return node;
  }
}

export default gcloudAuthExt;
