DROP POLICY IF EXISTS orgs_select ON public.organizations;
CREATE POLICY orgs_select ON public.organizations FOR SELECT TO authenticated
USING (owner_id = auth.uid() OR private.is_org_member(id, auth.uid()));