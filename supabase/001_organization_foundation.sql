create extension if not exists pgcrypto;

create or replace function public.ensure_updated_at_trigger()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  legal_name text not null check (char_length(legal_name) between 2 and 160),
  display_name text not null check (char_length(display_name) between 2 and 160),
  logo_url text,
  primary_domain text,
  website_url text,
  verification_status text not null default 'pending'
    check (verification_status in ('pending', 'verified', 'rejected')),
  address_line_1 text,
  address_line_2 text,
  city text,
  postal_code text,
  country text,
  billing_address jsonb,
  ec_public_key text not null,
  encrypted_ec_private_key text not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.organization_domains (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  domain text not null unique,
  verification_token text not null,
  verification_method text not null default 'dns_txt'
    check (verification_method in ('dns_txt', 'email')),
  verified_at timestamptz,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.organization_users (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  email text not null unique,
  password_hash text not null,
  full_name text,
  status text not null default 'active'
    check (status in ('active', 'invited', 'disabled')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  last_login_at timestamptz
);

create table if not exists public.organization_roles (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  key text not null,
  name text not null,
  is_system boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (organization_id, key)
);

create table if not exists public.organization_permissions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  key text not null,
  name text not null,
  description text not null default '',
  created_at timestamptz not null default timezone('utc', now()),
  unique (organization_id, key)
);

create table if not exists public.organization_role_permissions (
  organization_id uuid not null references public.organizations (id) on delete cascade,
  role_id uuid not null references public.organization_roles (id) on delete cascade,
  permission_id uuid not null references public.organization_permissions (id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  primary key (role_id, permission_id)
);

create table if not exists public.organization_user_roles (
  organization_user_id uuid not null references public.organization_users (id) on delete cascade,
  role_id uuid not null references public.organization_roles (id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  primary key (organization_user_id, role_id)
);

create table if not exists public.organization_user_permission_overrides (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  organization_user_id uuid not null references public.organization_users (id) on delete cascade,
  permission_id uuid not null references public.organization_permissions (id) on delete cascade,
  effect text not null check (effect in ('allow', 'deny')),
  created_by_organization_user_id uuid references public.organization_users (id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  unique (organization_user_id, permission_id)
);

create table if not exists public.organization_settings (
  organization_id uuid primary key references public.organizations (id) on delete cascade,
  minimum_reporting_threshold integer not null default 5 check (minimum_reporting_threshold >= 3),
  allow_domain_join boolean not null default false,
  allow_invite_join boolean not null default true,
  show_team_breakdowns boolean not null default false,
  show_export_button boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.organization_invites (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  token_hash text not null unique,
  email text,
  expires_at timestamptz not null,
  created_by_organization_user_id uuid not null references public.organization_users (id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.organization_teams (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  slug text not null,
  name text not null check (char_length(name) between 2 and 120),
  parent_team_id uuid references public.organization_teams (id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (organization_id, slug)
);

create table if not exists public.employee_organization_links (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  user_id uuid not null references public.app_users (user_id) on delete cascade,
  employee_public_key text not null,
  org_scoped_employee_id text not null unique,
  join_method text not null default 'invite'
    check (join_method in ('invite', 'domain', 'code')),
  created_at timestamptz not null default timezone('utc', now()),
  unique (organization_id, user_id)
);

create table if not exists public.employee_organization_team_links (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  employee_organization_link_id uuid not null references public.employee_organization_links (id) on delete cascade,
  team_id uuid not null references public.organization_teams (id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  unique (employee_organization_link_id, team_id)
);

create table if not exists public.employee_signal_snapshots (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  org_scoped_employee_id text not null,
  snapshot_date date not null,
  e numeric(5,4) not null check (e between 0 and 1),
  s numeric(5,4) not null check (s between 0 and 1),
  d numeric(5,4) not null check (d between 0 and 1),
  c numeric(5,4) not null check (c between 0 and 1),
  p numeric(5,4) not null check (p between 0 and 1),
  w numeric(5,4) not null check (w between 0 and 1),
  f numeric(5,4) not null check (f between 0 and 1),
  i numeric(5,4) not null check (i between 0 and 1),
  sup numeric(5,4) not null check (sup between 0 and 1),
  delta_e boolean not null default false,
  delta_s boolean not null default false,
  delta_c boolean not null default false,
  delta_w boolean not null default false,
  weighted_score numeric(5,4) not null check (weighted_score between 0 and 1),
  trend_bonus numeric(5,4) not null check (trend_bonus between 0 and 0.2),
  risk_score numeric(5,4) not null check (risk_score between 0 and 1),
  risk_band text not null
    check (risk_band in ('low', 'elevated', 'high', 'critical')),
  created_at timestamptz not null default timezone('utc', now()),
  unique (organization_id, org_scoped_employee_id, snapshot_date)
);

create table if not exists public.organization_daily_aggregates (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  team_id uuid references public.organization_teams (id) on delete cascade,
  date date not null,
  active_employee_count integer not null default 0 check (active_employee_count >= 0),
  eligible_reporting_count integer not null default 0 check (eligible_reporting_count >= 0),
  avg_risk_score numeric(5,4) check (avg_risk_score between 0 and 1),
  median_risk_score numeric(5,4) check (median_risk_score between 0 and 1),
  avg_e numeric(5,4) check (avg_e between 0 and 1),
  median_e numeric(5,4) check (median_e between 0 and 1),
  avg_s numeric(5,4) check (avg_s between 0 and 1),
  median_s numeric(5,4) check (median_s between 0 and 1),
  avg_d numeric(5,4) check (avg_d between 0 and 1),
  median_d numeric(5,4) check (median_d between 0 and 1),
  avg_c numeric(5,4) check (avg_c between 0 and 1),
  median_c numeric(5,4) check (median_c between 0 and 1),
  avg_p numeric(5,4) check (avg_p between 0 and 1),
  median_p numeric(5,4) check (median_p between 0 and 1),
  avg_w numeric(5,4) check (avg_w between 0 and 1),
  median_w numeric(5,4) check (median_w between 0 and 1),
  avg_f numeric(5,4) check (avg_f between 0 and 1),
  median_f numeric(5,4) check (median_f between 0 and 1),
  avg_i numeric(5,4) check (avg_i between 0 and 1),
  median_i numeric(5,4) check (median_i between 0 and 1),
  avg_sup numeric(5,4) check (avg_sup between 0 and 1),
  median_sup numeric(5,4) check (median_sup between 0 and 1),
  elevated_count integer not null default 0 check (elevated_count >= 0),
  high_count integer not null default 0 check (high_count >= 0),
  critical_count integer not null default 0 check (critical_count >= 0),
  created_at timestamptz not null default timezone('utc', now()),
  unique nulls not distinct (organization_id, team_id, date)
);

create table if not exists public.organization_factor_aggregates (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  team_id uuid references public.organization_teams (id) on delete cascade,
  date date not null,
  factor_key text not null
    check (factor_key in ('e', 's', 'd', 'c', 'p', 'w', 'f', 'i', 'sup')),
  avg_value numeric(5,4) check (avg_value between 0 and 1),
  median_value numeric(5,4) check (median_value between 0 and 1),
  worsening_count integer not null default 0 check (worsening_count >= 0),
  created_at timestamptz not null default timezone('utc', now()),
  unique nulls not distinct (organization_id, team_id, date, factor_key)
);

create table if not exists public.organization_countermeasure_recommendations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  date date not null,
  recommendation_key text not null,
  title text not null,
  body text not null,
  priority integer not null default 0 check (priority between 0 and 10),
  source_factors jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  created_by_organization_user_id uuid not null references public.organization_users (id) on delete cascade,
  report_type text not null check (report_type in ('pdf', 'csv')),
  period_start date not null,
  period_end date not null,
  status text not null default 'pending'
    check (status in ('pending', 'processing', 'ready', 'failed')),
  file_url text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  check (period_end >= period_start)
);

create table if not exists public.report_exports (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references public.reports (id) on delete cascade,
  export_format text not null check (export_format in ('pdf', 'csv', 'json')),
  storage_path text,
  file_url text,
  status text not null default 'pending'
    check (status in ('pending', 'processing', 'ready', 'failed')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.manager_audit_logs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  organization_user_id uuid not null references public.organization_users (id) on delete cascade,
  action text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists organization_users_org_idx
  on public.organization_users (organization_id);

create index if not exists organization_domains_org_idx
  on public.organization_domains (organization_id);

create index if not exists organization_teams_org_idx
  on public.organization_teams (organization_id);

create index if not exists organization_user_permission_overrides_org_user_idx
  on public.organization_user_permission_overrides (organization_id, organization_user_id);

create index if not exists employee_organization_links_org_idx
  on public.employee_organization_links (organization_id);

create index if not exists employee_organization_team_links_org_team_idx
  on public.employee_organization_team_links (organization_id, team_id);

create index if not exists employee_signal_snapshots_org_date_idx
  on public.employee_signal_snapshots (organization_id, snapshot_date desc);

create index if not exists organization_daily_aggregates_org_date_idx
  on public.organization_daily_aggregates (organization_id, team_id, date desc);

create index if not exists organization_factor_aggregates_org_date_idx
  on public.organization_factor_aggregates (organization_id, team_id, date desc);

create index if not exists reports_org_created_idx
  on public.reports (organization_id, created_at desc);

create index if not exists report_exports_report_created_idx
  on public.report_exports (report_id, created_at desc);

drop trigger if exists organizations_set_updated_at on public.organizations;
create trigger organizations_set_updated_at
before update on public.organizations
for each row
execute function public.ensure_updated_at_trigger();

drop trigger if exists organization_users_set_updated_at on public.organization_users;
create trigger organization_users_set_updated_at
before update on public.organization_users
for each row
execute function public.ensure_updated_at_trigger();

drop trigger if exists organization_roles_set_updated_at on public.organization_roles;
create trigger organization_roles_set_updated_at
before update on public.organization_roles
for each row
execute function public.ensure_updated_at_trigger();

drop trigger if exists organization_teams_set_updated_at on public.organization_teams;
create trigger organization_teams_set_updated_at
before update on public.organization_teams
for each row
execute function public.ensure_updated_at_trigger();

drop trigger if exists organization_settings_set_updated_at on public.organization_settings;
create trigger organization_settings_set_updated_at
before update on public.organization_settings
for each row
execute function public.ensure_updated_at_trigger();

drop trigger if exists reports_set_updated_at on public.reports;
create trigger reports_set_updated_at
before update on public.reports
for each row
execute function public.ensure_updated_at_trigger();

drop trigger if exists report_exports_set_updated_at on public.report_exports;
create trigger report_exports_set_updated_at
before update on public.report_exports
for each row
execute function public.ensure_updated_at_trigger();

alter table public.organizations enable row level security;
alter table public.organization_domains enable row level security;
alter table public.organization_users enable row level security;
alter table public.organization_roles enable row level security;
alter table public.organization_permissions enable row level security;
alter table public.organization_role_permissions enable row level security;
alter table public.organization_user_roles enable row level security;
alter table public.organization_user_permission_overrides enable row level security;
alter table public.organization_settings enable row level security;
alter table public.organization_invites enable row level security;
alter table public.organization_teams enable row level security;
alter table public.employee_organization_links enable row level security;
alter table public.employee_organization_team_links enable row level security;
alter table public.employee_signal_snapshots enable row level security;
alter table public.organization_daily_aggregates enable row level security;
alter table public.organization_factor_aggregates enable row level security;
alter table public.organization_countermeasure_recommendations enable row level security;
alter table public.reports enable row level security;
alter table public.report_exports enable row level security;
alter table public.manager_audit_logs enable row level security;

comment on table public.employee_organization_links is
  'Server-only mapping between anonymous app users and organization-scoped derived identifiers.';

comment on table public.employee_signal_snapshots is
  'Server-only normalized burnout-risk inputs and derived scores. Never expose directly to organization dashboards.';
