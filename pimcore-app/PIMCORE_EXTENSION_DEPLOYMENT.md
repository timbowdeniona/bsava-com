# Deploying your Pimcore Contentful Extension

To make this extension available to other users in your Contentful space, you need to host the code and register the production URLs.

## 1. Host the Backend Proxy
The Node.js middleware (`server/index.js`) must be hosted on a platform that supports Node.js (e.g., Heroku, Render, DigitalOcean, or your own server).

1.  Set up your hosting environment.
2.  Configure environment variables on the host:
    -   `PIMCORE_BACKEND_URL`
    -   `PIMCORE_API_KEY`
    -   `PORT` (usually 3001)
3.  Deploy the code in `pimcore-app/`.
4.  Note your production proxy URL (e.g., `https://your-pimcore-proxy.herokuapp.com/pimcore`).

## 2. Build and Host the Frontend
The React app must be built and hosted on a static hosting provider (e.g., Vercel, Netlify, or Contentful's App Hosting).

### Option A: External Hosting (Vercel/Netlify)
1.  Create a production `.env` file (or set variables in your hosting UI):
    ```bash
    REACT_APP_PIMCORE_PROXY_URL=https://your-pimcore-proxy.herokuapp.com/pimcore
    REACT_APP_PIMCORE_ADMIN_URL=https://your-pimcore-admin.com
    ```
2.  Build the project:
    ```bash
    cd pimcore-app
    npm install
    npm run build
    ```
3.  Deploy the contents of the `build/` folder.
4.  Note your frontend production URL (e.g., `https://pimcore-picker.vercel.app`).

### Option B: Contentful-hosted (Frontend Only)
You can upload your built assets directly to Contentful:
1. Install scripts: `npm install --save-dev @contentful/app-scripts`
2. Run: `npx contentful-app-scripts upload --bundle-dir ./build`
3. Follow the CLI prompts to select your organization and app.

## 3. Update Contentful App Definition
1.  Go to **Organization Settings** > **Apps** in Contentful.
2.  Find your **Pimcore Picker** app.
3.  Update the **App URL** to your production frontend URL (e.g., `https://pimcore-picker.vercel.app`).
4.  If using "Hosted by Contentful", the URL will be automatically managed.

## 4. Permissions and CORS
-   **Pimcore**: Ensure your Pimcore Data Hub allows requests from your backend proxy IP.
-   **Proxy**: Ensure your Express proxy allows CORS from your production frontend URL. Updated `server/index.js` already uses `cors()`, which defaults to allowing all, but for production, you should restrict it:
    ```javascript
    app.use(cors({
      origin: ['https://pimcore-picker.vercel.app', 'https://app.contentful.com']
    }));
    ```

## 5. Installing the App in the Space
1.  Navigate to your **Space** > **Apps** > **Manage Apps**.
2.  Locate **Pimcore Picker** and click **Install**.
3.  Follow the configuration steps to apply it to your Content Types.
