# JupyterLab extension that allows to use AI Platform Notebooks with personal credentials

In short, it works like this:

![](./example.gif)

## Installation

This extension includes both a notebook server extension and a lab extension. In order to use it, you must enable both of them.

To install the server extension, run the following in your terminal:

```bash
sudo pip3 install jupyterlab-gcloud-auth
```

To install the lab extension, run:

```bash
sudo jupyter labextension install jupyterlab-gcloud-auth
```

Don't forget to restart jupyter:

```bash
sudo service jupyter restart
```

and refresh the browser tab.
