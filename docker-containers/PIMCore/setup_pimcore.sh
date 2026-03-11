#!/bin/bash
# PIMcore Vanilla Setup & BSAVA Data Import Script
# This script is intended to be run inside the project directory on the target VM.

set -e

echo "🚀 Starting PIMcore Deployment..."

# 1. Start Docker Containers
echo "📦 Starting Docker containers..."
docker-compose up -d

echo "⏳ Waiting for MySQL to be ready..."
# We use root credentials from docker-compose.yaml
until docker-compose exec -T db mysqladmin ping -h"localhost" -u"root" -p"ROOT" --silent; do
    echo "   ...waiting for database..."
    sleep 3
done

# 2. Vanilla PIMcore Installation
# This installs the core PIMcore system and sets up the admin user
echo "⚙️ Installing Vanilla PIMcore..."
docker-compose exec -T php bin/console pimcore:install --no-interaction \
    --admin-username admin --admin-password admin \
    --mysql-host db --mysql-username pimcore --mysql-password pimcore --mysql-database pimcore

# 3. Create BSAVA Schema (Classes)
# This script creates the 'Book', 'Membership', and 'EBook' classes
echo "🏗️ Creating BSAVA Classes..."
docker-compose exec -T php php create_new_classes.php

# 4. Import BSAVA Catalogue
# This script reads from ./data/catalogue.csv and populates the objects
echo "📦 Importing BSAVA Product Catalogue..."
if docker-compose exec -T php ls data/catalogue.csv > /dev/null 2>&1; then
    docker-compose exec -T php php import_bsava_catalogue.php
else
    echo "⚠️ catalogue.csv not found in container's data/ directory. Skipping import."
    echo "   Please ensure catalogue.csv is placed in $(pwd)/data/catalogue.csv"
fi

# 5. Import Assets
# This script imports sample images and links them to products
echo "🖼️ Importing Assets..."
docker-compose exec -T php php import_images.php

echo "✅ Deployment and Import Complete!"
echo "------------------------------------------------"
echo "URL Output (Dashboard): http://localhost:8080/admin"
echo "Credentials: admin / admin"
echo "------------------------------------------------"
