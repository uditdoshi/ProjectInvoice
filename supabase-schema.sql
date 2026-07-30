-- Run this in the Supabase SQL Editor for TESTING WITHOUT LOGIN.
-- WARNING: the policies below allow anyone who knows the project URL/key to read and write.
-- Replace them with authenticated policies before real production use.

create table if not exists public.easyinvoice_workspaces (
  workspace_id text primary key,
  payload jsonb not null default '{"customers":[],"items":[],"invoices":[]}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.easyinvoice_workspaces enable row level security;

create policy "temporary public read"
on public.easyinvoice_workspaces for select
to anon
using (true);

create policy "temporary public insert"
on public.easyinvoice_workspaces for insert
to anon
with check (true);

create policy "temporary public update"
on public.easyinvoice_workspaces for update
to anon
using (true)
with check (true);
