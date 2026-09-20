CREATE TABLE public.projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  category text NOT NULL DEFAULT 'General',
  status text NOT NULL DEFAULT 'planned' CHECK (status IN ('backlog', 'planned', 'in_progress', 'review', 'paused', 'completed')),
  priority text NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  manager_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  start_date date,
  due_date date,
  progress integer NOT NULL DEFAULT 0 CHECK (progress BETWEEN 0 AND 100),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.projects TO authenticated;
GRANT ALL ON public.projects TO service_role;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "projects_select" ON public.projects FOR SELECT TO authenticated USING (private.is_org_member(organization_id, auth.uid()));
CREATE POLICY "projects_insert" ON public.projects FOR INSERT TO authenticated WITH CHECK (private.is_org_admin(organization_id, auth.uid()));
CREATE POLICY "projects_update" ON public.projects FOR UPDATE TO authenticated USING (private.is_org_admin(organization_id, auth.uid()) OR manager_id = auth.uid()) WITH CHECK (private.is_org_admin(organization_id, auth.uid()) OR manager_id = auth.uid());
CREATE POLICY "projects_delete" ON public.projects FOR DELETE TO authenticated USING (private.is_org_admin(organization_id, auth.uid()));

CREATE TABLE public.project_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  category text NOT NULL DEFAULT 'General',
  status text NOT NULL DEFAULT 'backlog' CHECK (status IN ('backlog', 'to_do', 'in_progress', 'review', 'paused', 'completed')),
  priority text NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  assignee_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  due_date date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.project_tasks TO authenticated;
GRANT ALL ON public.project_tasks TO service_role;
ALTER TABLE public.project_tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "project_tasks_select" ON public.project_tasks FOR SELECT TO authenticated USING (private.is_org_member(organization_id, auth.uid()));
CREATE POLICY "project_tasks_insert" ON public.project_tasks FOR INSERT TO authenticated WITH CHECK (private.is_org_admin(organization_id, auth.uid()) OR EXISTS (SELECT 1 FROM public.projects p WHERE p.id = project_id AND p.organization_id = organization_id AND p.manager_id = auth.uid()));
CREATE POLICY "project_tasks_update" ON public.project_tasks FOR UPDATE TO authenticated USING (private.is_org_admin(organization_id, auth.uid()) OR assignee_id = auth.uid() OR EXISTS (SELECT 1 FROM public.projects p WHERE p.id = project_id AND p.manager_id = auth.uid())) WITH CHECK (private.is_org_admin(organization_id, auth.uid()) OR assignee_id = auth.uid() OR EXISTS (SELECT 1 FROM public.projects p WHERE p.id = project_id AND p.manager_id = auth.uid()));
CREATE POLICY "project_tasks_delete" ON public.project_tasks FOR DELETE TO authenticated USING (private.is_org_admin(organization_id, auth.uid()) OR EXISTS (SELECT 1 FROM public.projects p WHERE p.id = project_id AND p.manager_id = auth.uid()));

CREATE OR REPLACE FUNCTION public.set_record_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.set_record_updated_at() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.set_record_updated_at() TO service_role;
CREATE TRIGGER set_projects_updated_at BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION public.set_record_updated_at();
CREATE TRIGGER set_project_tasks_updated_at BEFORE UPDATE ON public.project_tasks FOR EACH ROW EXECUTE FUNCTION public.set_record_updated_at();