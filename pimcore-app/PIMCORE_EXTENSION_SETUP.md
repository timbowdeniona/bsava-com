# Contentful Pimcore Extension Setup

This extension allows editors to browse, search, and link live product data from Pimcore directly into Contentful entries.

## Project Structure
- `pimcore-app/src`: Frontend React app (Forma 36).
- `pimcore-app/server`: Node.js middleware proxy for Pimcore Data Hub.
- `pimcore-app/PimcoreService.js`: GraphQL client logic.

## Prerequisites
1.  **Pimcore Data Hub**: Ensure the GraphQL API is enabled and you have an API Key.
2.  **Environment Variables**: Create a `.env` file in `pimcore-app/`:
    ```bash
    PIMCORE_BACKEND_URL=https://your-pimcore-admin.com
    PIMCORE_API_KEY=your_pimcore_api_key
    REACT_APP_PIMCORE_PROXY_URL=http://localhost:3001/pimcore
    ```

## Development
Run the backend proxy:
```bash
cd pimcore-app
npm install
npm run server
```

Run the frontend (Contentful App):
```bash
cd pimcore-app
npm start
```

## Configuration in Contentful
1.  Navigate to **App Definitions** in your Contentful space.
2.  Create a new App named **Pimcore Picker**.
3.  Set the **App URL** to `http://localhost:3000` (for development).
4.  Add the **Field** and **Sidebar** locations.
5.  In your Content Type, create a JSON field (e.g., `linkedPimcoreProduct`) and set the **Appearance** to use the **Pimcore Picker** app.

## Features
- **Live Search**: Query by SKU or Name.
- **Product Preview**: View thumbnails, price, and status before linking.
- **Deep Linking**: Quick access to Pimcore records.
- **Single Source of Truth**: Only IDs/SKUs are stored in Contentful.
