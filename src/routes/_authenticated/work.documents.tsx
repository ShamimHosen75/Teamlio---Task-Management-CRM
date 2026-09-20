import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Building2, Download, Eye, FileText, History, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { EmptyState, SkeletonGrid } from "@/components/shared/states";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { FormDrawer } from "@/components/shared/form-drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { OrgSwitcher, memberLabel } from "@/components/cloud/work-ui";
import { useActiveOrg } from "@/hooks/use-active-org";
import {
  useCreateDocument,
  useDeleteDocument,
  useOrgDocuments,
  useOrgDocumentVersions,
  useOrgMembers,
  useOrgProjects,
  useSession,
  useUploadDocumentVersion,
  getDocumentUrl,
  type CloudDocument,
  type CloudDocumentVersion,
} from "@/hooks/use-cloud";
import { fmtDate } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/work/documents")({
  head: () => ({
    meta: [
      { title: "Project Documents — Project CRM" },
      { name: "description", content: "Upload, preview and version real project documents in your workspace." },
      { property: "og:title", content: "Project Documents — Project CRM" },
      { property: "og:description", content: "Shared project document storage with version history." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DocumentsPage,
});

function fmtSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function DocumentsPage() {
  const { user } = useSession();
  const { orgs, activeOrg, activeOrgId, setOrgId, isLoading } = useActiveOrg();
  const { data: members = [] } = useOrgMembers(activeOrgId);
  const { data: projects = [] } = useOrgProjects(activeOrgId);
  const { data: documents = [], isLoading: docsLoading } = useOrgDocuments(activeOrgId);
  const { data: versions = [] } = useOrgDocumentVersions(activeOrgId);
  const [projectFilter, setProjectFilter] = useState("all");
  const [preview, setPreview] = useState<{ url: string; version: CloudDocumentVersion } | null>(null);

  const myRole = useMemo(() => members.find((m) => m.user_id === user?.id)?.role, [members, user]);
  const canManage = activeOrg?.owner_id === user?.id || myRole === "owner" || myRole === "admin";

  const deleteDocument = useDeleteDocument();
  const rows = documents.filter((d) => projectFilter === "all" || d.project_id === projectFilter);
  const totalSize = versions.reduce((sum, v) => sum + Number(v.size_bytes ?? 0), 0);

  async function openPreview(version: CloudDocumentVersion) {
    try {
      const url = await getDocumentUrl(version.storage_path);
      setPreview({ url, version });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not open this file");
    }
  }

  async function download(version: CloudDocumentVersion) {
    try {
      const url = await getDocumentUrl(version.storage_path);
      window.open(url, "_blank", "noopener");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not download this file");
    }
  }

  return (
    <>
      <PageHeader
        title="Project documents"
        description="Real files attached to your live projects, with preview and full version history."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <OrgSwitcher orgs={orgs} value={activeOrgId} onChange={setOrgId} />
            {canManage && projects.length ? (
              <NewDocumentDrawer organizationId={activeOrgId} projects={projects} />
            ) : null}
          </div>
        }
      />

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading your workspace…</p>
      ) : !activeOrg ? (
        <EmptyState
          icon={Building2}
          title="No organization yet"
          description="Create your first organization in Workspace Admin to store project documents."
        />
      ) : (
        <div className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <StatCard label="Documents" value={documents.length} icon={FileText} loading={docsLoading} hint={activeOrg.name} />
            <StatCard label="Versions stored" value={versions.length} icon={History} loading={docsLoading} />
            <StatCard label="Storage used" value={fmtSize(totalSize)} icon={Upload} loading={docsLoading} />
          </div>

          <Select value={projectFilter} onValueChange={setProjectFilter}>
            <SelectTrigger className="w-full sm:w-[240px]" aria-label="Filter by project">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All projects</SelectItem>
              {projects.map((p) => (
                <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {docsLoading ? (
            <SkeletonGrid />
          ) : rows.length === 0 ? (
            <EmptyState
              icon={FileText}
              title={documents.length ? "No documents for this project" : "No documents yet"}
              description={
                projects.length
                  ? "Upload a contract, brief or deliverable to start a version history."
                  : "Create a live project first, then attach its documents here."
              }
            />
          ) : (
            <div className="grid gap-4 xl:grid-cols-2">
              {rows.map((doc) => {
                const docVersions = versions
                  .filter((v) => v.document_id === doc.id)
                  .sort((a, b) => b.version - a.version);
                const latest = docVersions[0];
                const project = projects.find((p) => p.id === doc.project_id);
                return (
                   <article key={doc.id} className="surface-card min-w-0 p-4">
                    <div className="flex items-start gap-3">
                      <FileText className="mt-0.5 size-5 text-primary" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{doc.name}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {project?.name ?? "Unknown project"} · {doc.category}
                        </p>
                      </div>
                      <Badge variant="secondary">v{doc.current_version}</Badge>
                    </div>

                    {doc.description ? (
                      <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">{doc.description}</p>
                    ) : null}

                    {latest ? (
                       <div className="mt-3 grid grid-cols-4 items-center gap-2 sm:flex sm:flex-wrap">
                         <span className="col-span-4 min-w-0 truncate text-xs text-muted-foreground sm:flex-1">
                          {latest.file_name} · {fmtSize(Number(latest.size_bytes ?? 0))} · {fmtDate(latest.created_at)}
                        </span>
                        <Button variant="ghost" size="icon" aria-label="Preview document" onClick={() => openPreview(latest)}>
                          <Eye className="size-4" />
                        </Button>
                        <Button variant="ghost" size="icon" aria-label="Download document" onClick={() => download(latest)}>
                          <Download className="size-4" />
                        </Button>
                        {canManage ? (
                          <>
                            <NewVersionDrawer organizationId={activeOrgId} document={doc} />
                            <ConfirmDialog
                              trigger={
                                <Button variant="ghost" size="icon" aria-label="Delete document">
                                  <Trash2 className="size-4" />
                                </Button>
                              }
                              title="Delete this document?"
                              description={`${doc.name} and all ${docVersions.length} version(s) will be removed.`}
                              confirmLabel="Delete"
                              destructive
                              onConfirm={() =>
                                deleteDocument.mutate(
                                  { id: doc.id, paths: docVersions.map((v) => v.storage_path) },
                                  {
                                    onSuccess: () => toast.success("Document deleted"),
                                    onError: (e) => toast.error(e.message),
                                  },
                                )
                              }
                            />
                          </>
                        ) : null}
                      </div>
                    ) : null}

                    {docVersions.length > 1 ? (
                      <ul className="mt-3 divide-y border-t text-xs">
                        {docVersions.slice(1).map((v) => (
                          <li key={v.id} className="flex items-center gap-2 py-2">
                            <Badge variant="outline">v{v.version}</Badge>
                            <span className="min-w-0 flex-1 truncate text-muted-foreground">
                              {v.notes || v.file_name} · {memberLabel(members, v.uploaded_by)} · {fmtDate(v.created_at)}
                            </span>
                            <Button variant="ghost" size="icon" aria-label={`Preview version ${v.version}`} onClick={() => openPreview(v)}>
                              <Eye className="size-4" />
                            </Button>
                            <Button variant="ghost" size="icon" aria-label={`Download version ${v.version}`} onClick={() => download(v)}>
                              <Download className="size-4" />
                            </Button>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </article>
                );
              })}
            </div>
          )}
        </div>
      )}

      <Dialog open={!!preview} onOpenChange={(open) => !open && setPreview(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="truncate">
              {preview ? `${preview.version.file_name} · v${preview.version.version}` : ""}
            </DialogTitle>
          </DialogHeader>
          {preview ? (
            preview.version.mime_type.startsWith("image/") ? (
              <img src={preview.url} alt={preview.version.file_name} className="max-h-[70vh] w-full rounded-md object-contain" />
            ) : preview.version.mime_type === "application/pdf" ? (
              <iframe src={preview.url} title={preview.version.file_name} className="h-[70vh] w-full rounded-md border" />
            ) : (
              <div className="py-8 text-center text-sm text-muted-foreground">
                <p>This file type can’t be previewed in the browser.</p>
                <Button className="mt-3" onClick={() => window.open(preview.url, "_blank", "noopener")}>
                  Download file
                </Button>
              </div>
            )
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}

function NewDocumentDrawer({
  organizationId,
  projects,
}: {
  organizationId: string | undefined;
  projects: { id: string; name: string }[];
}) {
  const create = useCreateDocument(organizationId);
  const [projectId, setProjectId] = useState("");
  const [name, setName] = useState("");
  const [category, setCategory] = useState("General");
  const [description, setDescription] = useState("");
  const [notes, setNotes] = useState("Initial upload");
  const [file, setFile] = useState<File | null>(null);

  return (
    <FormDrawer
      trigger={
        <Button size="sm">
          <Upload className="size-4" /> Upload document
        </Button>
      }
      title="Upload project document"
      description="Attach a file to a live project. Later uploads become new versions."
      submitLabel="Upload"
      onSubmit={async () => {
        if (!projectId || !name.trim() || !file) {
          toast.error("Pick a project, name the document and choose a file");
          return false;
        }
        try {
          await create.mutateAsync({
            project_id: projectId,
            name: name.trim(),
            description,
            category: category.trim() || "General",
            file,
            notes,
          });
          toast.success("Document uploaded");
          setName("");
          setDescription("");
          setFile(null);
          return true;
        } catch (error) {
          toast.error(error instanceof Error ? error.message : "Upload failed");
          return false;
        }
      }}
    >
      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label>Project</Label>
          <Select value={projectId} onValueChange={setProjectId}>
            <SelectTrigger><SelectValue placeholder="Select a project" /></SelectTrigger>
            <SelectContent>
              {projects.map((p) => (
                <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="doc-name">Document name</Label>
          <Input id="doc-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Statement of work" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="doc-category">Category</Label>
          <Input id="doc-category" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Contract" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="doc-desc">Description</Label>
          <Textarea id="doc-desc" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="doc-file">File</Label>
          <Input id="doc-file" type="file" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="doc-notes">Version note</Label>
          <Input id="doc-notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>
      </div>
    </FormDrawer>
  );
}

function NewVersionDrawer({
  organizationId,
  document: doc,
}: {
  organizationId: string | undefined;
  document: CloudDocument;
}) {
  const upload = useUploadDocumentVersion(organizationId);
  const [file, setFile] = useState<File | null>(null);
  const [notes, setNotes] = useState("");

  return (
    <FormDrawer
      trigger={
        <Button variant="ghost" size="icon" aria-label="Upload new version">
          <History className="size-4" />
        </Button>
      }
      title={`New version of ${doc.name}`}
      description={`This will be saved as version ${doc.current_version + 1}.`}
      submitLabel="Upload version"
      onSubmit={async () => {
        if (!file) {
          toast.error("Choose a file first");
          return false;
        }
        try {
          await upload.mutateAsync({ document: doc, file, notes });
          toast.success(`Version ${doc.current_version + 1} uploaded`);
          setFile(null);
          setNotes("");
          return true;
        } catch (error) {
          toast.error(error instanceof Error ? error.message : "Upload failed");
          return false;
        }
      }}
    >
      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="ver-file">File</Label>
          <Input id="ver-file" type="file" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="ver-notes">What changed?</Label>
          <Textarea id="ver-notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} />
        </div>
      </div>
    </FormDrawer>
  );
}
