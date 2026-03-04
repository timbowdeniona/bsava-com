# PIMcore Installation & Deployment Guide

Pimcore is a PHP/Symfony-based platform that requires a traditional server environment (PHP-FPM, Nginx/Apache) alongside a relational database (MySQL/MariaDB) and a cache (Redis). 

Because of this architecture, **Pimcore cannot be deployed to Netlify**, which is designed for static site generation and serverless functions natively tailored for JavaScript/Node.js.

The best modern way to host Pimcore is using containers. Below are instructions for running Pimcore locally via Docker, and deploying it to **Google Cloud Run** for a serverless, scalable production environment.

---

## 💻 1. Running Pimcore Locally (Docker)

The easiest way to get Pimcore running on your local machine is using [Pimcore's official Docker setup](https://github.com/pimcore/docker).

### Prerequisites
*   Docker and Docker Compose installed locally.

### Steps

1. **Create a new directory for your Pimcore project:**
   ```bash
   mkdir pimcore-local && cd pimcore-local
   ```

2. **Initialize a New Project via Docker:**
   Pimcore no longer uses a raw `docker-compose.yaml` file from a master branch. Instead, you create a new project via a temporary PHP container which downloads the latest skeleton or demo, including the `.yml` files needed. Run this to create a demo project in the current directory:
   ```bash
   docker run -u $(id -u):$(id -g) --rm -v $(pwd):/var/www/html pimcore/pimcore:php8.2-latest composer create-project pimcore/demo my-project
   ```
   *(Note: This creates a new folder named `my-project`. Once it finishes, move into that folder: `cd my-project`)*

3. **Configure Permissions and Start the Containers:**
   Inside `my-project`, you'll find a generated `docker-compose.yaml` file. Start your containers:
   ```bash
   docker compose up -d
   ```
   > **⚠️ Troubleshooting: Port 80 in use**
   > If you receive an error `failed to bind host port for 0.0.0.0:80... address already in use`, it means you have another web server (like Apache or another Docker container) occupying port 80 on your host machine. 
   > To fix this, open `docker-compose.yaml` in your editor, find the `nginx` service, and change its `ports` mapping from `"80:80"` to an unused port like `"8080:80"`. Remember to use `http://localhost:8080` in step 5 if you make this change!

4. **Install Pimcore inside the container:**
   Once the containers are running, execute the Pimcore console to install the application schema.
   ```bash
   docker compose exec php vendor/bin/pimcore-install --admin-username=admin --admin-password=pimcore --mysql-host-socket=db --mysql-username=pimcore --mysql-password=pimcore --mysql-database=pimcore
   ```

5. **Access the Application:**
   *   **Frontend:** `http://localhost`
   *   **Admin Backend:** `http://localhost/admin` 
   *   **Credentials:** Username `admin` / Password `pimcore`

---

## ☁️ 2. Deploying Pimcore to Google Cloud Run

To deploy Pimcore to Google Cloud Run, we need to build a single Docker image containing the web server (Nginx/Apache) and PHP-FPM, and connect it to managed services for the database and cache.

### Architectural Setup on GCP
*   **Compute:** Google Cloud Run (runs the Pimcore Docker container).
*   **Database:** Cloud SQL (Managed MySQL or MariaDB).
*   **Assets/Storage:** Cloud Storage (GCS) mounted via GCS FUSE or using a Flysystem adapter, because Cloud Run instances are stateless and their local file system disappears when the container scales down.
*   **Cache:** Memorystore (Managed Redis).

### Step 1: Prepare the Dockerfile
Create a `Dockerfile` in the root of your Pimcore repository that packages PHP, Nginx, and your Pimcore source code. 

```dockerfile
# Use an official PHP-Apache or Nginx-PHP image
FROM php:8.2-apache

# Install required PHP extensions for Pimcore (GD, Intl, PDO MySQL, Zip, Exif, etc.)
RUN apt-get update && apt-get install -y \
    libfreetype6-dev \
    libjpeg62-turbo-dev \
    libpng-dev \
    libicu-dev \
    libzip-dev \
    wget \
    git \
    unzip \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j$(nproc) gd intl pdo_mysql zip exif opcache

# Enable Apache mod_rewrite
RUN a2enmod rewrite

# Copy Pimcore application files and set permissions
COPY . /var/www/html/
RUN chown -R www-data:www-data /var/www/html/var /var/www/html/public/var

# Define the Document Root to the Pimcore public folder
ENV APACHE_DOCUMENT_ROOT /var/www/html/public
RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/sites-available/*.conf

EXPOSE 8080
RUN sed -i 's/80/8080/g' /etc/apache2/sites-available/000-default.conf /etc/apache2/ports.conf
```

### Step 2: Configure the Database (Cloud SQL)
1. Go to the GCP Console and create a **Cloud SQL for MySQL** instance.
2. Create a database named `pimcore` and a user.
3. Determine the instance connection name (e.g., `project-id:region:instance-name`).

### Step 3: Configure Cloud Storage (Assets)
Pimcore saves uploaded media to the local disk (`/public/var/assets`). Because Cloud Run is stateless, you must configure a remote file system.
1. Create a Google Cloud Storage bucket.
2. Install the `league/flysystem-google-cloud-storage` adapter in your Pimcore project via Composer.
3. Update Pimcore's `config/packages/flysystem.yaml` to route asset storage to the GCS bucket.

### Step 4: Build and Push the Container
Use Google Cloud Build to build the image and push it to the Artifact Registry:
```bash
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/pimcore-app
```

### Step 5: Deploy to Cloud Run
Deploy the image, ensuring you connect it to the Cloud SQL instance and inject the necessary environment variables.

```bash
gcloud run deploy pimcore-app \
  --image gcr.io/YOUR_PROJECT_ID/pimcore-app \
  --platform managed \
  --region YOUR_REGION \
  --allow-unauthenticated \
  --add-cloudsql-instances YOUR_PROJECT_ID:YOUR_REGION:YOUR_CLOUD_SQL_INSTANCE_NAME \
  --set-env-vars DATABASE_URL="mysql://USER:PASSWORD@localhost/pimcore?unix_socket=/cloudsql/YOUR_PROJECT_ID:YOUR_REGION:YOUR_CLOUD_SQL_INSTANCE_NAME" \
  --set-env-vars APP_ENV="prod"
```

*Note: The `DATABASE_URL` connects via the Cloud SQL proxy socket injected automatically by the `--add-cloudsql-instances` flag.*

---
### Summary of GCP Resources Needed
To run this in production, you will need the following APIs enabled in your GCP project:
- Cloud Run API
- Cloud SQL Admin API
- Artifact Registry API
- Cloud Build API
