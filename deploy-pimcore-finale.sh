#!/bin/bash
# ==============================================================================
# Pimcore Deployment - THE FINALE (Updated for PHP 8.3 & AMQP)
# Project: bsava-com
# ==============================================================================

set -e

# --- Configuration Variables ---
PROJECT_ID="bsava-com"
REGION="europe-west2"
DB_INSTANCE="pimcore-db-instance"
DB_NAME="pimcore"
DB_USER="pimcore_user"
DB_PASS="ChangeThisStrongPassword123!" # IMPORTANT: Ensure this matches Part 1!
BUCKET_NAME="${PROJECT_ID}-pimcore-assets"
REPO_NAME="pimcore-repo"
SERVICE_NAME="pimcore-app"

IMAGE_PATH="${REGION}-docker.pkg.dev/${PROJECT_ID}/${REPO_NAME}/pimcore-vanilla:latest"
CLOUDSQL_CONNECTION_NAME="${PROJECT_ID}:${REGION}:${DB_INSTANCE}"
DATABASE_URL="mysql://${DB_USER}:${DB_PASS}@localhost/${DB_NAME}?unix_socket=/cloudsql/${CLOUDSQL_CONNECTION_NAME}&charset=utf8mb4"

echo "🚀 Kicking off the final deployment phases with PHP 8.3..."

# 5. Get Project Number and Assign IAM Roles (Safe to run again)
echo "Configuring IAM Permissions for Cloud Run..."
PROJECT_NUMBER=$(gcloud projects describe $PROJECT_ID --format="value(projectNumber)")
COMPUTE_SA="${PROJECT_NUMBER}-compute@developer.gserviceaccount.com"

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:${COMPUTE_SA}" \
  --role="roles/storage.objectAdmin"

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:${COMPUTE_SA}" \
  --role="roles/cloudsql.client"

# 6. Generate Local Code and Configurations
echo "Generating Dockerfile and configuration files..."
mkdir -p build_context/config/packages
cd build_context

# --- Create Dockerfile (UPDATED TO PHP 8.3 AND AMQP) ---
cat << 'EOF' > Dockerfile
FROM php:8.3-apache

# Install dependencies, including librabbitmq-dev for the amqp extension
RUN apt-get update && apt-get install -y \
    libicu-dev libzip-dev libpng-dev libjpeg-dev libfreetype6-dev git unzip librabbitmq-dev \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install intl pdo pdo_mysql zip gd exif \
    && pecl install amqp \
    && docker-php-ext-enable amqp \
    && a2enmod rewrite

# Install Composer
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

# --- Create services.yaml ---
cat << 'EOF' > config/services.yaml
services:
    google.storage.client:
        class: Google\Cloud\Storage\StorageClient
        arguments:
            - projectId: '%env(GOOGLE_CLOUD_PROJECT)%'
EOF

# --- Create flysystem.yaml (Public visibility) ---
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

# --- Create pimcore.yaml ---
cat << 'EOF' > config/packages/pimcore.yaml
pimcore:
    assets:
        frontend_prefixes:
            source: 'https://storage.googleapis.com/%env(GCS_BUCKET_NAME)%/assets'
            thumbnail: 'https://storage.googleapis.com/%env(GCS_BUCKET_NAME)%/thumbnails'
EOF

# 7. Build and Push the Docker Image
echo "Building and pushing Docker image to Artifact Registry (this will take a few minutes)..."
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
  --args="--admin-username=admin,--admin-password=pimcoreadmin,--no-interaction" || true

echo "Executing installation job..."
gcloud run jobs execute $JOB_NAME --region=$REGION --wait

echo "✅ Deployment complete!"
SERVICE_URL=$(gcloud run services describe $SERVICE_NAME --region=$REGION --format="value(status.url)")
echo "🌍 Your Pimcore instance is live at: $SERVICE_URL"
echo "🔐 Admin credentials -> User: admin | Password: pimcoreadmin"