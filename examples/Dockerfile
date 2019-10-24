FROM gcr.io/deeplearning-platform-release/base-cpu:m34

RUN pip install jupyterlab-gcloud-auth
RUN jupyter labextension install jupyterlab-gcloud-auth

RUN mkdir -p ~/.config/gcloud