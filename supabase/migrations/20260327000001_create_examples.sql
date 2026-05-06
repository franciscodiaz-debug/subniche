create table if not exists public.examples (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  description text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Auto-update updated_at on row changes
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger examples_updated_at
  before update on public.examples
  for each row execute function update_updated_at();

-- Allow public read/write (adjust with RLS rules later)
alter table public.examples enable row level security;

create policy "Allow all for now"
  on public.examples
  for all
  using (true)
  with check (true);
