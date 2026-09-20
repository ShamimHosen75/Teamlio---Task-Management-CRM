CREATE TABLE public.project_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  category text NOT NULL DEFAULT 'General',
  current_version integer NOT NULL DEFAULT 0,
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.project_documents TO authenticated;
GRANT ALL ON public.project_documents TO service_role;
ALTER TABLE public.project_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY project_documents_select ON public.project_documents FOR SELECT TO authenticated
USING (private.is_org_member(organization_id, auth.uid()));

CREATE POLICY project_documents_insert ON public.project_documents FOR INSERT TO authenticated
WITH CHECK (private.is_org_admin(organization_id, auth.uid()) OR EXISTS (
  SELECT 1 FROM public.projects p WHERE p.id = project_id AND p.manager_id = auth.uid()
));

CREATE POLICY project_documents_update ON public.project_documents FOR UPDATE TO authenticated
USING (private.is_org_admin(organization_id, auth.uid()) OR EXISTS (
  SELECT 1 FROM public.projects p WHERE p.id = project_id AND p.manager_id = auth.uid()
))
WITH CHECK (private.is_org_admin(organization_id, auth.uid()) OR EXISTS (
  SELECT 1 FROM public.projects p WHERE p.id = project_id AND p.manager_id = auth.uid()
));

CREATE POLICY project_documents_delete ON public.project_documents FOR DELETE TO authenticated
USING (private.is_org_admin(organization_id, auth.uid()) OR EXISTS (
  SELECT 1 FROM public.projects p WHERE p.id = project_id AND p.manager_id = auth.uid()
));

CREATE TRIGGER set_project_documents_updated_at BEFORE UPDATE ON public.project_documents
FOR EACH ROW EXECUTE FUNCTION public.set_record_updated_at();

CREATE TABLE public.project_document_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  document_id uuid NOT NULL REFERENCES public.project_documents(id) ON DELETE CASCADE,
  version integer NOT NULL,
  file_name text NOT NULL,
  mime_type text NOT NULL DEFAULT 'application/octet-stream',
  size_bytes bigint NOT NULL DEFAULT 0,
  storage_path text NOT NULL,
  notes text NOT NULL DEFAULT '',
  uploaded_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (document_id, version)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.project_document_versions TO authenticated;
GRANT ALL ON public.project_document_versions TO service_role;
ALTER TABLE public.project_document_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY project_document_versions_select ON public.project_document_versions FOR SELECT TO authenticated
USING (private.is_org_member(organization_id, auth.uid()));

CREATE POLICY project_document_versions_insert ON public.project_document_versions FOR INSERT TO authenticated
WITH CHECK (private.is_org_admin(organization_id, auth.uid()) OR EXISTS (
  SELECT 1 FROM public.project_documents d
  JOIN public.projects p ON p.id = d.project_id
  WHERE d.id = document_id AND p.manager_id = auth.uid()
));

CREATE POLICY project_document_versions_delete ON public.project_document_versions FOR DELETE TO authenticated
USING (private.is_org_admin(organization_id, auth.uid()) OR EXISTS (
  SELECT 1 FROM public.project_documents d
  JOIN public.projects p ON p.id = d.project_id
  WHERE d.id = document_id AND p.manager_id = auth.uid()
));

CREATE INDEX project_documents_project_idx ON public.project_documents(project_id);
CREATE INDEX project_document_versions_document_idx ON public.project_document_versions(document_id);

CREATE POLICY "project docs read" ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'project-documents' AND private.is_org_member(((storage.foldername(name))[1])::uuid, auth.uid()));

CREATE POLICY "project docs insert" ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'project-documents' AND private.is_org_member(((storage.foldername(name))[1])::uuid, auth.uid()));

CREATE POLICY "project docs delete" ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'project-documents' AND private.is_org_admin(((storage.foldername(name))[1])::uuid, auth.uid()));