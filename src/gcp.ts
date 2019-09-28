import { Menu } from '@phosphor/widgets';
import { JupyterLabMenu } from "@jupyterlab/mainmenu";


export class GcpMenu extends JupyterLabMenu {

    constructor(options: Menu.IOptions) {
        super(options);
        this.menu.title.label = 'GCP';
    }
}
