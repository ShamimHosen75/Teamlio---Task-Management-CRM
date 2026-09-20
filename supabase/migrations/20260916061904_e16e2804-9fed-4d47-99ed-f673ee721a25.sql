CREATE SCHEMA IF NOT EXISTS private;
GRANT USAGE ON SCHEMA private TO authenticated, service_role;

CREATE OR REPLACE FUNCTION private.is_org_member(_org uuid, _user uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.organization_members m WHERE m.organization_id = _org AND m.user_id = _user)
      OR EXISTS (SELECT 1 FROM public.organizations o WHERE o.id = _org AND o.owner_id = _user);
$$;

CREATE OR REPLACE FUNCTION private.is_org_admin(_org uuid, _user uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.organization_members m WHERE m.organization_id = _org AND m.user_id = _user AND m.role IN ('owner','admin'))
      OR EXISTS (SELECT 1 FROM public.organizations o WHERE o.id = _org AND o.owner_id = _user);
$$;

CREATE OR REPLACE FUNCTION private.shares_org(_a uuid, _b uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.organization_members m1
    JOIN public.organization_members m2 ON m1.organization_id = m2.organization_id
    WHERE m1.user_id = _a AND m2.user_id = _b
  );
$$;

DROP POLICY "profiles_select" ON public.profiles;
CREATE POLICY "profiles_select" ON public.profiles FOR SELECT TO authenticated
  USING (id = auth.uid() OR private.shares_org(id, auth.uid()));

DROP POLICY "orgs_select" ON public.organizations;
CREATE POLICY "orgs_select" ON public.organizations FOR SELECT TO authenticated
  USING (private.is_org_member(id, auth.uid()));
DROP POLICY "orgs_update" ON public.organizations;
CREATE POLICY "orgs_update" ON public.organizations FOR UPDATE TO authenticated
  USING (private.is_org_admin(id, auth.uid())) WITH CHECK (private.is_org_admin(id, auth.uid()));

DROP POLICY "org_members_select" ON public.organization_members;
CREATE POLICY "org_members_select" ON public.organization_members FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR private.is_org_member(organization_id, auth.uid()));
DROP POLICY "org_members_insert" ON public.organization_members;
CREATE POLICY "org_members_insert" ON public.organization_members FOR INSERT TO authenticated
  WITH CHECK (private.is_org_admin(organization_id, auth.uid()));
DROP POLICY "org_members_update" ON public.organization_members;
CREATE POLICY "org_members_update" ON public.organization_members FOR UPDATE TO authenticated
  USING (private.is_org_admin(organization_id, auth.uid())) WITH CHECK (private.is_org_admin(organization_id, auth.uid()));
DROP POLICY "org_members_delete" ON public.organization_members;
CREATE POLICY "org_members_delete" ON public.organization_members FOR DELETE TO authenticated
  USING (private.is_org_admin(organization_id, auth.uid()));

DROP POLICY "teams_select" ON public.teams;
CREATE POLICY "teams_select" ON public.teams FOR SELECT TO authenticated
  USING (private.is_org_member(organization_id, auth.uid()));
DROP POLICY "teams_insert" ON public.teams;
CREATE POLICY "teams_insert" ON public.teams FOR INSERT TO authenticated
  WITH CHECK (private.is_org_admin(organization_id, auth.uid()));
DROP POLICY "teams_update" ON public.teams;
CREATE POLICY "teams_update" ON public.teams FOR UPDATE TO authenticated
  USING (private.is_org_admin(organization_id, auth.uid())) WITH CHECK (private.is_org_admin(organization_id, auth.uid()));
DROP POLICY "teams_delete" ON public.teams;
CREATE POLICY "teams_delete" ON public.teams FOR DELETE TO authenticated
  USING (private.is_org_admin(organization_id, auth.uid()));

DROP POLICY "team_members_select" ON public.team_members;
CREATE POLICY "team_members_select" ON public.team_members FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.teams t WHERE t.id = team_id AND private.is_org_member(t.organization_id, auth.uid())));
DROP POLICY "team_members_write" ON public.team_members;
CREATE POLICY "team_members_write" ON public.team_members FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.teams t WHERE t.id = team_id AND private.is_org_admin(t.organization_id, auth.uid())))
  WITH CHECK (EXISTS (SELECT 1 FROM public.teams t WHERE t.id = team_id AND private.is_org_admin(t.organization_id, auth.uid())));

DROP FUNCTION IF EXISTS public.is_org_member(uuid, uuid);
DROP FUNCTION IF EXISTS public.is_org_admin(uuid, uuid);
DROP FUNCTION IF EXISTS public.shares_org(uuid, uuid);
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.add_owner_membership() FROM PUBLIC, anon, authenticated;