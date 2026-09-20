import { Download, FileArchive, FileImage, FileText, FileVideo, Table2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { UserCell } from "@/components/shared/user-avatar";
import { fmtDate } from "@/lib/format";
import type { FileRecord } from "@/lib/types";

const blobRegistry = new Map<string, { url: string; type: string }>();

export function registerFileBlob(id: string, file: File) {
  const existing = blobRegistry.get(id);
  if (existing) URL.revokeObjectURL(existing.url);
  blobRegistry.set(id, { url: URL.createObjectURL(file), type: file.type });
}

export function getFileBlob(id: string) {
  return blobRegistry.get(id);
}

export function fileKind(file: { name: string; mime_type?: string }) {
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  const mime = file.mime_type ?? "";
  if (mime.startsWith("image/") || ["png", "jpg", "jpeg", "gif", "webp", "svg", "fig"].includes(ext)) return "image" as const;
  if (mime.startsWith("video/") || ["mp4", "mov", "webm", "avi"].includes(ext)) return "video" as const;
  if (["csv", "xls", "xlsx"].includes(ext)) return "sheet" as const;
  if (["zip", "rar", "7z", "tar", "gz"].includes(ext)) return "archive" as const;
  return "document" as const;
}

const KIND_ICON = {
  image: FileImage,
  video: FileVideo,
  sheet: Table2,
  archive: FileArchive,
  document: FileText,
};

const KIND_LABEL = {
  image: "Image",
  video: "Video",
  sheet: "Spreadsheet",
  archive: "Archive",
  document: "Document",
};

export function downloadFile(file: FileRecord) {
  const stored = getFileBlob(file.id);
  if (stored) {
    const link = document.createElement("a");
    link.href = stored.url;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    link.remove();
    toast.success(`Downloading ${file.name}`);
    return;
  }

  const summary = [
    `File: ${file.name}`,
    `Folder: ${file.folder}`,
    `Type: ${KIND_LABEL[fileKind(file)]} (${file.mime_type || "unknown"})`,
    `Size: ${Math.round(file.size_kb)} KB`,
    `Uploaded: ${fmtDate(file.created_at)}`,
    `Shared: ${file.shared ? "Yes" : "No"}`,
    "",
    "This workspace file has no stored binary yet, so this download contains its details only.",
  ].join("\n");

  const blob = new Blob([summary], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${file.name}.txt`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  toast.success(`Downloading ${file.name}`);
}

export function FilePreviewDialog({
  file,
  open,
  onOpenChange,
}: {
  file: FileRecord | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  if (!file) return null;
  const kind = fileKind(file);
  const Icon = KIND_ICON[kind];
  const stored = getFileBlob(file.id);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="break-words pr-6 text-base">{file.name}</DialogTitle>
          <DialogDescription>
            {file.folder} · {KIND_LABEL[kind]} · {Math.round(file.size_kb)} KB
          </DialogDescription>
        </DialogHeader>

        <div className="flex aspect-[16/9] w-full items-center justify-center overflow-hidden rounded-xl border bg-muted/40 text-center">
          {stored && stored.type.startsWith("image/") ? (
            <img src={stored.url} alt={file.name} className="h-full w-full object-contain" />
          ) : stored && stored.type.startsWith("video/") ? (
            <video src={stored.url} controls className="h-full w-full object-contain" />
          ) : stored && (stored.type === "application/pdf" || stored.type.startsWith("text/")) ? (
            <iframe src={stored.url} title={file.name} className="h-full w-full" />
          ) : (
            <div className="flex flex-col items-center justify-center gap-3">
              <Icon className="size-12 text-primary" />
              <p className="px-6 text-sm text-muted-foreground">
                {stored
                  ? `No inline preview for ${KIND_LABEL[kind].toLowerCase()} files — download to open it.`
                  : "This sample file has no stored content, so a placeholder is shown."}
              </p>
            </div>
          )}
        </div>

        <dl className="grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-xs uppercase tracking-wide text-muted-foreground">Uploaded by</dt>
            <dd className="mt-1">
              <UserCell userId={file.uploader_id} subtitle={fmtDate(file.created_at)} />
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-muted-foreground">Sharing</dt>
            <dd className="mt-1">
              {file.shared ? <Badge variant="secondary">Shared</Badge> : <Badge variant="outline">Private</Badge>}
            </dd>
          </div>
        </dl>

        <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button onClick={() => downloadFile(file)}>
            <Download className="size-4" /> Download
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
