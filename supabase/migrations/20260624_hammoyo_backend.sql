-- Hammoyo backend schema draft.
-- Apply manually in the Supabase SQL Editor after review.
-- Shared project: dr.kang-mini-project / public schema / app prefix: hammoyo_.

create extension if not exists pgcrypto;

create table if not exists public.core_users (
  id uuid primary key default gen_random_uuid(),
  display_name text,
  default_locale text not null default 'ko' check (default_locale in ('ko', 'en')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.authmap_user_identities (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.core_users(id) on delete cascade,
  provider text not null check (provider in ('apps_in_toss', 'google_play', 'local_dev')),
  provider_subject text not null,
  provider_metadata jsonb not null default '{}'::jsonb,
  linked_at timestamptz not null default now(),
  unlinked_at timestamptz,
  unique (provider, provider_subject)
);

create table if not exists public.hammoyo_rooms (
  id uuid primary key default gen_random_uuid(),
  host_core_user_id uuid not null references public.core_users(id),
  invite_slug text not null unique,
  title text not null check (char_length(title) between 1 and 80),
  status text not null default 'draft' check (status in ('draft', 'collecting', 'low_confidence', 'recommended', 'closed', 'expired')),
  expected_count integer not null default 4 check (expected_count between 3 and 20),
  response_round integer not null default 1 check (response_round >= 1),
  expires_at timestamptz not null,
  closed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.hammoyo_room_members (
  room_id uuid not null references public.hammoyo_rooms(id) on delete cascade,
  core_user_id uuid not null references public.core_users(id),
  role text not null check (role in ('host', 'participant')),
  display_alias text not null check (char_length(display_alias) between 1 and 40),
  joined_at timestamptz not null default now(),
  deleted_at timestamptz,
  primary key (room_id, core_user_id)
);

create table if not exists public.hammoyo_candidate_slots (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.hammoyo_rooms(id) on delete cascade,
  label text not null check (char_length(label) between 1 and 80),
  starts_at timestamptz,
  ends_at timestamptz,
  area_hint text,
  note text,
  sort_order integer not null default 0,
  active boolean not null default true
);

create table if not exists public.hammoyo_responses (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.hammoyo_rooms(id) on delete cascade,
  core_user_id uuid not null references public.core_users(id),
  response_round integer not null,
  status text not null default 'active' check (status in ('active', 'withdrawn', 'invalidated')),
  updated_at timestamptz not null default now(),
  unique (room_id, core_user_id, response_round)
);

create table if not exists public.hammoyo_response_preferences (
  response_id uuid not null references public.hammoyo_responses(id) on delete cascade,
  candidate_slot_id uuid not null references public.hammoyo_candidate_slots(id) on delete cascade,
  value text not null check (value in ('prefer', 'available', 'adjustable', 'hardNo')),
  primary key (response_id, candidate_slot_id)
);

create table if not exists public.hammoyo_recommendation_runs (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.hammoyo_rooms(id) on delete cascade,
  response_round integer not null,
  algorithm_version text not null default 'deterministic-v1',
  confidence text not null check (confidence in ('high', 'medium', 'low', 'none')),
  result_json jsonb not null,
  created_at timestamptz not null default now()
);

create table if not exists public.hammoyo_ai_coordination_runs (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.hammoyo_rooms(id) on delete cascade,
  recommendation_run_id uuid references public.hammoyo_recommendation_runs(id) on delete set null,
  provider text not null default 'deepseek' check (provider in ('deepseek')),
  model text not null default 'deepseek-v4-pro',
  locale text not null default 'ko' check (locale in ('ko', 'en')),
  input_kind text not null default 'schedule_matrix' check (input_kind in ('schedule_matrix')),
  prompt_version text not null default 'ai-schedule-coordination-v1',
  input_hash text not null,
  output_json jsonb not null,
  safety_status text not null default 'not_reviewed' check (safety_status in ('not_reviewed', 'passed', 'blocked', 'fallback_used')),
  created_at timestamptz not null default now()
);

create table if not exists public.hammoyo_share_messages (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.hammoyo_rooms(id) on delete cascade,
  recommendation_run_id uuid references public.hammoyo_recommendation_runs(id) on delete set null,
  locale text not null check (locale in ('ko', 'en')),
  generation_method text not null default 'template' check (generation_method in ('template', 'ai_polish')),
  body text not null check (char_length(body) between 1 and 1000),
  model text,
  prompt_version text,
  created_at timestamptz not null default now()
);

create table if not exists public.hammoyo_analytics_events (
  id uuid primary key default gen_random_uuid(),
  core_user_id uuid references public.core_users(id) on delete set null,
  room_id uuid references public.hammoyo_rooms(id) on delete set null,
  event_name text not null,
  payload_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint hammoyo_analytics_no_raw_text check (
    not (payload_json ? 'alias')
    and not (payload_json ? 'name')
    and not (payload_json ? 'memo')
    and not (payload_json ? 'phone')
    and not (payload_json ? 'email')
  )
);

create or replace function public.hammoyo_app_user_id()
returns uuid
language sql
stable
as $$
  select nullif(auth.jwt() ->> 'app_user_id', '')::uuid
$$;

create or replace function public.hammoyo_is_room_member(target_room_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.hammoyo_room_members member
    where member.room_id = target_room_id
      and member.core_user_id = public.hammoyo_app_user_id()
      and member.deleted_at is null
  )
$$;

create or replace function public.hammoyo_can_read_room(target_room_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.hammoyo_rooms room
    where room.id = target_room_id
      and room.host_core_user_id = public.hammoyo_app_user_id()
  )
  or public.hammoyo_is_room_member(target_room_id)
$$;

alter table public.core_users enable row level security;
alter table public.authmap_user_identities enable row level security;
alter table public.hammoyo_rooms enable row level security;
alter table public.hammoyo_room_members enable row level security;
alter table public.hammoyo_candidate_slots enable row level security;
alter table public.hammoyo_responses enable row level security;
alter table public.hammoyo_response_preferences enable row level security;
alter table public.hammoyo_recommendation_runs enable row level security;
alter table public.hammoyo_ai_coordination_runs enable row level security;
alter table public.hammoyo_share_messages enable row level security;
alter table public.hammoyo_analytics_events enable row level security;

drop policy if exists core_users_self_select on public.core_users;
create policy core_users_self_select
on public.core_users
for select
using (id = public.hammoyo_app_user_id() and deleted_at is null);

drop policy if exists authmap_user_identities_self_select on public.authmap_user_identities;
create policy authmap_user_identities_self_select
on public.authmap_user_identities
for select
using (user_id = public.hammoyo_app_user_id());

drop policy if exists hammoyo_rooms_member_select on public.hammoyo_rooms;
create policy hammoyo_rooms_member_select
on public.hammoyo_rooms
for select
using (public.hammoyo_can_read_room(id));

drop policy if exists hammoyo_room_members_member_select on public.hammoyo_room_members;
create policy hammoyo_room_members_member_select
on public.hammoyo_room_members
for select
using (public.hammoyo_can_read_room(room_id));

drop policy if exists hammoyo_candidate_slots_member_select on public.hammoyo_candidate_slots;
create policy hammoyo_candidate_slots_member_select
on public.hammoyo_candidate_slots
for select
using (public.hammoyo_can_read_room(room_id));

drop policy if exists hammoyo_responses_self_select on public.hammoyo_responses;
create policy hammoyo_responses_self_select
on public.hammoyo_responses
for select
using (core_user_id = public.hammoyo_app_user_id() or public.hammoyo_can_read_room(room_id));

drop policy if exists hammoyo_response_preferences_member_select on public.hammoyo_response_preferences;
create policy hammoyo_response_preferences_member_select
on public.hammoyo_response_preferences
for select
using (
  exists (
    select 1
    from public.hammoyo_responses response
    where response.id = response_id
      and public.hammoyo_can_read_room(response.room_id)
  )
);

drop policy if exists hammoyo_recommendation_runs_member_select on public.hammoyo_recommendation_runs;
create policy hammoyo_recommendation_runs_member_select
on public.hammoyo_recommendation_runs
for select
using (public.hammoyo_can_read_room(room_id));

drop policy if exists hammoyo_ai_coordination_runs_member_select on public.hammoyo_ai_coordination_runs;
create policy hammoyo_ai_coordination_runs_member_select
on public.hammoyo_ai_coordination_runs
for select
using (public.hammoyo_can_read_room(room_id));

drop policy if exists hammoyo_share_messages_member_select on public.hammoyo_share_messages;
create policy hammoyo_share_messages_member_select
on public.hammoyo_share_messages
for select
using (public.hammoyo_can_read_room(room_id));

drop policy if exists hammoyo_analytics_events_self_select on public.hammoyo_analytics_events;
create policy hammoyo_analytics_events_self_select
on public.hammoyo_analytics_events
for select
using (core_user_id = public.hammoyo_app_user_id());

grant usage on schema public to service_role;
grant select, insert, update, delete on public.core_users to service_role;
grant select, insert, update, delete on public.authmap_user_identities to service_role;
grant select, insert, update, delete on public.hammoyo_rooms to service_role;
grant select, insert, update, delete on public.hammoyo_room_members to service_role;
grant select, insert, update, delete on public.hammoyo_candidate_slots to service_role;
grant select, insert, update, delete on public.hammoyo_responses to service_role;
grant select, insert, update, delete on public.hammoyo_response_preferences to service_role;
grant select, insert, update, delete on public.hammoyo_recommendation_runs to service_role;
grant select, insert, update, delete on public.hammoyo_ai_coordination_runs to service_role;
grant select, insert, update, delete on public.hammoyo_share_messages to service_role;
grant select, insert, update, delete on public.hammoyo_analytics_events to service_role;
