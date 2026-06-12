create or replace function public.create_organization_account(
  p_slug text,
  p_legal_name text,
  p_display_name text,
  p_email text,
  p_password_hash text,
  p_ec_public_key text,
  p_encrypted_ec_private_key text
)
returns table (
  organization_id uuid,
  organization_user_id uuid
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_organization_id uuid;
  v_organization_user_id uuid;
  v_owner_role_id uuid;
begin
  insert into public.organizations (
    slug,
    legal_name,
    display_name,
    ec_public_key,
    encrypted_ec_private_key
  )
  values (
    p_slug,
    p_legal_name,
    p_display_name,
    p_ec_public_key,
    p_encrypted_ec_private_key
  )
  returning id into v_organization_id;

  insert into public.organization_users (
    organization_id,
    email,
    password_hash,
    status
  )
  values (
    v_organization_id,
    lower(trim(p_email)),
    p_password_hash,
    'active'
  )
  returning id into v_organization_user_id;

  insert into public.organization_settings (organization_id)
  values (v_organization_id);

  insert into public.organization_roles (organization_id, key, name, is_system)
  values
    (v_organization_id, 'owner', 'Owner', true),
    (v_organization_id, 'c_level', 'C-level', true),
    (v_organization_id, 'hr_admin', 'HR Admin', true),
    (v_organization_id, 'manager', 'Manager', true);

  insert into public.organization_permissions (organization_id, key, name, description)
  values
    (v_organization_id, 'manage_company_profile', 'manage company profile', ''),
    (v_organization_id, 'manage_domains', 'manage domains', ''),
    (v_organization_id, 'view_org_members', 'view org members', ''),
    (v_organization_id, 'manage_org_members', 'manage org members', ''),
    (v_organization_id, 'manage_role_permissions', 'manage role permissions', ''),
    (v_organization_id, 'view_org_overview', 'view org overview', ''),
    (v_organization_id, 'view_team_breakdowns', 'view team breakdowns', ''),
    (v_organization_id, 'view_reports', 'view reports', ''),
    (v_organization_id, 'manage_reports', 'manage reports', ''),
    (v_organization_id, 'view_audit_logs', 'view audit logs', '');

  select id
  into v_owner_role_id
  from public.organization_roles
  where organization_id = v_organization_id
    and key = 'owner'
  limit 1;

  if v_owner_role_id is null then
    raise exception 'OWNER_ROLE_CREATE_FAILED';
  end if;

  insert into public.organization_user_roles (organization_user_id, role_id)
  values (v_organization_user_id, v_owner_role_id);

  insert into public.organization_role_permissions (organization_id, role_id, permission_id)
  select
    v_organization_id,
    v_owner_role_id,
    permission.id
  from public.organization_permissions permission
  where permission.organization_id = v_organization_id;

  return query
  select
    v_organization_id,
    v_organization_user_id;
end;
$$;

revoke all on function public.create_organization_account(text, text, text, text, text, text, text) from public;
grant execute on function public.create_organization_account(text, text, text, text, text, text, text)
to postgres, service_role;
