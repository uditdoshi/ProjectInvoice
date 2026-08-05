# EasyInvoice v3

A mobile-first invoice app for Shree Polymers. It runs as a static website, so it can be hosted on GitHub Pages. It also works locally for testing.

## What is included

- Create, preview, print and save invoices
- Customer and material master management
- Imported customer/material seed data from the original Excel workbook
- Device-local invoice history
- JSON backup and restore
- Installable Progressive Web App (PWA)
- Offline caching after the first hosted visit
- Optional Supabase cloud upload/download
- GitHub Pages-compatible file structure

## Test in VS Code

Open this folder in VS Code and use Live Server. Open `index.html` and click **Go Live**.

Opening `index.html` directly also works for most features, but PWA installation and offline caching require `http://` or `https://`.

## Publish on GitHub Pages

1. Create a GitHub repository such as `easyinvoice`.
2. Upload the contents of this folder so `index.html` is in the repository root.
3. In GitHub, open **Settings → Pages**.
4. Choose **Deploy from a branch**, select `main`, and choose `/ (root)`.
5. Open the GitHub Pages URL on the phone.

## Local mode

Cloud sync is disabled by default in `config.js`. Customers, materials and invoices are saved in the current browser. Use **Backup → Download backup** regularly.

## Enable Supabase cloud sync for testing

1. Create a Supabase project.
2. Open the SQL Editor and run `supabase-schema.sql`.
3. In Supabase project settings, copy the Project URL and publishable key.
4. Edit `config.js`:

```js
window.EASYINVOICE_CONFIG = {
  cloud: {
    enabled: true,
    supabaseUrl: "https://YOUR-PROJECT.supabase.co",
    supabasePublishableKey: "sb_publishable_...",
    workspaceId: "shree-polymers"
  }
};
```

5. Push the change to GitHub and refresh the app.
6. Use **Backup → Upload to cloud** from the device containing the correct data.
7. On another device, use **Download from cloud**.

## Security warning

The included Supabase SQL policies are deliberately open for temporary testing without login. Anyone who obtains the Supabase project URL and publishable key could access the cloud record. Do not use those temporary policies for long-term real billing data.

Before production use, add authentication or a protected server-side sync endpoint and replace the temporary public policies.

## Updating the app

After changing files, update the cache version near the top of `service-worker.js`, for example:

```js
const CACHE = 'easyinvoice-v4';
```

This ensures phones receive the newest version instead of an older cached copy.
