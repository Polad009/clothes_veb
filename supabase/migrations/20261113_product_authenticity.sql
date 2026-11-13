-- Authenticity codes: one random code per physical garment, printed as a QR on its label.
-- Applied to production on 2026-11-13.
-- Scanning opens /v/<code>, which shows whether the garment is genuine and links to its product page.

create table if not exists public.product_units (
  id uuid primary key default gen_random_uuid(),
  code text not null unique check (code ~ '^[A-Z2-7]{26}$'),
  serial text not null unique,
  product_id uuid references public.products(id) on delete set null,
  color text not null default '',
  size text not null default '',
  batch text not null,
  status text not null default 'active' check (status in ('active', 'void')),
  scan_count integer not null default 0,
  first_scanned_at timestamptz,
  last_scanned_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists product_units_batch on public.product_units (batch, serial);
create index if not exists product_units_product on public.product_units (product_id);

create table if not exists public.unit_scans (
  id bigint generated always as identity primary key,
  unit_id uuid not null references public.product_units(id) on delete cascade,
  scanned_at timestamptz not null default now(),
  country text not null default '',
  city text not null default '',
  visitor text not null default ''  -- HMAC of the IP with a server secret, never the IP itself
);

create index if not exists unit_scans_unit on public.unit_scans (unit_id, scanned_at desc);

-- server-only: RLS on, no policies, no table rights for the public roles
alter table public.product_units enable row level security;
alter table public.unit_scans enable row level security;
revoke all on public.product_units from anon, authenticated;
revoke all on public.unit_scans from anon, authenticated;

-- Records one scan and returns the unit. The same visitor on the same day counts once,
-- so refreshing the page does not make a genuine garment look copied.
create or replace function public.register_unit_scan(
  p_code text,
  p_country text,
  p_city text,
  p_visitor text
)
returns setof public.product_units
language plpgsql
set search_path = ''
as $$
declare
  v_unit public.product_units;
  v_seen boolean;
begin
  select * into v_unit from public.product_units where code = p_code for update;
  if not found then
    return;
  end if;

  select exists (
    select 1 from public.unit_scans
    where unit_id = v_unit.id
      and visitor = p_visitor
      and scanned_at > now() - interval '24 hours'
  ) into v_seen;

  if not v_seen then
    insert into public.unit_scans (unit_id, country, city, visitor)
    values (v_unit.id, left(coalesce(p_country, ''), 8), left(coalesce(p_city, ''), 80), coalesce(p_visitor, ''));

    update public.product_units
    set scan_count = scan_count + 1,
        first_scanned_at = coalesce(first_scanned_at, now()),
        last_scanned_at = now()
    where id = v_unit.id
    returning * into v_unit;
  end if;

  return next v_unit;
end;
$$;

revoke execute on function public.register_unit_scan(text, text, text, text) from public, anon, authenticated;
