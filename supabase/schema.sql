-- SettleIn database setup.
-- Run once in Supabase: Dashboard → SQL Editor → New query → paste this file → Run.
-- Safe to run again: nothing is dropped, and existing rows are left untouched.

create table if not exists public.listings (
  id                text primary key,
  title             text    not null check (char_length(title) between 1 and 80),
  total_rent        integer not null check (total_rent > 0),
  deposit           integer not null check (deposit >= 0),
  floor             integer not null check (floor >= 0),
  has_lift          boolean not null default false,
  has_parking       boolean not null default false,
  pet_friendly      boolean not null default false,
  bathrooms         integer not null check (bathrooms >= 1),
  hinjewadi_commute integer not null check (hinjewadi_commute >= 0),
  gym_commute       integer not null check (gym_commute >= 0),
  added_by          text    not null check (added_by in ('riya', 'meera', 'kavita')),
  created_at        bigint  not null  -- milliseconds since epoch, as used by the app
);

-- One row holding the roommates' budgets and commute limits.
create table if not exists public.app_settings (
  id         text primary key default 'default' check (id = 'default'),
  data       jsonb not null,
  updated_at timestamptz not null default now()
);

-- Only the SettleIn server (using the secret/service-role key) talks to these tables.
-- RLS with no policies blocks the public anon key entirely.
alter table public.listings enable row level security;
alter table public.app_settings enable row level security;

insert into public.app_settings (id, data) values
  ('default', '{"budgets":{"meera":14000,"kavita":16000,"riya":15000},"kavitaMaxCommute":35,"riyaMaxGymCommute":20}')
on conflict (id) do nothing;

-- The 4 demo flats (same as lib/demo-listings.ts).
insert into public.listings
  (id, title, total_rent, deposit, floor, has_lift, has_parking, pet_friendly, bathrooms, hinjewadi_commute, gym_commute, added_by, created_at)
values
  ('demo-aundh',       'Aundh Sai Heritage 3BHK',   42000, 126000, 3, true,  true,  true,  3, 30, 15, 'kavita', 1788220800004),
  ('demo-kothrud',     'Kothrud Shanti Niwas 3BHK', 39000, 100000, 3, false, true,  false, 2, 35, 18, 'riya',   1788220800003),
  ('demo-baner',       'Baner High Street 3BHK',    42000, 150000, 5, true,  true,  true,  2, 50, 12, 'meera',  1788220800002),
  ('demo-viman-nagar', 'Viman Nagar Skyline 3BHK',  48000, 200000, 4, false, false, false, 2, 65, 25, 'riya',   1788220800001)
on conflict (id) do nothing;
