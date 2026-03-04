# BSAVA MACH Frontend (Next.js)

This is the headless frontend for the BSAVA website, built with Next.js 14 (App Router), TypeScript, and Tailwind CSS.

## Getting Started

### 1. Prerequisites
- Node.js 18+
- npm

### 2. Environment Setup
Copy the example environment file and fill in the secrets:
```bash
cp .env.example .env.local
```

### 3. Installation
```bash
npm install
```

### 4. Development
```bash
npm run dev
```

The site will be available at `http://localhost:3000`.

## Architecture

This frontend follows MACH principles, orchestrating several headless services:
*   **CMS**: Contentful (via `src/lib/contentful.ts`)
*   **PIM**: PIMcore (via `src/lib/pimcore.ts`)
*   **Styles**: Tailwind CSS v4 (configured in `src/app/globals.css`)
*   **Search & Discovery:** [Algolia](https://www.algolia.com/) provides lightning-fast search capabilities across unified records (indexed content from both Contentful and PIMcore).
*   **Event Management:** [Swoogo](https://swoogo.com/) handles event registration and ticketing data.
*   **CRM & Authentication:** [Salesforce / Fonteva](https://www.salesforce.com/) serves as the source of truth for user identities, SSO, memberships, and entitlements (using Connected Apps and SAML/OAuth).

For more details, see [BSAVA_MACH_ARCHITECTURE_DIAGRAM.md](./BSAVA_MACH_ARCHITECTURE_DIAGRAM.md) and [CONSTITUTION.md](./CONSTITUTION.md).

---

## 🚀 Getting Started

To set up your local development environment, follow these steps:

### Prerequisites
*   [Node.js](https://nodejs.org/) (v18 or higher recommended)
*   **npm** (comes with Node.js)
*   Access to the team's password manager (e.g., 1Password) for API keys.

### 1. Run the Setup Script
We've provided a shell script to automate the initial configuration. Run this in your terminal from the root of the project:

```bash
./setup-dev.sh
```

This script will:
*   Verify your local tool versions.
*   Copy the `.env.example` file to create a new `.env.local` file.
*   Install project dependencies using `npm install`.

### 2. Configure Environment Variables
The application requires API keys and configuration settings to connect to the MACH services.

1.  Open the newly created `.env.local` file in your editor.
2.  Obtain the required secret values from the team lead or your password manager.
3.  Fill in the values for Contentful, PIMcore, Algolia, Swoogo, and Salesforce as outlined in `.env.local`.

> **⚠️ WARNING:** Never commit `.env.local` to version control. This file is gitignored by default.

### 3. Start the Development Server
Once dependencies are installed and your `.env.local` is fully configured, start the local development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

---

## 📚 Service Integration Guides

### Requesting DEV / Sandbox Environments

To develop locally against the MACH architecture, you will need access to developer (DEV) or sandbox environments for the various integrated systems.

#### 1. Contentful (CMS)
*   **Requesting Access:** Sign up for a free Contentful account which allows you to start building without a credit card.
*   **Workflow:** Contentful uses "Spaces" as the primary workspace. To manage the DEV lifecycle, you can configure multiple isolated "Environments" within a Space (e.g., `dev`, `staging`, `production`). This allows you to safely experiment with content models and push changes programmatically using migration scripts.

#### 2. PIMcore (MDM / DAM)
*   **Requesting Access:** You can download the free, open-source Community Edition to run a local instance via Docker. Alternatively, request a pre-filled "Pimcore Demo" instance by submitting a form on the Pimcore website.
*   **Workflow:** PIMcore acts as the central data hub. Local development often involves utilizing the Pimcore Data Hub (GraphQL/REST) and configuring Data Importer push sources to test webhook ingestions (e.g., from Swoogo).
*   **Installation & Deployment:** See the dedicated [PIMcore Installation & Deployment Guide](PIMCORE_SETUP.md) for detailed instructions on running Pimcore locally via Docker and deploying it to Google Cloud Run.

#### 3. Algolia (Search)
*   **Requesting Access:** Create a free Algolia account, which includes a limited Build plan sufficient for local development and testing.
*   **Workflow:** To prevent local or staging data from polluting production search results, utilize **Multi-instance indexing**. Configure a custom "Index Prefix" (e.g., `dev-*` or `staging-*`) in your local `.env` so your data remains separated.

#### 4. Swoogo (Events)
*   **Requesting Access:** Swoogo does *not* offer a self-serve, free developer sandbox. Access requires an enterprise or professional tier. Sandbox environments are typically initiated by requesting a live demo or through BSAVA's existing enterprise agreement. Submit an IT ticket to request API credentials for the BSAVA staging environment.
*   **Workflow:** You will need to retrieve the consumer key and secret from the Swoogo user profile under "API Credentials", encode them, and request a Bearer token (valid for 30 minutes) to test API interactions.

#### 5. Salesforce / Fonteva (CRM & AMS)
*   **Requesting Access:** Sign up for a free Salesforce Developer Edition account. If you specifically need a Fonteva environment, log a case with Salesforce Architect Support to request a "Practice Org".
*   **Workflow:** You will need to create a **Connected App** within your Salesforce DEV environment to handle OAuth 2.0 authentication and obtain a Consumer Key/Secret. Ensure you configure a "My Domain" URL for any SSO/SAML testing.

---

## 📖 External Documentation Links

Refer to the official documentation for deeper insights into integrating with each of our services:
*   [Next.js Documentation](https://nextjs.org/docs)
*   [Contentful Delivery API](https://www.contentful.com/developers/docs/references/content-delivery-api/)
*   [PIMcore REST API](https://pimcore.com/docs/pimcore/current/Development_Documentation/Web_Services/index.html)
*   [Algolia Search API](https://www.algolia.com/doc/api-reference/)
*   [Swoogo API Documentation](https://swoogo.com/api-docs)
*   [Salesforce Connected Apps & APIs](https://developer.salesforce.com/docs/)

---
*If you encounter any issues during setup, please contact the platform engineering team.*
