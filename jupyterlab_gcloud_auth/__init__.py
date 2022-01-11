
import json
from pathlib import Path

from ._version import __version__

HERE = Path(__file__).parent.resolve()

with (HERE / "labextension" / "package.json").open() as fid:
    data = json.load(fid)

def _jupyter_labextension_paths():
    return [{
        "src": "labextension",
        "dest": data["name"]
    }]



from .handlers import setup_handlers


def _jupyter_server_extension_points():
    return [{
        "module": "jupyterlab_gcloud_auth"
    }]


def _load_jupyter_server_extension(server_app):
    setup_handlers(server_app.web_app)
    server_app.log.info("Registered jupyterlab-gcloud-auth extension at URL path /gcloud-auth")

# For backward compatibility with notebook server - useful for Binder/JupyterHub
load_jupyter_server_extension = _load_jupyter_server_extension

