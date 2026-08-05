# EasyInvoice v7

- Financial-year invoice numbering in `YYYY-YY/0001` format.
- Indian financial year: April 1 to March 31.
- Invoice numbers are allocated atomically by Supabase on first Preview or Save.
- Added a six-digit PIN lock screen and Lock button.
- Default demonstration PIN: `123456`. Change the PIN hash in `config.js` before real use.
- Updated service-worker cache to v7.

## Required Supabase step
Re-run `supabase-direct-tables-setup.sql` after replacing every `PASTE_PRIVATE_WORKSPACE_TOKEN` with the workspace ID already used in `config.js`.
