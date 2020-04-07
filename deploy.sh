INSTANCE_NAME=$1

gcloud compute ssh "jupyter@${INSTANCE_NAME}" -- "sudo rm -rf /home/jupyter/jupyterlab-gcloud-auth"
gcloud compute ssh "jupyter@${INSTANCE_NAME}" -- "mkdir -p /home/jupyter/jupyterlab-gcloud-auth"
gcloud compute scp --recurse ./* "jupyter@${INSTANCE_NAME}:/home/jupyter/jupyterlab-gcloud-auth"
gcloud compute ssh "jupyter@${INSTANCE_NAME}" -- "/opt/conda/bin/pip uninstall -y jupyterlab_gcloud_auth"
gcloud compute ssh "jupyter@${INSTANCE_NAME}" -- "/opt/conda/bin/pip install /home/jupyter/jupyterlab-gcloud-auth"
gcloud compute ssh "jupyter@${INSTANCE_NAME}" -- "sudo service jupyter restart"
gcloud compute ssh "jupyter@${INSTANCE_NAME}" -- "PATH=/opt/conda/bin:/opt/conda/condabin:/usr/local/bin:/usr/bin:/bin:/usr/local/games:/usr/games && cd /home/jupyter/jupyterlab-gcloud-auth && /opt/conda/bin/jupyter labextension install"