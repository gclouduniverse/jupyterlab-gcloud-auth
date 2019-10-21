import { JupyterFrontEndPlugin, JupyterFrontEnd } from '@jupyterlab/application';
import { IMainMenu } from "@jupyterlab/mainmenu";
import { GcpMenu } from "./gcp";
import { URLExt } from '@jupyterlab/coreutils';
import { ServerConnection } from '@jupyterlab/services';
import { Widget } from "@phosphor/widgets";
import { Dialog } from "@jupyterlab/apputils";

const FORCE_SIGN_IN_FEILD_KEY: string = "force_signin"

function getUrlParams(search: string): {[key: string]: string} {
  let hashes: string[] = search.slice(search.indexOf('?') + 1).split('&');
  let result: {[key: string]: string} = {}
  return hashes.reduce((params: {[key: string]: string}, hash: string) => {
      let [key, val] = hash.split('=')
      params[key] = decodeURIComponent(val);
      return params;
  }, result);
}

function signIn(forced: Boolean) {
  const settings = ServerConnection.makeSettings();
  const fullUrl = URLExt.join(settings.baseUrl, "gcloud-auth");
  const fullRequest = {
    method: 'GET'
  };
  ServerConnection.makeRequest(fullUrl, fullRequest, settings).then(response => {
    response.text().then(function processUrl(jsonResult: string) {
      const dataFromServer: {[key: string]: string} = JSON.parse(jsonResult);
      const authUrl: string = dataFromServer["auth_url"];
      const alreadySigned: Boolean = !!dataFromServer["signed_in"];
      if (alreadySigned) {
        if (!forced) {
          const alreadySignedDialog = new Dialog({
            title: "Auth",
            body: new AlreadySignedDialog(),
            buttons: [
              Dialog.okButton()
            ]
          });
          alreadySignedDialog.launch();
        }
        return;
      }
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

const gcloudAuthExt: JupyterFrontEndPlugin<void> = {
  id: 'gcloud_auth',
  autoStart: true,
  requires: [IMainMenu],
  activate: (app: JupyterFrontEnd, mainMenu: IMainMenu) => {
    const commandID = 'gcloud-auth-application-default-login';
    app.commands.addCommand(commandID, {
      label: "gcloud auth application-default login",
      execute: () => {
        signIn(false);
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

    console.log('gcloud auth extension is activated!');
    console.log(getUrlParams(window.location.search));
    const urlParams = getUrlParams(window.location.search);
    if (FORCE_SIGN_IN_FEILD_KEY in urlParams) {
      signIn(true);
    }
  }
}

class AlreadySignedDialog extends Widget {

  constructor() {
      super({
          node: AlreadySignedDialog.createFormNode()
      });
  }

  private static createFormNode(): HTMLElement {
      const node = document.createElement("div");
      const authLinkText = document.createElement("a");

      authLinkText.textContent = "Already Signed In";
      node.appendChild(authLinkText);
      return node;
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
