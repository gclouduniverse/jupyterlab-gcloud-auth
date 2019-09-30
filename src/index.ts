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
      label: "gcloud auth application-default login",
      execute: () => {
        const settings = ServerConnection.makeSettings();
        const fullUrl = URLExt.join(settings.baseUrl, "gcloud-auth");
        const fullRequest = {
          method: 'GET'
        };
        ServerConnection.makeRequest(fullUrl, fullRequest, settings).then(response => {
          response.text().then(function processUrl(authUrl: string) {
            const dialog = new Dialog({
              title: "Auth",
              body: new AuthForm(authUrl),
              buttons: [
                  Dialog.cancelButton(),
                  Dialog.okButton()
                ]
            });
            const result = dialog.launch();
            result.then(result => {
              if (typeof result.value != 'undefined' && result.value) {
                const authCode = result.value;
                const finalizeAuthRequest = {
                  method: "POST",
                  body: JSON.stringify(
                    {
                      "auth_code": authCode
                    }
                  )
                };
                ServerConnection.makeRequest(fullUrl, finalizeAuthRequest, settings);
              }
            });
          });
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
      const authCodeAskText = document.createElement("p");
      const authCodeInputText = document.createElement("input");

      authCodeInputText.setAttribute("type", "text");
      authCodeInputText.setAttribute("id", "authCodeInputText");
      authCodeAskText.textContent = "auth code:";

      authLinkText.textContent = "Please authorzied here";
      authLinkText.href = authLink;
      authLinkText.target = '_blank';
      node.appendChild(authLinkText);
      node.appendChild(br);
      node.appendChild(authCodeAskText);
      node.appendChild(authCodeInputText);
      return node;
  }

  getValue(): string {
    return (<HTMLInputElement>this.node.querySelector('#authCodeInputText')).value;
  }
}

export default gcloudAuthExt;
