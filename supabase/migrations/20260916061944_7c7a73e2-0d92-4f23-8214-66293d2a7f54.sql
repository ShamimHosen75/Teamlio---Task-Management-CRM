CREATE TABLE public.organization_invites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  email text NOT NULL,
  role public.org_role NOT NULL DEFAULT 'member',
  job_title text,
  invited_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  accepted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organization_id, email)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.organization_invites TO authenticated;
GRANT ALL ON public.organization_invites TO service_role;
ALTER TABLE public.organization_invites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "invites_select" ON public.organization_invites FOR SELECT TO authenticated
  USING (private.is_org_member(organization_id, auth.uid()) OR lower(email) = lower(coalesce(auth.jwt() ->> 'email', '')));
CREATE POLICY "invites_write" ON public.organization_invites FOR ALL TO authenticated
  USING (private.is_org_admin(organization_id, auth.uid()))
  WITH CHECK (private.is_org_admin(organization_id, auth.uid()));

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.email, ''),
    NEW.raw_user_meta_data ->> 'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.organization_members (organization_id, user_id, role, status, job_title)
  SELECT i.organization_id, NEW.id, i.role, 'active', i.job_title
  FROM public.organization_invites i
  WHERE lower(i.email) = lower(COALESCE(NEW.email, '')) AND i.accepted_at IS NULL
  ON CONFLICT (organization_id, user_id) DO NOTHING;

  UPDATE public.organization_invites
  SET accepted_at = now()
  WHERE lower(email) = lower(COALESCE(NEW.email, '')) AND accepted_at IS NULL;

  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;