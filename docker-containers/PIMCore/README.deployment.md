# Pimcore Deployment to Google Cloud Run

This project includes a comprehensive deployment setup to run Pimcore on Google Cloud Run with fully automated infrastructure provisioning.

## 📦 What's Included

1.  **`Dockerfile.cloudrun`**: A production-optimized container running Nginx, PHP-FPM, and Pimcore workers via Supervisor.
2.  **`deploy-cloud-run.sh`**: A bash script that orchestrates the entire GCP setup:
    *   Enables necessary APIs.
    *   Creates a VPC Network and Serverless VPC Access Connector.
    *   Sets up internal VPC Firewall rules.
    *   Provisions Cloud SQL (MySQL 8.0).
    *   Provisions Cloud Memorystore (Redis).
    *   Builds and deploys the application to Cloud Run.

## 🚀 How to Deploy

1.  **Install gcloud CLI**: Ensure you have the [Google Cloud CLI](https://cloud.google.com/sdk/docs/install) installed.
2.  **Authenticate**:
    ```bash
    gcloud auth login
    gcloud auth application-default login
    ```
3.  **Set your project**:
    ```bash
    gcloud config set project YOUR_PROJECT_ID
    ```
4.  **Run the deployment script**:
    ```bash
    ./deploy-cloud-run.sh
    ```

## ⚙️ Configuration

You can customize the deployment by setting environment variables before running the script:

| Variable | Default | Description |
| :--- | :--- | :--- |
| `REGION` | `europe-west1` | GCP Region for all resources |
| `SERVICE_NAME` | `pimcore-app` | Name of the Cloud Run service |
| `DB_PASSWORD` | `PimcoreProd123!` | Root password for Cloud SQL (Recommended to change!) |

Example:
```bash
REGION=us-central1 SERVICE_NAME=my-pimcore ./deploy-cloud-run.sh
```

## ⚠️ Important Considerations

*   **Persistent Storage**: Cloud Run has an ephemeral filesystem. Any files uploaded directly to the container will be lost. To handle assets in production, you **must** configure the `pimcore/google-cloud-bundle` to use Google Cloud Storage.
*   **Costs**: Provisioning Cloud SQL and Redis instances will incur hourly costs on your GCP account.
*   **Permissions**: The user/account running the script must have `Owner` or `Editor` permissions on the GCP project to create networking and database resources.
