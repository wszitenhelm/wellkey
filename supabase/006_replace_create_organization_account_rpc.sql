create or replace function public.create_organization_account(
  p_slug text,
  p_legal_name text,
  p_display_name text,
  p_email text,
  p_password_hash text,
  p_ec_public_key text,
  p_encrypted_ec_private_key text,
  p_organization_seed text,
  p_join_code text
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
begin
  insert into public.organizations (
    slug,
    legal_name,
    display_name,
    ec_public_key,
    encrypted_ec_private_key,
    organization_seed,
    join_code
  )
  values (
    p_slug,
    p_legal_name,
    p_display_name,
    p_ec_public_key,
    p_encrypted_ec_private_key,
    p_organization_seed,
    p_join_code
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

  perform public.seed_organization_defaults(v_organization_id);

  return query
  select
    v_organization_id,
    v_organization_user_id;
end;
$$;

revoke all on function public.create_organization_account(text, text, text, text, text, text, text, text, text) from public;
grant execute on function public.create_organization_account(text, text, text, text, text, text, text, text, text)
to postgres, service_role;
