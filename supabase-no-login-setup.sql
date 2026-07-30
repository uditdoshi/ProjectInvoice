-- EasyInvoice no-login prototype setup.
-- Replace BOTH occurrences of PASTE_PRIVATE_WORKSPACE_TOKEN with the same long random token
-- used in config.js. Keep the quotation marks.

create table if not exists public.easyinvoice_workspaces (
  workspace_id text primary key,
  payload jsonb not null default '{"customers":[],"items":[],"invoices":[]}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.easyinvoice_workspaces enable row level security;

drop policy if exists "easyinvoice workspace read" on public.easyinvoice_workspaces;
drop policy if exists "easyinvoice workspace insert" on public.easyinvoice_workspaces;
drop policy if exists "easyinvoice workspace update" on public.easyinvoice_workspaces;

create policy "easyinvoice workspace read"
on public.easyinvoice_workspaces for select to anon
using (workspace_id = 'easyinvoice-shree-7f92b3c9d7x5411a81z2026private');

create policy "easyinvoice workspace insert"
on public.easyinvoice_workspaces for insert to anon
with check (workspace_id = 'easyinvoice-shree-7f92b3c9d7x5411a81z2026private');

create policy "easyinvoice workspace update"
on public.easyinvoice_workspaces for update to anon
using (workspace_id = 'easyinvoice-shree-7f92b3c9d7x5411a81z2026private')
with check (workspace_id = 'easyinvoice-shree-7f92b3c9d7x5411a81z2026private');
