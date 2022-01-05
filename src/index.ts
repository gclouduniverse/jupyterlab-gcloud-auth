import {
    JupyterFrontEndPlugin,
    JupyterFrontEnd
}
from '@jupyterlab/application';
import {
    IMainMenu
}
from "@jupyterlab/mainmenu";
import {
    GcpMenu
}
from "./gcp";
import {
    URLExt
}
from '@jupyterlab/coreutils';
import {
    ServerConnection
}
from '@jupyterlab/services';
import {
    Widget
}
from "@lumino/widgets";
import {
    Dialog
}
from "@jupyterlab/apputils";

const FORCE_SIGN_IN_FEILD_KEY: string = "force_signin"

function getUrlParams(search: string): {
    [key: string]: string
} {
    let hashes: string[] = search.slice(search.indexOf('?') + 1).split('&');
    let result: {
        [key: string]: string
    } = {}
    return hashes.reduce((params: {
            [key: string]: string
        }, hash: string) => {
        let[key, val] = hash.split('=')
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
    const createLoginRequest = {
      method: 'POST',
      body: JSON.stringify({
          "signin": true
      })
    };
    ServerConnection.makeRequest(fullUrl, createLoginRequest, settings).then(response => {
        ServerConnection.makeRequest(fullUrl, fullRequest, settings).then(response => {
            response.text().then(function processUrl(jsonResult: string) {
                const dataFromServer: {
                    [key: string]: string
                } = JSON.parse(jsonResult);
                const authUrl: string = dataFromServer["auth_url"];
                const alreadySigned: Boolean = !!dataFromServer["signed_in"];
                if (alreadySigned) {
                    if (!forced) {
                        signOut();
                    }
                    return;
                }
                const getCodeDialog = new Dialog({
                    title: "Please authorize your GCP credentials",
                    body: new GetCodeDialog(),
                    buttons: [
                        Dialog.cancelButton(),
                        submitButton({
                            label: "Get Code"
                        }),
                    ]
                });
                const getCodeResult = getCodeDialog.launch();
                getCodeResult.then(result => {
                    if (typeof result.value !== 'undefined' && result.value !== null) {
                        openInNewTab(authUrl);
                        const submitCodeDialog = new Dialog({
                            title: "Complete GCP Authorization",
                            body: new SubmitCodeDialog(),
                            buttons: [
                                Dialog.cancelButton(),
                                submitButton({
                                    label: "Authorize"
                                })
                            ]
                        });
                        const authResult = submitCodeDialog.launch();
                        authResult.then(result => {
                            if (typeof result.value !== 'undefined' && result.value) {
                                const authCode = result.value;
                                const finalizeAuthRequest = {
                                    method: "POST",
                                    body: JSON.stringify({
                                        "auth_code": authCode
                                    })
                                };
                                ServerConnection.makeRequest(fullUrl, finalizeAuthRequest, settings).then(response => {
                                    ServerConnection.makeRequest(fullUrl, fullRequest, settings).then(response => {
                                        response.text().then(function processUrl(jsonResult: string) {
                                            const dataFromServer: {
                                                [key: string]: string
                                            } = JSON.parse(jsonResult);
                                            const alreadySigned: Boolean = !!dataFromServer["signed_in"];
                                            if (alreadySigned) {
                                                const successDialog = new Dialog({
                                                    title: 'Success',
                                                    body: new SuccessSignInDialog(),
                                                    buttons: [
                                                        Dialog.okButton()
                                                    ]
                                                });
                                                successDialog.launch();
                                            } else {
                                                const errorDialog = new Dialog({
                                                    title: 'Error',
                                                    body: new ErrorSignInDialog(),
                                                    buttons: [
                                                        Dialog.okButton()
                                                    ]
                                                });
                                                errorDialog.launch();
                                            }
                                        })
                                    });
                                });
                            }
                        });
                    }
                });
            });
        });
    });
}

function signOut() {
    const settings = ServerConnection.makeSettings();
    const fullUrl = URLExt.join(settings.baseUrl, "gcloud-auth");
    const signOutDialog = new Dialog({
        title: "Sign out",
        body: new SignOutDialog(),
        buttons: [
            Dialog.cancelButton(),
            submitButton({
                label: "Yes"
            })
        ]
    });
    const signOutResult = signOutDialog.launch();
    signOutResult.then(result => {
        if (result.button.label == 'Yes') {
            let signOutProcessing = {
                method: 'POST',
                body: JSON.stringify({
                    "signout": true
                })
            };
            ServerConnection.makeRequest(fullUrl, signOutProcessing, settings).then(response => {
                const successDialog = new Dialog({
                    title: 'Success',
                    body: new SuccessSignOutDialog(),
                    buttons: [
                        Dialog.okButton()
                    ]
                });
                successDialog.launch();
            });
        }
    });
}

const gcloudAuthExt: JupyterFrontEndPlugin < void >  = {
    id: 'gcloud_auth',
    autoStart: true,
    requires: [IMainMenu],
    activate: (app: JupyterFrontEnd, mainMenu: IMainMenu) => {
        const commandID = 'gcloud-auth-application-default-login';
        app.commands.addCommand(commandID, {
            label: "gcloud auth application-default login/logout",
            execute: () => {
                signIn(false);
            }
        });
        const commands = app.commands;
        const gcpMenu = new GcpMenu({
            commands
        });

        // TODO: it should be in it's own group
        mainMenu.addMenu(gcpMenu.menu, {
            rank: 10
        })
        gcpMenu.addGroup([{
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

class SignOutDialog extends Widget {

    constructor() {
        super({
            node: SignOutDialog.createFormNode()
        });
    }

    private static createFormNode(): HTMLElement {
        const node = document.createElement("div");
        const signOutText = document.createElement("p");
        signOutText.textContent = "Do you want to sign out?";
        node.appendChild(signOutText);
        return node;
    }
}

class SuccessSignInDialog extends Widget {

    constructor() {
        super({
            node: SuccessSignInDialog.createFormNode()
        });
    }

    private static createFormNode(): HTMLElement {
        const node = document.createElement("div");
        const successSignInText = document.createElement("p");
        successSignInText.textContent = "You have successfully signed in";
        node.appendChild(successSignInText);
        return node;
    }
}

class ErrorSignInDialog extends Widget {

    constructor() {
        super({
            node: ErrorSignInDialog.createFormNode()
        });
    }

    private static createFormNode(): HTMLElement {
        const node = document.createElement("div");
        const errorSignInText = document.createElement("p");
        errorSignInText.textContent = "You are not signed in";
        node.appendChild(errorSignInText);
        return node;
    }
}

class SuccessSignOutDialog extends Widget {

    constructor() {
        super({
            node: SuccessSignOutDialog.createFormNode()
        });
    }

    private static createFormNode(): HTMLElement {
        const node = document.createElement("div");
        const successSignOutText = document.createElement("p");
        successSignOutText.textContent = "You have successfully signed out";
        node.appendChild(successSignOutText);
        return node;
    }
}

class GetCodeDialog extends Widget {
    constructor() {
        super({
            node: GetCodeDialog.createDialogNode()
        });
    }

    private static createDialogNode(): HTMLElement {
        const node = document.createElement("div");
        const authText = document.createElement("p");

        authText.textContent = 'Clicking "Get Code" will take you to a new page with an authentication code that you can paste here to complete the process.';
        authText.style.marginBottom = "16px";

        node.appendChild(authText);
        return node;
    }
    getValue(): string {
        return '';
    }
}

class SubmitCodeDialog extends Widget {

    constructor() {
        super({
            node: SubmitCodeDialog.createFormNode()
        });
    }

    private static createFormNode(): HTMLElement {
        const node = document.createElement("div");
        const authText = document.createElement("p");
        const authCodeInputText = document.createElement("input");

        authText.textContent = 'Please paste your copied Google Authorization code into the form field below';
        authCodeInputText.setAttribute("type", "text");
        authCodeInputText.setAttribute("id", "authCodeInputText");

        authCodeInputText.style.margin = '16px 0';

        node.appendChild(authText);
        node.appendChild(authCodeInputText);
        return node;
    }

    getValue(): string {
        return ( < HTMLInputElement > this.node.querySelector('#authCodeInputText')).value;
    }
}

function openInNewTab(url: string) {
    var win = window.open(url, '_blank');
    win.focus();
}

function submitButton(options: Partial < Dialog.IButton >  = {}): Readonly < Dialog.IButton > {
    options.accept = true;
    return Dialog.createButton(options);
}

export default gcloudAuthExt;
