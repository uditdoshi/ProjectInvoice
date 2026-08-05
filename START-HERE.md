# EasyInvoice v4 — Start here

1. Open `supabase-no-login-setup.sql`.
2. Replace both `PASTE_PRIVATE_WORKSPACE_TOKEN` values with one long random value, for example a 40+ character random string.
3. Run the SQL in Supabase SQL Editor. The five earlier tables can remain; this version uses `easyinvoice_workspaces`.
4. Open `config.js` and paste your Supabase Project URL, publishable key, and the exact same workspace token.
5. Open this folder in VS Code and run `index.html` with Live Server.
6. Open Backup and confirm it says **Cloud connected**.

## Important security limitation

This is a no-login static web app. The workspace token limits accidental access, but it is present in browser code and therefore is not strong authentication. This setup is appropriate for development/testing. Before entering real private billing data on a publicly hosted site, add Supabase Authentication or a private server-side API.
