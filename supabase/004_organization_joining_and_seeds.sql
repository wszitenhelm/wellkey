alter table public.organizations
  add column if not exists organization_seed text,
  add column if not exists join_code text;

create unique index if not exists organizations_join_code_key
  on public.organizations (join_code)
  where join_code is not null;

create or replace function public.seed_organization_defaults(target_org_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_owner_role_id uuid;
  v_c_level_role_id uuid;
  v_hr_admin_role_id uuid;
  v_manager_role_id uuid;
  v_first_user_id uuid;
begin
  insert into public.organization_settings (organization_id)
  values (target_org_id)
  on conflict (organization_id) do nothing;

  insert into public.organization_roles (organization_id, key, name, is_system)
  values
    (target_org_id, 'owner', 'Owner', true),
    (target_org_id, 'c_level', 'C-level', true),
    (target_org_id, 'hr_admin', 'HR Admin', true),
    (target_org_id, 'manager', 'Manager', true)
  on conflict (organization_id, key) do update
    set name = excluded.name,
        is_system = true;

  insert into public.organization_permissions (organization_id, key, name, description)
  values
    (target_org_id, 'manage_company_profile', 'manage company profile', ''),
    (target_org_id, 'manage_domains', 'manage domains', ''),
    (target_org_id, 'view_org_members', 'view org members', ''),
    (target_org_id, 'manage_org_members', 'manage org members', ''),
    (target_org_id, 'manage_role_permissions', 'manage role permissions', ''),
    (target_org_id, 'view_org_overview', 'view org overview', ''),
    (target_org_id, 'view_team_breakdowns', 'view team breakdowns', ''),
    (target_org_id, 'view_reports', 'view reports', ''),
    (target_org_id, 'manage_reports', 'manage reports', ''),
    (target_org_id, 'view_audit_logs', 'view audit logs', '')
  on conflict (organization_id, key) do update
    set name = excluded.name;

  select id into v_owner_role_id
  from public.organization_roles
  where organization_id = target_org_id and key = 'owner';

  select id into v_c_level_role_id
  from public.organization_roles
  where organization_id = target_org_id and key = 'c_level';

  select id into v_hr_admin_role_id
  from public.organization_roles
  where organization_id = target_org_id and key = 'hr_admin';

  select id into v_manager_role_id
  from public.organization_roles
  where organization_id = target_org_id and key = 'manager';

  insert into public.organization_role_permissions (organization_id, role_id, permission_id)
  select target_org_id, v_owner_role_id, permission.id
  from public.organization_permissions permission
  where permission.organization_id = target_org_id
  on conflict (role_id, permission_id) do nothing;

  insert into public.organization_role_permissions (organization_id, role_id, permission_id)
  select target_org_id, v_c_level_role_id, permission.id
  from public.organization_permissions permission
  where permission.organization_id = target_org_id
    and permission.key in (
      'view_org_overview',
      'view_team_breakdowns',
      'view_reports',
      'manage_reports',
      'view_audit_logs'
    )
  on conflict (role_id, permission_id) do nothing;

  insert into public.organization_role_permissions (organization_id, role_id, permission_id)
  select target_org_id, v_hr_admin_role_id, permission.id
  from public.organization_permissions permission
  where permission.organization_id = target_org_id
    and permission.key in (
      'view_org_overview',
      'view_team_breakdowns',
      'view_reports',
      'view_org_members'
    )
  on conflict (role_id, permission_id) do nothing;

  insert into public.organization_role_permissions (organization_id, role_id, permission_id)
  select target_org_id, v_manager_role_id, permission.id
  from public.organization_permissions permission
  where permission.organization_id = target_org_id
    and permission.key in (
      'view_org_overview',
      'view_team_breakdowns'
    )
  on conflict (role_id, permission_id) do nothing;

  select id into v_first_user_id
  from public.organization_users
  where organization_id = target_org_id
  order by created_at asc
  limit 1;

  if v_first_user_id is not null and v_owner_role_id is not null then
    insert into public.organization_user_roles (organization_user_id, role_id)
    values (v_first_user_id, v_owner_role_id)
    on conflict (organization_user_id, role_id) do nothing;
  end if;
end;
$$;

do $$
declare
  target_org record;
begin
  for target_org in
    select id
    from public.organizations
  loop
    perform public.seed_organization_defaults(target_org.id);
  end loop;
end
$$;

revoke all on function public.seed_organization_defaults(uuid) from public;
grant execute on function public.seed_organization_defaults(uuid) to postgres, service_role;
