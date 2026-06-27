-- Hammoyo invite/status and anonymous participant hardening.
-- Shared project: dr.kang-mini-project / public schema / app prefix: hammoyo_.

create extension if not exists pgcrypto;

alter table public.hammoyo_rooms
  add column if not exists deleted_at timestamptz,
  add column if not exists deleted_by_core_user_id uuid references public.core_users(id) on delete set null,
  add column if not exists deleted_reason text;

alter table public.hammoyo_rooms
  drop constraint if exists hammoyo_rooms_status_check;

alter table public.hammoyo_rooms
  add constraint hammoyo_rooms_status_check
  check (status in ('draft', 'collecting', 'low_confidence', 'recommended', 'closed', 'expired', 'deleted'));

alter table public.hammoyo_room_members
  add column if not exists id uuid default gen_random_uuid(),
  add column if not exists participant_kind text not null default 'authenticated',
  add column if not exists anonymous_key_hash text;

update public.hammoyo_room_members
set id = gen_random_uuid()
where id is null;

alter table public.hammoyo_room_members
  alter column id set not null;

alter table public.hammoyo_room_members
  drop constraint if exists hammoyo_room_members_pkey;

alter table public.hammoyo_room_members
  add constraint hammoyo_room_members_pkey primary key (id);

alter table public.hammoyo_room_members
  alter column core_user_id drop not null;

alter table public.hammoyo_room_members
  drop constraint if exists hammoyo_room_members_room_id_core_user_id_key;

alter table public.hammoyo_room_members
  add constraint hammoyo_room_members_core_user_unique unique (room_id, core_user_id);

alter table public.hammoyo_room_members
  drop constraint if exists hammoyo_room_members_anonymous_key_unique;

alter table public.hammoyo_room_members
  add constraint hammoyo_room_members_anonymous_key_unique unique (room_id, anonymous_key_hash);

alter table public.hammoyo_room_members
  drop constraint if exists hammoyo_room_members_participant_kind_check;

alter table public.hammoyo_room_members
  add constraint hammoyo_room_members_participant_kind_check
  check (participant_kind in ('authenticated', 'anonymous'));

alter table public.hammoyo_room_members
  drop constraint if exists hammoyo_room_members_identity_check;

alter table public.hammoyo_room_members
  add constraint hammoyo_room_members_identity_check
  check (
    (participant_kind = 'authenticated' and core_user_id is not null and anonymous_key_hash is null)
    or
    (participant_kind = 'anonymous' and core_user_id is null and anonymous_key_hash is not null)
  );

alter table public.hammoyo_responses
  add column if not exists member_id uuid references public.hammoyo_room_members(id) on delete cascade;

update public.hammoyo_responses response
set member_id = member.id
from public.hammoyo_room_members member
where response.member_id is null
  and response.room_id = member.room_id
  and response.core_user_id = member.core_user_id;

alter table public.hammoyo_responses
  alter column core_user_id drop not null;

alter table public.hammoyo_responses
  drop constraint if exists hammoyo_responses_member_round_unique;

alter table public.hammoyo_responses
  add constraint hammoyo_responses_member_round_unique unique (room_id, member_id, response_round);

alter table public.hammoyo_responses
  drop constraint if exists hammoyo_responses_member_identity_check;

alter table public.hammoyo_responses
  add constraint hammoyo_responses_member_identity_check
  check (member_id is not null);

create or replace function public.hammoyo_validate_response_preference_room()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  response_room_id uuid;
  slot_room_id uuid;
  slot_active boolean;
begin
  select room_id
    into response_room_id
  from public.hammoyo_responses
  where id = new.response_id;

  if response_room_id is null then
    raise exception 'RESPONSE_NOT_FOUND' using errcode = '23514';
  end if;

  select room_id, active
    into slot_room_id, slot_active
  from public.hammoyo_candidate_slots
  where id = new.candidate_slot_id;

  if slot_room_id is null or slot_room_id <> response_room_id then
    raise exception 'CANDIDATE_SLOT_NOT_IN_ROOM' using errcode = '23514';
  end if;

  if slot_active is not true then
    raise exception 'CANDIDATE_SLOT_INACTIVE' using errcode = '23514';
  end if;

  return new;
end;
$$;

drop trigger if exists hammoyo_response_preference_room_guard on public.hammoyo_response_preferences;

create trigger hammoyo_response_preference_room_guard
before insert or update on public.hammoyo_response_preferences
for each row
execute function public.hammoyo_validate_response_preference_room();
