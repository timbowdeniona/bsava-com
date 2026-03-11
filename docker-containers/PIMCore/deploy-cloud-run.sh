#!/bin/bash

# Cloud Run Full Deployment Script for Pimcore
# This script provisions:
# 1. VPC Network & Serverless VPC Connector
# 2. Cloud SQL (MariaDB 10.11)
# 3. Cloud Memorystore (Redis)
# 4. Cloud Run Service (Application)

set -e

# --- Configuration ---
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

PROJECT_ID=$(gcloud config get-value project)
PROJECT_NUMBER=$(gcloud projects describe $PROJECT_ID --format="value(projectNumber)")
REGION=${REGION:-europe-west1} # Change to your preferred region
SERVICE_NAME=${SERVICE_NAME:-pimcore-app}
DB_INSTANCE_NAME=${DB_INSTANCE_NAME:-pimcore-db}
DB_PASSWORD=${DB_PASSWORD:-PimcoreProd123!} # Highly recommended to use Secret Manager
REDIS_INSTANCE_NAME=${REDIS_INSTANCE_NAME:-pimcore-redis}
VPC_NETWORK_NAME=${VPC_NETWORK_NAME:-pimcore-vpc}
VPC_CONNECTOR_NAME=${VPC_CONNECTOR_NAME:-pimcore-connector}

echo "---------------------------------------------------"
echo "🚀 Starting Full Deployment for $SERVICE_NAME"
echo "Project: $PROJECT_ID"
echo "Region:  $REGION"
echo "---------------------------------------------------"

# 1. Enable Required APIs
echo "✨ Enabling required GCP APIs..."
gcloud services enable \
    run.googleapis.com \
    sqladmin.googleapis.com \
    redis.googleapis.com \
    vpcaccess.googleapis.com \
    compute.googleapis.com \
    cloudbuild.googleapis.com \
    artifactregistry.googleapis.com \
    servicenetworking.googleapis.com

# 2. Setup Artifact Registry
REPO_NAME=${REPO_NAME:-cloud-run-source-deploy}
echo "📦 Checking Artifact Registry..."
if ! gcloud artifacts repositories describe $REPO_NAME --location=$REGION >/dev/null 2>&1; then
    echo "Creating Artifact Registry Repository: $REPO_NAME..."
    gcloud artifacts repositories create $REPO_NAME \
        --repository-format=docker \
        --location=$REGION \
        --description="Docker repository for Cloud Run services"
fi

# 2. Setup IAM Permissions (Fixes 403 Errors)
echo "🔑 Setting up IAM Permissions..."
# Grant roles to both potential build service accounts
for SA in "$PROJECT_NUMBER-compute@developer.gserviceaccount.com" "$PROJECT_NUMBER@cloudbuild.gserviceaccount.com"; do
    for ROLE in "roles/logging.logWriter" "roles/artifactregistry.writer" "roles/storage.objectAdmin"; do
        gcloud projects add-iam-policy-binding $PROJECT_ID \
            --member="serviceAccount:$SA" \
            --role="$ROLE" --quiet >/dev/null
    done
done

# 3. Setup Networking
echo "🌐 Setting up VPC Networking..."
if ! gcloud compute networks describe $VPC_NETWORK_NAME --format="value(name)" >/dev/null 2>&1; then
    echo "Creating VPC Network: $VPC_NETWORK_NAME..."
    gcloud compute networks create $VPC_NETWORK_NAME --subnet-mode=auto
fi

# Set up Private Service Access for SQL/Redis
echo "🔗 Setting up Private Service Access peering..."
if ! gcloud compute addresses describe pimcore-private-ip-range --global --format="value(name)" >/dev/null 2>&1; then
    gcloud compute addresses create pimcore-private-ip-range \
        --global \
        --purpose=VPC_PEERING \
        --addresses=10.1.0.0 \
        --prefix-length=16 \
        --network=$VPC_NETWORK_NAME
fi

if ! gcloud services vpc-peerings list --network=$VPC_NETWORK_NAME --format="value(service)" | grep -q "servicenetworking.googleapis.com"; then
    gcloud services vpc-peerings connect \
        --service=servicenetworking.googleapis.com \
        --ranges=pimcore-private-ip-range \
        --network=$VPC_NETWORK_NAME \
        --project=$PROJECT_ID
fi

# Create VPC Connector for Cloud Run
if ! gcloud compute networks vpc-access connectors describe $VPC_CONNECTOR_NAME --region=$REGION >/dev/null 2>&1; then
    echo "Creating Serverless VPC Access Connector: $VPC_CONNECTOR_NAME..."
    gcloud compute networks vpc-access connectors create $VPC_CONNECTOR_NAME \
        --region=$REGION \
        --network=$VPC_NETWORK_NAME \
        --range=10.8.0.0/28
fi

# Add firewall rule to allow internal VPC traffic (as suggested in request)
if ! gcloud compute firewall-rules describe pimcore-allow-internal --project=$PROJECT_ID >/dev/null 2>&1; then
    echo "Creating internal firewall rule..."
    gcloud compute firewall-rules create pimcore-allow-internal \
        --network=$VPC_NETWORK_NAME \
        --allow=tcp,udp,icmp \
        --source-ranges=10.0.0.0/8
fi

# 3. Provision Cloud SQL (MySQL 8.0)
echo "🗄️ Checking Cloud SQL Instance..."
if ! gcloud sql instances describe $DB_INSTANCE_NAME >/dev/null 2>&1; then
    echo "Creating Cloud SQL Instance (MySQL 8.0): $DB_INSTANCE_NAME..."
    gcloud sql instances create $DB_INSTANCE_NAME \
        --database-version=MYSQL_8_0 \
        --tier=db-f1-micro \
        --region=$REGION \
        --network=$VPC_NETWORK_NAME \
        --no-assign-ip \
        --root-password=$DB_PASSWORD
    
    echo "Creating database 'pimcore'..."
    gcloud sql databases create pimcore --instance=$DB_INSTANCE_NAME
fi

DB_IP=$(gcloud sql instances describe $DB_INSTANCE_NAME --format="value(ipAddresses[0].ipAddress)")

# 4. Provision Cloud Memorystore (Redis)
echo "🧠 Checking Cloud Memorystore (Redis)..."
if ! gcloud redis instances describe $REDIS_INSTANCE_NAME --region=$REGION >/dev/null 2>&1; then
    echo "Creating Redis Instance: $REDIS_INSTANCE_NAME..."
    gcloud redis instances create $REDIS_INSTANCE_NAME \
        --size=1 \
        --region=$REGION \
        --network=$VPC_NETWORK_NAME
fi

REDIS_IP=$(gcloud redis instances describe $REDIS_INSTANCE_NAME --region=$REGION --format="value(host)")
REDIS_PORT=$(gcloud redis instances describe $REDIS_INSTANCE_NAME --region=$REGION --format="value(port)")

# 5. Build Container Image
echo "🏗️ Building Container Image via Cloud Build..."
IMAGE_TAG="$REGION-docker.pkg.dev/$PROJECT_ID/$REPO_NAME/$SERVICE_NAME"
gcloud builds submit --config cloudbuild.yaml --substitutions=_IMAGE_TAG=$IMAGE_TAG .

# 6. Deploy to Cloud Run
echo "🚀 Deploying to Cloud Run..."
gcloud run deploy $SERVICE_NAME \
    --image=$IMAGE_TAG \
    --region=$REGION \
    --vpc-connector=$VPC_CONNECTOR_NAME \
    --set-env-vars="APP_ENV=prod,PIMCORE_ENVIRONMENT=prod,DATABASE_URL=mysql://root:${DB_PASSWORD}@${DB_IP}:3306/pimcore?serverVersion=8.0&charset=utf8mb4,PIMCORE_CACHE_REDIS_HOST=${REDIS_IP},PIMCORE_CACHE_REDIS_PORT=${REDIS_PORT}" \
    --allow-unauthenticated \
    --memory=2Gi \
    --cpu=1

echo "---------------------------------------------------"
echo "✅ Deployment Successful!"
SERVICE_URL=$(gcloud run services describe $SERVICE_NAME --region=$REGION --format="value(status.url)")
echo "Application URL: $SERVICE_URL"
echo "---------------------------------------------------"
