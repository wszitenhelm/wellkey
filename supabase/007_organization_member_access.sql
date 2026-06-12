grant select on public.employee_organization_links to authenticated;
grant select, insert, delete on public.employee_organization_team_links to authenticated;

drop policy if exists "org_users_can_view_their_own_account" on public.organization_users;
create policy "org_users_can_view_their_own_account"
on public.organization_users
for select
to authenticated
using (id = public.requesting_org_user_id());

drop policy if exists "org_member_managers_can_view_users" on public.organization_users;
create policy "org_member_managers_can_view_users"
on public.organization_users
for select
to authenticated
using (
  (select private.has_org_permission(organization_id, 'view_org_members'))
  or (select private.has_org_permission(organization_id, 'manage_role_permissions'))
  or id = public.requesting_org_user_id()
);

drop policy if exists "org_member_viewers_can_view_employee_links" on public.employee_organization_links;
create policy "org_member_viewers_can_view_employee_links"
on public.employee_organization_links
for select
to authenticated
using (
  (select private.has_org_permission(organization_id, 'view_org_members'))
  or (select private.has_org_permission(organization_id, 'manage_org_members'))
);

drop policy if exists "org_member_viewers_can_view_employee_team_links" on public.employee_organization_team_links;
create policy "org_member_viewers_can_view_employee_team_links"
on public.employee_organization_team_links
for select
to authenticated
using (
  (select private.has_org_permission(organization_id, 'view_org_members'))
  or (select private.has_org_permission(organization_id, 'manage_org_members'))
);

drop policy if exists "org_member_managers_can_manage_employee_team_links" on public.employee_organization_team_links;
create policy "org_member_managers_can_manage_employee_team_links"
on public.employee_organization_team_links
for all
to authenticated
using ((select private.has_org_permission(organization_id, 'manage_org_members')))
with check ((select private.has_org_permission(organization_id, 'manage_org_members')));

do $$
declare
  target_org record;
begin
  for target_org in
    select id from public.organizations
  loop
    perform public.seed_organization_defaults(target_org.id);
  end loop;
end
$$;
