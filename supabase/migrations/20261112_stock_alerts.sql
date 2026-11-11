-- Customers who asked to be told when a sold-out product (colour/size) is back in stock.
-- Applied to production on 2026-11-12.
create table if not exists public.stock_alerts (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  color text not null default '',
  size text not null default '',
  email text not null,
  language text not null default 'az',
  created_at timestamptz not null default now(),
  notified_at timestamptz
);

-- one waiting request per person per variant
create unique index if not exists stock_alerts_pending_unique
  on public.stock_alerts (product_id, color, size, lower(email))
  where notified_at is null;

create index if not exists stock_alerts_pending_product
  on public.stock_alerts (product_id)
  where notified_at is null;

-- server-only: RLS on, no policies (the service role bypasses RLS)
alter table public.stock_alerts enable row level security;
