import { cn } from "@/lib/utils";

type Tone = "neutral" | "info" | "success" | "warning" | "destructive" | "primary" | "purple";

const toneClass: Record<Tone, string> = {
  neutral: "bg-muted text-muted-foreground border-transparent",
  info: "bg-info/10 text-info border-info/20",
  success: "bg-success/10 text-success border-success/20",
  warning: "bg-warning/15 text-warning-foreground border-warning/30",
  destructive: "bg-destructive/10 text-destructive border-destructive/20",
  primary: "bg-primary-soft text-primary border-primary/20",
  purple: "bg-chart-5/10 text-chart-5 border-chart-5/20",
};

const STATUS_TONES: Record<string, Tone> = {
  // projects
  Draft: "neutral",
  Planned: "info",
  "In Progress": "primary",
  "Under Review": "warning",
  "On Hold": "warning",
  Completed: "success",
  Cancelled: "neutral",
  Overdue: "destructive",
  Archived: "neutral",
  // tasks
  Backlog: "neutral",
  "To Do": "info",
  Review: "warning",
  Blocked: "destructive",
  // crm
  New: "info",
  Contacted: "primary",
  Qualified: "purple",
  Proposal: "warning",
  Negotiation: "warning",
  Won: "success",
  Lost: "destructive",
  "New Opportunity": "info",
  // users / general
  Active: "success",
  Inactive: "neutral",
  Invited: "info",
  Suspended: "destructive",
  Locked: "destructive",
  Prospect: "info",
  Churned: "destructive",
  Pending: "warning",
  Approved: "success",
  Rejected: "destructive",
  Submitted: "success",
  Late: "warning",
  Missing: "destructive",
  Reviewed: "info",
  Sent: "info",
  Accepted: "success",
  Expired: "neutral",
  "Partially Paid": "warning",
  Paid: "success",
  Failed: "destructive",
  Success: "success",
  Skipped: "neutral",
  Waiting: "neutral",
  Processing: "info",
  Publishing: "primary",
  Published: "success",
  Retrying: "warning",
  Scheduled: "info",
  Idea: "neutral",
  Designing: "purple",
  "Changes Requested": "warning",
  Upcoming: "info",
  "On Track": "success",
  "At Risk": "warning",
  "Off Track": "destructive",
  Converted: "success",
  Assigned: "primary",
};

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  const tone = STATUS_TONES[status] ?? "neutral";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-medium",
        toneClass[tone],
        className,
      )}
    >
      <span className="size-1.5 rounded-full bg-current opacity-70" />
      {status}
    </span>
  );
}

const PRIORITY_TONES: Record<string, Tone> = {
  Low: "neutral",
  Medium: "info",
  High: "warning",
  Urgent: "destructive",
};

export function PriorityBadge({ priority, className }: { priority: string; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium",
        toneClass[PRIORITY_TONES[priority] ?? "neutral"],
        className,
      )}
    >
      {priority}
    </span>
  );
}
