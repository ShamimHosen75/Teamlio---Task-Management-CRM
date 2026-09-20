CREATE TABLE public.organization_settings (
  organization_id uuid PRIMARY KEY REFERENCES public.organizations(id) ON DELETE CASCADE,
  currency text NOT NULL DEFAULT 'USD',
  timezone text NOT NULL DEFAULT 'UTC',
  admin_email text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.organization_settings TO authenticated;
GRANT ALL ON public.organization_settings TO service_role;

ALTER TABLE public.organization_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "org_settings_select" ON public.organization_settings
  FOR SELECT TO authenticated
  USING (private.is_org_member(organization_id, auth.uid()));

CREATE POLICY "org_settings_insert" ON public.organization_settings
  FOR INSERT TO authenticated
  WITH CHECK (private.is_org_admin(organization_id, auth.uid()));

CREATE POLICY "org_settings_update" ON public.organization_settings
  FOR UPDATE TO authenticated
  USING (private.is_org_admin(organization_id, auth.uid()))
  WITH CHECK (private.is_org_admin(organization_id, auth.uid()));

CREATE POLICY "org_settings_delete" ON public.organization_settings
  FOR DELETE TO authenticated
  USING (private.is_org_admin(organization_id, auth.uid()));

CREATE TRIGGER set_organization_settings_updated_at
  BEFORE UPDATE ON public.organization_settings
  FOR EACH ROW EXECUTE FUNCTION public.set_record_updated_at();