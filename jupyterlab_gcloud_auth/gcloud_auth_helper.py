import json
import pexpect
import sys

import os.path

_DEFAULT_CREDENTIALS_FILE_PATH = "~/.config/gcloud/application_default_credentials.json"

_GCLOUD_LOGIN_COMMAND = ("gcloud auth login "
                         "--update-adc --quiet --no-launch-browser")

_GCLOUD_LOGOFF_COMMAND = "gcloud auth revoke --quiet"


class GcloudAuthHelper(object):
    """Singleton helper for coordinating gcloud auth commands."""
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(GcloudAuthHelper, cls).__new__(cls)
            cls._instance.active_request = None
            cls._instance.active_url = None
        return cls._instance

    def create_login_request(self):
        self._reset_active_request()
        try:
            self.active_request = pexpect.spawn(_GCLOUD_LOGIN_COMMAND,
                                                encoding="utf-8",
                                                logfile=sys.stdout,
                                                timeout=600)
            self.active_request.expect("https://accounts.google.com/.+\r\n")
            self.active_url = self.active_request.match[0]
        except Exception as e:
            print("Failed to start login: {}".format(str(self.active_request)))

    def get_link(self):
        return self.active_url

    def signed_in(self):
        file_path = self._generate_auth_file_path()
        return os.path.exists(file_path)

    def sign_out(self, signout):
        if signout:
            self._reset_active_request()
            pexpect.run(_GCLOUD_LOGOFF_COMMAND, logfile=sys.stdout,
                        encoding="utf-8")
            # ADC file still remains, even after revoke
            file_path = self._generate_auth_file_path()
            os.remove(file_path)

    def finish_authentication(self, auth_code):
        try:
            self.active_request.sendline(auth_code)
            self.active_request.expect("logged in", timeout=10)
        except Exception as e:
            print("Failed to complete login: {}".format(str(self.active_request)))

    def _generate_auth_file_path(self):
        return os.path.expanduser(_DEFAULT_CREDENTIALS_FILE_PATH)

    def _reset_active_request(self):
        if self.active_request:
            self.active_url = None
            self.active_request.terminate(force=True)
