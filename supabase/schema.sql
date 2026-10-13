-- Schema for the supabase drivers: recipes table for DATA_DRIVER=supabase, recipe-images bucket for PUBLIC_FILES_DRIVER=supabase.
-- Idempotent: psql "$SUPABASE_DB_URL" -v ON_ERROR_STOP=1 -f supabase/schema.sql

create table if not exists public.recipes (
    user_id    text        not null,
    id         text        not null,
    data       jsonb       not null,
    updated_at timestamptz not null default now(),
    primary key (user_id, id)
);

-- No policies on purpose: the app reaches supabase only with the service key, which bypasses RLS
alter table public.recipes enable row level security;

insert into storage.buckets (id, name, public)
values ('recipe-images', 'recipe-images', false)
on conflict (id) do nothing;
