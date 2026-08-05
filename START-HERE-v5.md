# EasyInvoice v5 — Direct Supabase Tables

This version replaces the single JSON workspace row with individual database rows.

## 1. Run the SQL

Open `supabase-direct-tables-setup.sql`.

Replace all four occurrences of `PASTE_PRIVATE_WORKSPACE_TOKEN` with the exact `workspaceId` already used in `config.js`, then run the full script in Supabase SQL Editor.

The script creates:

- `ei_customers`
- `ei_materials`
- `ei_invoices`
- `ei_invoice_items`

It does not delete the old `easyinvoice_workspaces` row or your earlier tables.

## 2. Keep your existing config.js

Your current Supabase URL, publishable key and workspaceId should remain unchanged.

## 3. Open through Live Server

On first load, if the new tables are empty, the app automatically imports the customers, materials and invoices currently stored in that browser. The imported rows receive Supabase-generated numeric IDs.

Do not repeatedly clear the new tables and reload the app unless you intentionally want to run the migration again.

## 4. Verify

In Supabase Table Editor, open `ei_customers`. You should see one customer per row, including `CLOUD TEST CUSTOMER`, with a normal numeric ID.

Add another customer in the app and refresh `ei_customers`; the new record should appear immediately as its own row.

## Security note

This is still a no-login build. The workspace token is embedded in browser code and is not equivalent to authentication. Use it for testing and controlled access only; add Supabase Auth before storing sensitive production billing data on a public site.
