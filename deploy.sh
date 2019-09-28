INSTANCE_NAME=$1

gcloud compute ssh "jupyter@${INSTANCE_NAME}" -- "sudo rm -rf /home/jupyter/jupyterlab-gcloud-auth"
gcloud compute ssh "jupyter@${INSTANCE_NAME}" -- "mkdir -p /home/jupyter/jupyterlab-gcloud-auth"
gcloud compute scp --recurse ./* "jupyter@${INSTANCE_NAME}:/home/jupyter/jupyterlab-gcloud-auth"
# gcloud compute ssh "jupyter@${INSTANCE_NAME}" -- "sudo pip3 uninstall -y jupyterlab-gcloud-auth"
# gcloud compute ssh "jupyter@${INSTANCE_NAME}" -- "sudo pip3 install /home/jupyter/jupyterlab-gcloud-auth"
# gcloud compute ssh "jupyter@${INSTANCE_NAME}" -- "sudo service jupyter restart"
gcloud compute ssh "jupyter@${INSTANCE_NAME}" -- "cd /home/jupyter/jupyterlab-gcloud-auth && sudo jupyter labextension install"
