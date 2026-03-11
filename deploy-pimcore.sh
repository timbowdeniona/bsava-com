#!/bin/bash
# ==============================================================================
# Pimcore Vanilla + DataHub + GCS Deployment Script for Google Cloud Run
# Project: bsava-com
# ==============================================================================

set -e # Exit immediately if a command exits with a non-zero status

# --- Configuration Variables ---
PROJECT_ID="bsava-com"
REGION="europe-west2" # London - change if needed
DB_INSTANCE="pimcore-db-instance"
DB_NAME="pimcore"
DB_USER="pimcore_user"
DB_PASS="ChangeThisStrongPassword123!" # IMPORTANT: Change this!
BUCKET_NAME="${PROJECT_ID}-pimcore-assets"
REPO_NAME="pimcore-repo"
SERVICE_NAME="pimcore-app"

# Derived Variables
IMAGE_PATH="${REGION}-docker.pkg.dev/${PROJECT_ID}/${REPO_NAME}/pimcore-vanilla:latest"
CLOUDSQL_CONNECTION_NAME="${PROJECT_ID}:${REGION}:${DB_INSTANCE}"
# Doctrine connection string using Unix Socket for Cloud Run
DATABASE_URL="mysql://${DB_USER}:${DB_PASS}@localhost/${DB_NAME}?unix_socket=/cloudsql/${CLOUDSQL_CONNECTION_NAME}&charset=utf8mb4"

echo "🚀 Starting Pimcore infrastructure deployment for $PROJECT_ID..."

# 1. Enable Required Google Cloud APIs
echo "Enabling necessary Google Cloud APIs..."
gcloud services enable \
  run.googleapis.com \
  sqladmin.googleapis.com \
  artifactregistry.googleapis.com \
  cloudbuild.googleapis.com \
  compute.googleapis.com

# 2. Create Artifact Registry Repository
echo "Creating Artifact Registry repository..."
if ! gcloud artifacts repositories describe $REPO_NAME --location=$REGION >/dev/null 2>&1; then
  gcloud artifacts repositories create $REPO_NAME \
    --repository-format=docker \
    --location=$REGION \
    --description="Docker repository for Pimcore"
fi

# 3. Create Cloud SQL Instance & Database (This takes ~5-10 minutes)
echo "Provisioning Cloud SQL (MySQL) instance... (This will take a few minutes)"
if ! gcloud sql instances describe $DB_INSTANCE >/dev/null 2>&1; then
  gcloud sql instances create $DB_INSTANCE \
    --database-version=MYSQL_8_0 \
    --tier=db-f1-micro \
    --region=$REGION
fi

echo "Creating database and user..."
gcloud sql databases create $DB_NAME --instance=$DB_INSTANCE || true
gcloud sql users create $DB_USER --instance=$DB_INSTANCE --password=$DB_PASS || true

# 4. Create Google Cloud Storage Bucket & Make Public
echo "Creating GCS Bucket for Assets..."
if ! gcloud storage buckets describe gs://$BUCKET_NAME >/dev/null 2>&1; then
  gcloud storage buckets create gs://$BUCKET_NAME --location=$REGION
  # Make bucket publicly readable for assets
  gcloud storage buckets add-iam-policy-binding gs://$BUCKET_NAME \
    --member="allUsers" \
    --role="roles/storage.objectViewer"
fi

# 5. Get Project Number and Assign IAM Roles
echo "Configuring IAM Permissions..."
PROJECT_NUMBER=$(gcloud projects describe $PROJECT_ID --format="value(projectNumber)")
COMPUTE_SA="${PROJECT_NUMBER}-compute@developer.gserviceaccount.com"

# Grant the default compute service account Admin rights to the bucket so Flysystem can write to it
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:${COMPUTE_SA}" \
  --role="roles/storage.objectAdmin"

# Grant Cloud SQL Client role so Cloud Run can connect to the database
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:${COMPUTE_SA}" \
  --role="roles/cloudsql.client"

# 6. Generate Local Code and Configurations
echo "Generating Dockerfile and configuration files..."
mkdir -p build_context/config/packages
cd build_context

# --- Create Dockerfile ---
cat << 'EOF' > Dockerfile
FROM php:8.2-apache

# Install dependencies
RUN apt-get update && apt-get install -y \
    libicu-dev libzip-dev libpng-dev libjpeg-dev libfreetype6-dev git unzip \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install intl pdo pdo_mysql zip gd exif \
    && a2enmod rewrite

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer
WORKDIR /var/www/html

# Create Pimcore project and install required bundles
RUN COMPOSER_MEMORY_LIMIT=-1 composer create-project pimcore/skeleton . \
    && COMPOSER_MEMORY_LIMIT=-1 composer require pimcore/data-hub league/flysystem-google-cloud-storage

# Copy over custom GCS configurations
COPY config/ /var/www/html/config/

# Configure Apache for Cloud Run (Port 8080)
ENV APACHE_DOCUMENT_ROOT /var/www/html/public
RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/sites-available/*.conf \
    && sed -ri -e 's!/var/www/!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/apache2.conf /etc/apache2/conf-available/*.conf \
    && sed -i 's/80/8080/g' /etc/apache2/sites-available/000-default.conf /etc/apache2/ports.conf

# Fix permissions
RUN chown -R www-data:www-data /var/www/html
EXPOSE 8080
CMD ["apache2-foreground"]
EOF

# --- Create services.yaml (GCS Client) ---
cat << 'EOF' > config/services.yaml
services:
    google.storage.client:
        class: Google\Cloud\Storage\StorageClient
        arguments:
            - projectId: '%env(GOOGLE_CLOUD_PROJECT)%'
EOF

# --- Create flysystem.yaml (Map storage to GCS) ---
cat << 'EOF' > config/packages/flysystem.yaml
flysystem:
    storages:
        pimcore.asset.storage:
            adapter: 'google_cloud_storage'
            visibility: public
            options:
                client: 'google.storage.client'
                bucket: '%env(GCS_BUCKET_NAME)%'
                prefix: 'assets'
        pimcore.thumbnail.storage:
            adapter: 'google_cloud_storage'
            visibility: public
            options:
                client: 'google.storage.client'
                bucket: '%env(GCS_BUCKET_NAME)%'
                prefix: 'thumbnails'
        pimcore.version.storage:
            adapter: 'google_cloud_storage'
            visibility: private
            options:
                client: 'google.storage.client'
                bucket: '%env(GCS_BUCKET_NAME)%'
                prefix: 'versions'
EOF

# --- Create pimcore.yaml (Asset URLs) ---
cat << 'EOF' > config/packages/pimcore.yaml
pimcore:
    assets:
        frontend_prefixes:
            source: 'https://storage.googleapis.com/%env(GCS_BUCKET_NAME)%/assets'
            thumbnail: 'https://storage.googleapis.com/%env(GCS_BUCKET_NAME)%/thumbnails'
EOF

# 7. Build and Push the Docker Image using Cloud Build
echo "Building and pushing Docker image to Artifact Registry..."
gcloud builds submit --tag $IMAGE_PATH

# 8. Deploy to Cloud Run
echo "Deploying container to Google Cloud Run..."
gcloud run deploy $SERVICE_NAME \
  --image=$IMAGE_PATH \
  --region=$REGION \
  --add-cloudsql-instances=$CLOUDSQL_CONNECTION_NAME \
  --set-env-vars=DATABASE_URL="$DATABASE_URL",GOOGLE_CLOUD_PROJECT="$PROJECT_ID",GCS_BUCKET_NAME="$BUCKET_NAME" \
  --allow-unauthenticated \
  --port=8080 \
  --memory=2Gi \
  --cpu=1

# 9. Execute Cloud Run Job to Install Pimcore Database
echo "Creating Cloud Run Job for initial Pimcore installation..."
JOB_NAME="${SERVICE_NAME}-install"
gcloud run jobs create $JOB_NAME \
  --image=$IMAGE_PATH \
  --region=$REGION \
  --add-cloudsql-instances=$CLOUDSQL_CONNECTION_NAME \
  --set-env-vars=DATABASE_URL="$DATABASE_URL",GOOGLE_CLOUD_PROJECT="$PROJECT_ID",GCS_BUCKET_NAME="$BUCKET_NAME" \
  --command="vendor/bin/pimcore-install" \
  --args="--admin-username=admin,--admin-password=pimcoreadmin,--no-interaction"

echo "Executing installation job..."
gcloud run jobs execute $JOB_NAME --region=$REGION --wait

echo "✅ Deployment complete!"
SERVICE_URL=$(gcloud run services describe $SERVICE_NAME --region=$REGION --format="value(status.url)")
echo "🌍 Your Pimcore instance is live at: $SERVICE_URL"
echo "🔐 Admin credentials -> User: admin | Password: pimcoreadmin"
echo "Next steps: Log in, configure your GraphQL schema in the DataHub, and change your admin password!"