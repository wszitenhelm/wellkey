create or replace function public.create_employee_organization_link(
  p_organization_id uuid,
  p_user_id uuid,
  p_employee_public_key text,
  p_org_scoped_employee_id text,
  p_join_method text
)
returns table (
  link_id uuid
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_link_id uuid;
begin
  insert into public.employee_organization_links (
    organization_id,
    user_id,
    employee_public_key,
    org_scoped_employee_id,
    join_method
  )
  values (
    p_organization_id,
    p_user_id,
    p_employee_public_key,
    p_org_scoped_employee_id,
    p_join_method
  )
  on conflict (organization_id, user_id)
  do update set
    employee_public_key = excluded.employee_public_key,
    org_scoped_employee_id = excluded.org_scoped_employee_id,
    join_method = excluded.join_method
  returning id into v_link_id;

  return query select v_link_id;
end;
$$;

revoke all on function public.create_employee_organization_link(uuid, uuid, text, text, text) from public;
grant execute on function public.create_employee_organization_link(uuid, uuid, text, text, text)
to postgres, service_role;
