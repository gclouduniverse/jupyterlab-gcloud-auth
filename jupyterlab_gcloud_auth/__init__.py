import tornado.gen as gen
import subprocess
import json

from notebook.utils import url_path_join
from . import gcloud_auth_helper
from notebook.base.handlers import APIHandler


class GcpAuthHandler(APIHandler):

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.gcloud_auth_helper = gcloud_auth_helper.GcloudAuthHelper()

    @gen.coroutine
    def post(self):
        data = json.loads(self.request.body.decode('utf-8'))
        self.gcloud_auth_helper.finish_authentification(data["auth_code"])
        return self.finish("DONE")

    @gen.coroutine
    def get(self):
        data = {
            "auth_url": self.gcloud_auth_helper.get_link(),
            "signed_in": self.gcloud_auth_helper.signed_in()
        }
        return self.finish(data)


def _jupyter_server_extension_paths():
    return [{
        'module': 'jupyterlab_gcloud_auth'
    }]


def load_jupyter_server_extension(nb_server_app):
    web_app = nb_server_app.web_app
    base_url = web_app.settings['base_url']
    endpoint = url_path_join(base_url, 'gcloud-auth')
    handlers = [(endpoint, GcpAuthHandler)]
    web_app.add_handlers('.*$', handlers)
