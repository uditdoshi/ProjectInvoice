-- EasyInvoice v5: direct-table storage without a login.
-- Replace EVERY occurrence of PASTE_PRIVATE_WORKSPACE_TOKEN with the exact workspaceId from config.js.
-- This creates new ei_* tables and does not delete your existing tables or JSON workspace row.

create table if not exists public.ei_customers (
  id bigint generated always as identity primary key,
  workspace_id text not null,
  name text not null,
  address1 text not null default '', address2 text not null default '', city text not null default '',
  state text not null default '', pincode text not null default '', gstin text not null default '',
  phone text not null default '', email text not null default '', cst_tin text not null default '', vat_tin text not null default '',
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create index if not exists ei_customers_workspace_name_idx on public.ei_customers(workspace_id, name);

create table if not exists public.ei_materials (
  id bigint generated always as identity primary key,
  workspace_id text not null,
  code text not null default '', description text not null, hsn text not null default '',
  gst_rate numeric(7,2) not null default 0, default_rate numeric(14,2) not null default 0,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create index if not exists ei_materials_workspace_description_idx on public.ei_materials(workspace_id, description);

create table if not exists public.ei_invoices (
  id bigint generated always as identity primary key,
  workspace_id text not null,
  invoice_number text not null, invoice_date date not null, due_date date, payment_terms text not null default '',
  customer_id bigint references public.ei_customers(id) on delete set null,
  customer_snapshot jsonb not null default '{}'::jsonb, shipping_snapshot jsonb not null default '{}'::jsonb,
  transporter text not null default '', vehicle_no text not null default '', broker text not null default '',
  lr_no text not null default '', lr_date date, other_charges numeric(14,2) not null default 0,
  notes text not null default '', subtotal numeric(14,2) not null default 0, cgst numeric(14,2) not null default 0,
  sgst numeric(14,2) not null default 0, igst numeric(14,2) not null default 0, grand_total numeric(14,2) not null default 0,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  unique(workspace_id, invoice_number)
);
create index if not exists ei_invoices_workspace_date_idx on public.ei_invoices(workspace_id, invoice_date desc);

create table if not exists public.ei_invoice_items (
  id bigint generated always as identity primary key,
  workspace_id text not null,
  invoice_id bigint not null references public.ei_invoices(id) on delete cascade,
  line_no integer not null, material_id bigint references public.ei_materials(id) on delete set null,
  description text not null, hsn text not null default '', quantity numeric(14,3) not null default 0,
  rate numeric(14,2) not null default 0, gst_rate numeric(7,2) not null default 0, amount numeric(14,2) not null default 0
);
create index if not exists ei_invoice_items_invoice_idx on public.ei_invoice_items(invoice_id, line_no);

alter table public.ei_customers enable row level security;
alter table public.ei_materials enable row level security;
alter table public.ei_invoices enable row level security;
alter table public.ei_invoice_items enable row level security;

-- Re-running this script is safe. These DROP POLICY statements do not remove tables or business data.
drop policy if exists "ei customers workspace access" on public.ei_customers;
drop policy if exists "ei materials workspace access" on public.ei_materials;
drop policy if exists "ei invoices workspace access" on public.ei_invoices;
drop policy if exists "ei invoice items workspace access" on public.ei_invoice_items;

create policy "ei customers workspace access" on public.ei_customers for all to anon
using (workspace_id = 'PASTE_PRIVATE_WORKSPACE_TOKEN') with check (workspace_id = 'PASTE_PRIVATE_WORKSPACE_TOKEN');
create policy "ei materials workspace access" on public.ei_materials for all to anon
using (workspace_id = 'PASTE_PRIVATE_WORKSPACE_TOKEN') with check (workspace_id = 'PASTE_PRIVATE_WORKSPACE_TOKEN');
create policy "ei invoices workspace access" on public.ei_invoices for all to anon
using (workspace_id = 'PASTE_PRIVATE_WORKSPACE_TOKEN') with check (workspace_id = 'PASTE_PRIVATE_WORKSPACE_TOKEN');
create policy "ei invoice items workspace access" on public.ei_invoice_items for all to anon
using (workspace_id = 'PASTE_PRIVATE_WORKSPACE_TOKEN') with check (workspace_id = 'PASTE_PRIVATE_WORKSPACE_TOKEN');


-- EasyInvoice v7: atomic financial-year invoice numbering.
-- Format: 2026-27/0001. Indian financial year runs from April 1 through March 31.
create table if not exists public.ei_invoice_sequences (
  workspace_id text not null,
  fiscal_year_start integer not null,
  last_number integer not null default 0,
  updated_at timestamptz not null default now(),
  primary key (workspace_id, fiscal_year_start)
);

alter table public.ei_invoice_sequences enable row level security;
drop policy if exists "ei invoice sequences workspace access" on public.ei_invoice_sequences;
create policy "ei invoice sequences workspace access" on public.ei_invoice_sequences for all to anon
using (workspace_id = 'PASTE_PRIVATE_WORKSPACE_TOKEN')
with check (workspace_id = 'PASTE_PRIVATE_WORKSPACE_TOKEN');

create or replace function public.ei_next_invoice_number(p_workspace_id text, p_invoice_date date)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  fy_start integer;
  next_value integer;
  fy_label text;
begin
  if p_workspace_id <> 'PASTE_PRIVATE_WORKSPACE_TOKEN' then
    raise exception 'Invalid workspace';
  end if;

  fy_start := case
    when extract(month from p_invoice_date) >= 4 then extract(year from p_invoice_date)::integer
    else extract(year from p_invoice_date)::integer - 1
  end;

  fy_label := fy_start::text || '-' || right((fy_start + 1)::text, 2);

  insert into public.ei_invoice_sequences(workspace_id, fiscal_year_start, last_number)
  values (
    p_workspace_id,
    fy_start,
    coalesce((
      select max(substring(invoice_number from '/([0-9]{4})$')::integer)
      from public.ei_invoices
      where workspace_id = p_workspace_id
        and invoice_number like fy_label || '/____'
    ), 0) + 1
  )
  on conflict (workspace_id, fiscal_year_start)
  do update set last_number = public.ei_invoice_sequences.last_number + 1, updated_at = now()
  returning last_number into next_value;

  return fy_label || '/' || lpad(next_value::text, 4, '0');
end;
$$;

grant execute on function public.ei_next_invoice_number(text,date) to anon;
