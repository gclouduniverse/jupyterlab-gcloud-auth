import json
import requests

import os.path

_DEFAULT_CREDENTIALS_FILE_PATH = "~/.config/gcloud/application_default_credentials.json"

_OAUTH_TOKEN_BASE_URL = "https://www.googleapis.com/oauth2/v4/token"

# Both following value are copy-pasted from the google-auth package from:
# /usr/lib/google-cloud-sdk/lib/googlecloudsdk/api_lib/auth/util.py
_GCLOUD_CLIENT_ID = "764086051850-6qr4p6gpi6hn506pt8ejuq83di341hur.apps.googleusercontent.com"
_GCLOUD_CLIENT_SECRET = "d-FL95Q19q7MQmFpd7hHD0Ty"

_AUTH_URL = ("https://accounts.google.com/o/oauth2/v2/auth?"
            "client_id={client_id}&"
            "response_type=code&"
            "scope=https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.email+"
            "https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fcloud-platform+"
            "https%3A%2F%2Fwww.googleapis.com%2Fauth%2Faccounts.reauth&"
            "access_type=offline&"
            "redirect_uri=urn:ietf:wg:oauth:2.0:oob".format(
                client_id=_GCLOUD_CLIENT_ID))


class GcloudAuthHelper(object):

    def get_link(self):
        return _AUTH_URL

    def signed_in(self):
        file_path = self._generate_auth_file_path()
        return os.path.exists(file_path)
    
    def finish_authentification(self, auth_code):
        payload = {
            "code": auth_code,
            "client_id": _GCLOUD_CLIENT_ID,
            "client_secret": _GCLOUD_CLIENT_SECRET,
            "redirect_uri": "urn:ietf:wg:oauth:2.0:oob", 
            "grant_type": "authorization_code"
        }
        result_raw = requests.post(_OAUTH_TOKEN_BASE_URL, data=payload)
        result_dict = json.loads(result_raw.text) 
        auth_file_content = {
            "client_id": _GCLOUD_CLIENT_ID,
            "client_secret": _GCLOUD_CLIENT_SECRET,
            "refresh_token": result_dict["refresh_token"],
            "type": "authorized_user"
        }
        file_path = self._generate_auth_file_path()
        with open(file_path, "w") as fp:
            json.dump(auth_file_content, fp)
    
    def _generate_auth_file_path(self):
        return os.path.expanduser(_DEFAULT_CREDENTIALS_FILE_PATH)
