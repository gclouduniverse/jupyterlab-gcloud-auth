import json

from jupyter_server.base.handlers import APIHandler
from jupyter_server.utils import url_path_join
import tornado

from . import gcloud_auth_helper

class GcpAuthHandler(APIHandler):

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.gcloud_auth_helper = gcloud_auth_helper.GcloudAuthHelper()

    # The following decorator should be present on all verb methods (head, get, post,
    # patch, put, delete, options) to ensure only authorized user can request the
    # Jupyter server
    @tornado.web.authenticated
    def post(self):
        data = json.loads(self.request.body.decode("utf-8"))
        if data.get("signout"):
            self.gcloud_auth_helper.sign_out(data["signout"])
        elif data.get("signin"):
            self.gcloud_auth_helper.create_login_request()
        else:
            self.gcloud_auth_helper.finish_authentication(data["auth_code"])
        return self.finish("DONE")

    @tornado.web.authenticated
    def get(self):
        data = {
            "auth_url": self.gcloud_auth_helper.get_link(),
            "signed_in": self.gcloud_auth_helper.signed_in()
        }
        return self.finish(data)


def setup_handlers(web_app):
    host_pattern = ".*$"

    base_url = web_app.settings["base_url"]
    route_pattern = url_path_join(base_url, "gcloud-auth")
    handlers = [(route_pattern, GcpAuthHandler)]
    web_app.add_handlers(host_pattern, handlers)
