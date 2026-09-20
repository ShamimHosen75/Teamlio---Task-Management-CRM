CREATE TABLE public.crm_clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  company text NOT NULL,
  contact_name text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  phone text NOT NULL DEFAULT '',
  website text NOT NULL DEFAULT '',
  industry text NOT NULL DEFAULT 'General',
  status text NOT NULL DEFAULT 'active',
  notes text NOT NULL DEFAULT '',
  owner_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT crm_clients_status_check CHECK (status IN ('active','prospect','on_hold','churned'))
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.crm_clients TO authenticated;
GRANT ALL ON public.crm_clients TO service_role;
ALTER TABLE public.crm_clients ENABLE ROW LEVEL SECURITY;
CREATE POLICY crm_clients_select ON public.crm_clients FOR SELECT TO authenticated USING (private.is_org_member(organization_id, auth.uid()));
CREATE POLICY crm_clients_write ON public.crm_clients FOR ALL TO authenticated USING (private.is_org_member(organization_id, auth.uid())) WITH CHECK (private.is_org_member(organization_id, auth.uid()));

CREATE TABLE public.crm_leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  company text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  phone text NOT NULL DEFAULT '',
  source text NOT NULL DEFAULT 'Manual',
  status text NOT NULL DEFAULT 'new',
  estimated_value numeric(14,2) NOT NULL DEFAULT 0,
  notes text NOT NULL DEFAULT '',
  assigned_to uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  converted_client_id uuid REFERENCES public.crm_clients(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT crm_leads_status_check CHECK (status IN ('new','contacted','qualified','proposal','negotiation','won','lost'))
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.crm_leads TO authenticated;
GRANT ALL ON public.crm_leads TO service_role;
ALTER TABLE public.crm_leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY crm_leads_select ON public.crm_leads FOR SELECT TO authenticated USING (private.is_org_member(organization_id, auth.uid()));
CREATE POLICY crm_leads_write ON public.crm_leads FOR ALL TO authenticated USING (private.is_org_member(organization_id, auth.uid())) WITH CHECK (private.is_org_member(organization_id, auth.uid()));

CREATE TABLE public.crm_deals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  title text NOT NULL,
  client_id uuid REFERENCES public.crm_clients(id) ON DELETE SET NULL,
  lead_id uuid REFERENCES public.crm_leads(id) ON DELETE SET NULL,
  value numeric(14,2) NOT NULL DEFAULT 0,
  probability integer NOT NULL DEFAULT 50 CHECK (probability BETWEEN 0 AND 100),
  stage text NOT NULL DEFAULT 'new_opportunity',
  expected_close_date date,
  notes text NOT NULL DEFAULT '',
  owner_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT crm_deals_stage_check CHECK (stage IN ('new_opportunity','qualified','proposal','negotiation','won','lost'))
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.crm_deals TO authenticated;
GRANT ALL ON public.crm_deals TO service_role;
ALTER TABLE public.crm_deals ENABLE ROW LEVEL SECURITY;
CREATE POLICY crm_deals_select ON public.crm_deals FOR SELECT TO authenticated USING (private.is_org_member(organization_id, auth.uid()));
CREATE POLICY crm_deals_write ON public.crm_deals FOR ALL TO authenticated USING (private.is_org_member(organization_id, auth.uid())) WITH CHECK (private.is_org_member(organization_id, auth.uid()));

CREATE INDEX crm_clients_org_idx ON public.crm_clients(organization_id);
CREATE INDEX crm_leads_org_idx ON public.crm_leads(organization_id);
CREATE INDEX crm_deals_org_idx ON public.crm_deals(organization_id);

CREATE TRIGGER set_crm_clients_updated_at BEFORE UPDATE ON public.crm_clients FOR EACH ROW EXECUTE FUNCTION public.set_record_updated_at();
CREATE TRIGGER set_crm_leads_updated_at BEFORE UPDATE ON public.crm_leads FOR EACH ROW EXECUTE FUNCTION public.set_record_updated_at();
CREATE TRIGGER set_crm_deals_updated_at BEFORE UPDATE ON public.crm_deals FOR EACH ROW EXECUTE FUNCTION public.set_record_updated_at();