create extension if not exists pgcrypto;

create table if not exists app_users (
  user_id uuid primary key default gen_random_uuid(),
  login_code_hash text not null unique,
  password_hash text not null,
  recovery_code_hash text not null,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists chat_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references app_users (user_id) on delete cascade,
  summary text not null default '',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists chat_messages (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references chat_sessions (id) on delete cascade,
  user_id uuid not null references app_users (user_id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null check (char_length(content) between 1 and 4000),
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists habits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references app_users (user_id) on delete cascade,
  slug text not null,
  title text not null check (char_length(title) between 3 and 80),
  description text not null default '',
  is_default boolean not null default false,
  order_index integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  archived_at timestamptz,
  unique (user_id, slug)
);

alter table habits add column if not exists order_index integer not null default 0;

create table if not exists habit_completions (
  id uuid primary key default gen_random_uuid(),
  habit_id uuid not null references habits (id) on delete cascade,
  user_id uuid not null references app_users (user_id) on delete cascade,
  completed_on date not null,
  created_at timestamptz not null default timezone('utc', now()),
  unique (habit_id, completed_on)
);

create table if not exists reminder_notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references app_users (user_id) on delete cascade,
  kind text not null check (
    kind in (
      'gratitude',
      'self_kindness',
      'small_win',
      'something_i_handled',
      'what_i_need_today'
    )
  ),
  content text not null check (char_length(content) between 3 and 180),
  created_at timestamptz not null default timezone('utc', now())
);

alter table reminder_notes drop constraint if exists reminder_notes_kind_check;
alter table reminder_notes
add constraint reminder_notes_kind_check
check (
  kind in (
    'gratitude',
    'self_kindness',
    'small_win',
    'something_i_handled',
    'what_i_need_today'
  )
);

create table if not exists daily_check_ins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references app_users (user_id) on delete cascade,
  mode text not null check (mode in ('quick', 'regular')),
  completed_on date not null,
  regular_score numeric(5,2),
  quick_score numeric(5,2),
  quick_energy_level integer check (quick_energy_level between 1 and 5),
  quick_stress_level integer check (quick_stress_level between 1 and 5),
  quick_switch_off_level integer check (quick_switch_off_level between 1 and 5),
  quick_biggest_factor text check (
    quick_biggest_factor in (
      'workload',
      'meetings',
      'sleep',
      'unclear_priorities',
      'interactions_with_others',
      'something_else'
    )
  ),
  regular_q1_drained integer check (regular_q1_drained between 1 and 5),
  regular_q2_enough_energy integer check (regular_q2_enough_energy between 1 and 5),
  regular_q3_switch_off_hard integer check (regular_q3_switch_off_hard between 1 and 5),
  regular_q4_less_connected integer check (regular_q4_less_connected between 1 and 5),
  regular_q5_focus_trouble integer check (regular_q5_focus_trouble between 1 and 5),
  regular_q6_emotional_strain integer check (regular_q6_emotional_strain between 1 and 5),
  regular_q7_recovery_good integer check (regular_q7_recovery_good between 1 and 5),
  regular_q8_workload_manageable integer check (regular_q8_workload_manageable between 1 and 5),
  regular_q9_supported integer check (regular_q9_supported between 1 and 5),
  regular_q10_priorities_clear integer check (regular_q10_priorities_clear between 1 and 5),
  created_at timestamptz not null default timezone('utc', now()),
  unique (user_id, completed_on)
);

create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists chat_sessions_set_updated_at on chat_sessions;

create trigger chat_sessions_set_updated_at
before update on chat_sessions
for each row
execute function set_updated_at();

alter table app_users enable row level security;
alter table chat_sessions enable row level security;
alter table chat_messages enable row level security;
alter table habits enable row level security;
alter table habit_completions enable row level security;
alter table reminder_notes enable row level security;
alter table daily_check_ins enable row level security;

drop policy if exists "users_can_read_self" on app_users;
create policy "users_can_read_self"
on app_users
for select
using (user_id = nullif(current_setting('app.current_user_id', true), '')::uuid);

drop policy if exists "allow_anonymous_signup_insert" on app_users;
create policy "allow_anonymous_signup_insert"
on app_users
for insert
with check (true);

drop policy if exists "users_can_manage_own_chat_sessions" on chat_sessions;
create policy "users_can_manage_own_chat_sessions"
on chat_sessions
for all
using (user_id = nullif(current_setting('app.current_user_id', true), '')::uuid)
with check (user_id = nullif(current_setting('app.current_user_id', true), '')::uuid);

drop policy if exists "users_can_manage_own_chat_messages" on chat_messages;
create policy "users_can_manage_own_chat_messages"
on chat_messages
for all
using (user_id = nullif(current_setting('app.current_user_id', true), '')::uuid)
with check (user_id = nullif(current_setting('app.current_user_id', true), '')::uuid);

drop policy if exists "users_can_manage_own_habits" on habits;
create policy "users_can_manage_own_habits"
on habits
for all
using (user_id = nullif(current_setting('app.current_user_id', true), '')::uuid)
with check (user_id = nullif(current_setting('app.current_user_id', true), '')::uuid);

drop policy if exists "users_can_manage_own_habit_completions" on habit_completions;
create policy "users_can_manage_own_habit_completions"
on habit_completions
for all
using (user_id = nullif(current_setting('app.current_user_id', true), '')::uuid)
with check (user_id = nullif(current_setting('app.current_user_id', true), '')::uuid);

drop policy if exists "users_can_manage_own_reminder_notes" on reminder_notes;
create policy "users_can_manage_own_reminder_notes"
on reminder_notes
for all
using (user_id = nullif(current_setting('app.current_user_id', true), '')::uuid)
with check (user_id = nullif(current_setting('app.current_user_id', true), '')::uuid);

drop policy if exists "users_can_manage_own_daily_check_ins" on daily_check_ins;
create policy "users_can_manage_own_daily_check_ins"
on daily_check_ins
for all
using (user_id = nullif(current_setting('app.current_user_id', true), '')::uuid)
with check (user_id = nullif(current_setting('app.current_user_id', true), '')::uuid);

create or replace function get_user_auth_by_login_code_hash(p_login_code_hash text)
returns table (
  user_id uuid,
  login_code_hash text,
  password_hash text,
  recovery_code_hash text,
  created_at timestamptz
)
language sql
security definer
set search_path = public
as $$
  select
    app_users.user_id,
    app_users.login_code_hash,
    app_users.password_hash,
    app_users.recovery_code_hash,
    app_users.created_at
  from app_users
  where app_users.login_code_hash = p_login_code_hash
  limit 1;
$$;

revoke all on function get_user_auth_by_login_code_hash(text) from public;
grant execute on function get_user_auth_by_login_code_hash(text) to postgres, anon, authenticated, service_role;
