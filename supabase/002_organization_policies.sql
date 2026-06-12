create schema if not exists private;

create or replace function public.requesting_org_id()
returns uuid
language sql
stable
as $$
  select coalesce(
    nullif(((current_setting('request.jwt.claims', true))::jsonb ->> 'org_id'), '')::uuid,
    nullif(((current_setting('request.jwt.claims', true))::jsonb -> 'app_metadata' ->> 'org_id'), '')::uuid
  );
$$;

create or replace function public.requesting_org_user_id()
returns uuid
language sql
stable
as $$
  select coalesce(
    nullif(((current_setting('request.jwt.claims', true))::jsonb ->> 'org_user_id'), '')::uuid,
    nullif(((current_setting('request.jwt.claims', true))::jsonb -> 'app_metadata' ->> 'org_user_id'), '')::uuid
  );
$$;

create or replace function public.requesting_org_permissions()
returns text[]
language sql
stable
as $$
  select coalesce(
    array(
      select jsonb_array_elements_text(
        coalesce(
          (current_setting('request.jwt.claims', true))::jsonb -> 'org_permissions',
          (current_setting('request.jwt.claims', true))::jsonb -> 'app_metadata' -> 'org_permissions',
          '[]'::jsonb
        )
      )
    ),
    array[]::text[]
  );
$$;

create or replace function private.is_org_member(target_org_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public, private
as $$
  select
    (select public.requesting_org_id()) is not null
    and (select public.requesting_org_user_id()) is not null
    and (select public.requesting_org_id()) = target_org_id;
$$;

create or replace function private.has_org_permission(target_org_id uuid, required_permission text)
returns boolean
language sql
stable
security definer
set search_path = public, private
as $$
  select
    private.is_org_member(target_org_id)
    and (
      required_permission = any(public.requesting_org_permissions())
      or 'org_admin' = any(public.requesting_org_permissions())
      or '*' = any(public.requesting_org_permissions())
    );
$$;

create or replace function private.can_view_org_aggregate(target_org_id uuid, aggregate_team_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public, private
as $$
  select
    private.is_org_member(target_org_id)
    and (
      private.has_org_permission(target_org_id, 'view_org_overview')
      or (
        aggregate_team_id is not null
        and private.has_org_permission(target_org_id, 'view_team_breakdowns')
      )
    );
$$;

grant usage on schema private to authenticated;
grant execute on function public.requesting_org_id() to authenticated;
grant execute on function public.requesting_org_user_id() to authenticated;
grant execute on function public.requesting_org_permissions() to authenticated;
grant execute on function private.is_org_member(uuid) to authenticated;
grant execute on function private.has_org_permission(uuid, text) to authenticated;
grant execute on function private.can_view_org_aggregate(uuid, uuid) to authenticated;

grant select, insert, update, delete on public.organizations to authenticated;
grant select, insert, update, delete on public.organization_domains to authenticated;
grant select, insert, update, delete on public.organization_users to authenticated;
grant select, insert, update, delete on public.organization_roles to authenticated;
grant select, insert, update, delete on public.organization_permissions to authenticated;
grant select, insert, update, delete on public.organization_role_permissions to authenticated;
grant select, insert, update, delete on public.organization_user_roles to authenticated;
grant select, insert, update, delete on public.organization_user_permission_overrides to authenticated;
grant select, insert, update, delete on public.organization_settings to authenticated;
grant select, insert, update, delete on public.organization_invites to authenticated;
grant select, insert, update, delete on public.organization_teams to authenticated;
grant select on public.organization_daily_aggregates to authenticated;
grant select on public.organization_factor_aggregates to authenticated;
grant select on public.organization_countermeasure_recommendations to authenticated;
grant select, insert, update, delete on public.reports to authenticated;
grant select, insert, update, delete on public.report_exports to authenticated;
grant select on public.manager_audit_logs to authenticated;

revoke all on public.employee_organization_links from authenticated, anon;
revoke all on public.employee_organization_team_links from authenticated, anon;
revoke all on public.employee_signal_snapshots from authenticated, anon;

drop policy if exists "org_members_can_view_organization" on public.organizations;
create policy "org_members_can_view_organization"
on public.organizations
for select
to authenticated
using ((select private.is_org_member(id)));

drop policy if exists "org_admins_can_update_organization" on public.organizations;
create policy "org_admins_can_update_organization"
on public.organizations
for update
to authenticated
using ((select private.has_org_permission(id, 'manage_company_profile')))
with check ((select private.has_org_permission(id, 'manage_company_profile')));

drop policy if exists "org_domain_managers_can_manage_domains" on public.organization_domains;
create policy "org_domain_managers_can_manage_domains"
on public.organization_domains
for all
to authenticated
using ((select private.has_org_permission(organization_id, 'manage_domains')))
with check ((select private.has_org_permission(organization_id, 'manage_domains')));

drop policy if exists "org_member_managers_can_view_users" on public.organization_users;
create policy "org_member_managers_can_view_users"
on public.organization_users
for select
to authenticated
using ((select private.has_org_permission(organization_id, 'view_org_members')));

drop policy if exists "org_member_managers_can_manage_users" on public.organization_users;
create policy "org_member_managers_can_manage_users"
on public.organization_users
for all
to authenticated
using ((select private.has_org_permission(organization_id, 'manage_org_members')))
with check ((select private.has_org_permission(organization_id, 'manage_org_members')));

drop policy if exists "org_role_admins_can_manage_roles" on public.organization_roles;
create policy "org_role_admins_can_manage_roles"
on public.organization_roles
for all
to authenticated
using ((select private.has_org_permission(organization_id, 'manage_role_permissions')))
with check ((select private.has_org_permission(organization_id, 'manage_role_permissions')));

drop policy if exists "org_role_admins_can_manage_permissions" on public.organization_permissions;
create policy "org_role_admins_can_manage_permissions"
on public.organization_permissions
for all
to authenticated
using ((select private.has_org_permission(organization_id, 'manage_role_permissions')))
with check ((select private.has_org_permission(organization_id, 'manage_role_permissions')));

drop policy if exists "org_role_admins_can_manage_role_permission_links" on public.organization_role_permissions;
create policy "org_role_admins_can_manage_role_permission_links"
on public.organization_role_permissions
for all
to authenticated
using ((select private.has_org_permission(organization_id, 'manage_role_permissions')))
with check ((select private.has_org_permission(organization_id, 'manage_role_permissions')));

drop policy if exists "org_role_admins_can_manage_user_roles" on public.organization_user_roles;
create policy "org_role_admins_can_manage_user_roles"
on public.organization_user_roles
for all
to authenticated
using (
  exists (
    select 1
    from public.organization_roles roles
    where roles.id = role_id
      and (select private.has_org_permission(roles.organization_id, 'manage_role_permissions'))
  )
)
with check (
  exists (
    select 1
    from public.organization_roles roles
    where roles.id = role_id
      and (select private.has_org_permission(roles.organization_id, 'manage_role_permissions'))
  )
);

drop policy if exists "org_role_admins_can_manage_permission_overrides" on public.organization_user_permission_overrides;
create policy "org_role_admins_can_manage_permission_overrides"
on public.organization_user_permission_overrides
for all
to authenticated
using ((select private.has_org_permission(organization_id, 'manage_role_permissions')))
with check ((select private.has_org_permission(organization_id, 'manage_role_permissions')));

drop policy if exists "org_settings_admins_can_view_settings" on public.organization_settings;
create policy "org_settings_admins_can_view_settings"
on public.organization_settings
for select
to authenticated
using ((select private.is_org_member(organization_id)));

drop policy if exists "org_settings_admins_can_manage_settings" on public.organization_settings;
create policy "org_settings_admins_can_manage_settings"
on public.organization_settings
for all
to authenticated
using ((select private.has_org_permission(organization_id, 'manage_company_profile')))
with check ((select private.has_org_permission(organization_id, 'manage_company_profile')));

drop policy if exists "org_invite_managers_can_manage_invites" on public.organization_invites;
create policy "org_invite_managers_can_manage_invites"
on public.organization_invites
for all
to authenticated
using ((select private.has_org_permission(organization_id, 'manage_org_members')))
with check ((select private.has_org_permission(organization_id, 'manage_org_members')));

drop policy if exists "org_team_viewers_can_view_teams" on public.organization_teams;
create policy "org_team_viewers_can_view_teams"
on public.organization_teams
for select
to authenticated
using ((select private.is_org_member(organization_id)));

drop policy if exists "org_team_admins_can_manage_teams" on public.organization_teams;
create policy "org_team_admins_can_manage_teams"
on public.organization_teams
for all
to authenticated
using ((select private.has_org_permission(organization_id, 'manage_org_members')))
with check ((select private.has_org_permission(organization_id, 'manage_org_members')));

drop policy if exists "org_members_can_view_daily_aggregates" on public.organization_daily_aggregates;
create policy "org_members_can_view_daily_aggregates"
on public.organization_daily_aggregates
for select
to authenticated
using ((select private.can_view_org_aggregate(organization_id, team_id)));

drop policy if exists "org_members_can_view_factor_aggregates" on public.organization_factor_aggregates;
create policy "org_members_can_view_factor_aggregates"
on public.organization_factor_aggregates
for select
to authenticated
using ((select private.can_view_org_aggregate(organization_id, team_id)));

drop policy if exists "org_members_can_view_recommendations" on public.organization_countermeasure_recommendations;
create policy "org_members_can_view_recommendations"
on public.organization_countermeasure_recommendations
for select
to authenticated
using ((select private.has_org_permission(organization_id, 'view_org_overview')));

drop policy if exists "org_report_viewers_can_view_reports" on public.reports;
create policy "org_report_viewers_can_view_reports"
on public.reports
for select
to authenticated
using ((select private.has_org_permission(organization_id, 'view_reports')));

drop policy if exists "org_report_managers_can_manage_reports" on public.reports;
create policy "org_report_managers_can_manage_reports"
on public.reports
for all
to authenticated
using ((select private.has_org_permission(organization_id, 'manage_reports')))
with check ((select private.has_org_permission(organization_id, 'manage_reports')));

drop policy if exists "org_report_viewers_can_view_report_exports" on public.report_exports;
create policy "org_report_viewers_can_view_report_exports"
on public.report_exports
for select
to authenticated
using (
  exists (
    select 1
    from public.reports reports
    where reports.id = report_id
      and (select private.has_org_permission(reports.organization_id, 'view_reports'))
  )
);

drop policy if exists "org_report_managers_can_manage_report_exports" on public.report_exports;
create policy "org_report_managers_can_manage_report_exports"
on public.report_exports
for all
to authenticated
using (
  exists (
    select 1
    from public.reports reports
    where reports.id = report_id
      and (select private.has_org_permission(reports.organization_id, 'manage_reports'))
  )
)
with check (
  exists (
    select 1
    from public.reports reports
    where reports.id = report_id
      and (select private.has_org_permission(reports.organization_id, 'manage_reports'))
  )
);

drop policy if exists "org_audit_viewers_can_view_audit_logs" on public.manager_audit_logs;
create policy "org_audit_viewers_can_view_audit_logs"
on public.manager_audit_logs
for select
to authenticated
using ((select private.has_org_permission(organization_id, 'view_audit_logs')));
