#!/bin/bash
# ==============================================================================
# Script to Provision a GCP Virtual Machine and Deploy PIMCore
# Project: bsava-com
# ==============================================================================

set -e

# --- Configuration Variables ---
PROJECT_ID="bsava-com"
ZONE="europe-west2-b"
INSTANCE_NAME="pimcore-vm"
MACHINE_TYPE="e2-standard-4"    # 4 vCPUs, 16GB RAM is ideal for PIMCore + MySQL + Redis
BOOT_DISK_SIZE="50GB"           # Minimum size recommended

# Ensure gcloud is pointing to the right project
gcloud config set project "$PROJECT_ID"

echo "🚀 Provisioning PIMCore Virtual Machine ($INSTANCE_NAME)..."

# 1. Create the VM Instance with Startup Script
# This startup script automatically installs Docker and Docker Compose on initial boot
gcloud compute instances create "$INSTANCE_NAME" \
    --project="$PROJECT_ID" \
    --zone="$ZONE" \
    --machine-type="$MACHINE_TYPE" \
    --image-family="ubuntu-2204-lts" \
    --image-project="ubuntu-os-cloud" \
    --boot-disk-size="$BOOT_DISK_SIZE" \
    --tags="http-server,https-server,pimcore-server" \
    --metadata=startup-script='#!/bin/bash
# Update and install dependencies
apt-get update
apt-get install -y ca-certificates curl gnupg lsb-release nginx
# Install Docker Repository
install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
chmod a+r /etc/apt/keyrings/docker.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
# Install Docker Engine & Compose
apt-get update
apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
systemctl enable docker
systemctl start docker

# Add Ubuntu user to docker group
usermod -aG docker ubuntu

# Maximize memory overcommit for Redis
sysctl vm.overcommit_memory=1
'

# 2. Add Firewall Rules
echo "🛡️ Configuring Firewall rules (HTTP/HTTPS/8080)..."
if ! gcloud compute firewall-rules describe allow-pimcore-gui --project="$PROJECT_ID" >/dev/null 2>&1; then
  gcloud compute firewall-rules create allow-pimcore-gui \
      --project="$PROJECT_ID" \
      --direction=INGRESS --priority=1000 --network=default --action=ALLOW \
      --rules=tcp:80,tcp:443,tcp:8080 \
      --source-ranges=0.0.0.0/0 \
      --target-tags=http-server,https-server,pimcore-server
else
  echo "Firewall rule 'allow-pimcore-gui' already exists. Skipping..."
fi

# 3. Get Public IP
IP_ADDR=$(gcloud compute instances describe "$INSTANCE_NAME" \
    --project="$PROJECT_ID" \
    --zone="$ZONE" \
    --format='get(networkInterfaces[0].accessConfigs[0].natIP)')

echo "🌐 Waiting for VM SSH access to initialize (IP: $IP_ADDR)..."

# Poll until SSH is available
MAX_RETRIES=15
RETRY_COUNT=0
while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
  if gcloud compute ssh --quiet "ubuntu@$INSTANCE_NAME" --project="$PROJECT_ID" --zone="$ZONE" --command="echo 'SSH is up'"; then
    break
  fi
  echo "   Waiting for ssh to become ready... (Sleep 10s)"
  sleep 10
  RETRY_COUNT=$((RETRY_COUNT+1))
done

# We add an extra sleep to ensure docker installation finishes via cloud-init
echo "⏳ Waiting 45 seconds for Docker to finish installing via cloud-init..."
sleep 45 

# 4. Upload Local PIMCore Container Payload
echo "📦 Uploading local PIMCore Docker setup..."
gcloud compute ssh "ubuntu@$INSTANCE_NAME" \
    --project="$PROJECT_ID" \
    --zone="$ZONE" \
    --command="mkdir -p ~/PIMCore"

# Use scp to recursively transfer the entire local PIMCore folder contents
gcloud compute scp --recurse ./docker-containers/PIMCore/* "ubuntu@$INSTANCE_NAME:~/PIMCore/" \
    --project="$PROJECT_ID" \
    --zone="$ZONE"

# 5. Start Docker Services on VM
echo "🚀 Firing up PIMCore Containers..."
gcloud compute ssh "ubuntu@$INSTANCE_NAME" \
    --project="$PROJECT_ID" \
    --zone="$ZONE" \
    --command="
# Ensure correct ownership inside the folder
sudo chown -R 1000:1000 ~/PIMCore
cd ~/PIMCore
sudo docker compose up -d
"

# 6. Output Status and Next Steps
echo ""
echo "✅==========================================================✅"
echo "🎉 DEPLOYMENT TO VM COMPLETE!"
echo ""
echo "PIMCore should be initializing. It may take a couple minutes for"
echo "MySQL and PHP extensions to finish their first-boot processes."
echo ""
echo "🌎 UI and API available at:"
echo "   http://$IP_ADDR:8080"
echo ""
echo "To secure with Netlify (HTTPS Requirement):"
echo " 1. Map a domain name A-Record to $IP_ADDR"
echo " 2. Run Certbot & Reverse Proxy Nginx on the VM to forward to 8080."
echo ""
echo "To SSH into the VM for Debugging:"
echo "   gcloud compute ssh ubuntu@$INSTANCE_NAME --project=$PROJECT_ID --zone=$ZONE"
echo "   cd ~/PIMCore && sudo docker compose logs -f"
echo "✅==========================================================✅"
