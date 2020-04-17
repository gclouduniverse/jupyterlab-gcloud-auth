INSTANCE_NAME=$1

gcloud compute ssh "jupyter@${INSTANCE_NAME}" -- "sudo rm -rf /home/jupyter/jupyterlab-gcloud-auth"
gcloud compute ssh "jupyter@${INSTANCE_NAME}" -- "mkdir -p /home/jupyter/jupyterlab-gcloud-auth"
gcloud compute scp --recurse ./* "jupyter@${INSTANCE_NAME}:/home/jupyter/jupyterlab-gcloud-auth"
gcloud compute ssh "jupyter@${INSTANCE_NAME}" -- bash -l "pip uninstall -y jupyterlab_gcloud_auth"
gcloud compute ssh "jupyter@${INSTANCE_NAME}" -- bash -l "pip install /home/jupyter/jupyterlab-gcloud-auth"
gcloud compute ssh "jupyter@${INSTANCE_NAME}" -- bash -l "sudo service jupyter restart"
gcloud compute ssh "jupyter@${INSTANCE_NAME}" -- bash -l "cd /home/jupyter/jupyterlab-gcloud-auth && sudo jupyter labextension install"
