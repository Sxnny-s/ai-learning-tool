-- 20251026_add_theme_preference_to_profiles.sql
-- Adds theme_preference column to public.profiles for Clerk mirror.

alter table public.profiles
  add column if not exists theme_preference text check (theme_preference in ('light','dark','system'));

-- Optional index for querying by preference
create index if not exists idx_profiles_theme_preference on public.profiles(theme_preference);



