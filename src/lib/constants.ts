import type { DealStage, Priority, ProjectStatus, TaskStatus } from "@/lib/types";

export const TASK_STATUSES: TaskStatus[] = [
  "Backlog",
  "To Do",
  "In Progress",
  "Review",
  "Completed",
  "Blocked",
];

export const PROJECT_STATUSES: ProjectStatus[] = [
  "Draft",
  "Planned",
  "In Progress",
  "Under Review",
  "On Hold",
  "Completed",
  "Cancelled",
  "Overdue",
  "Archived",
];

export const PRIORITIES: Priority[] = ["Low", "Medium", "High", "Urgent"];

export const DEAL_STAGES: DealStage[] = [
  "New Opportunity",
  "Qualified",
  "Proposal",
  "Negotiation",
  "Won",
  "Lost",
];

export const LEAD_STATUSES = ["New", "Contacted", "Qualified", "Proposal", "Negotiation", "Won", "Lost"];

export const LEAD_SOURCES = [
  "Manual",
  "Website",
  "Facebook",
  "Instagram",
  "WhatsApp",
  "Referral",
  "Campaign",
  "Other",
];

export const CONTENT_STATUSES = [
  "Idea",
  "Planned",
  "In Progress",
  "Designing",
  "Review",
  "Changes Requested",
  "Approved",
  "Scheduled",
  "Publishing",
  "Published",
  "Failed",
  "Cancelled",
];

export const CONTENT_WORKFLOW = [
  "Idea",
  "Brief",
  "Copywriting",
  "Design / Video",
  "Review",
  "Changes Requested",
  "Approval",
  "Scheduled",
  "Published",
  "Performance",
];

export const DATE_RANGES = ["Today", "7 Days", "30 Days", "This Month", "Quarter", "Custom Range"];

export const AUTOMATION_TRIGGERS = [
  "Lead Created",
  "Deal Won",
  "Project Created",
  "Task Overdue",
  "Daily Update Missing",
  "Leave Requested",
  "Content Approved",
  "WhatsApp Message Received",
];

export const AUTOMATION_CONDITIONS = [
  "Project Type",
  "Lead Source",
  "Team",
  "User",
  "Priority",
  "Status",
  "Value",
  "Score",
];

export const AUTOMATION_ACTIONS = [
  "Assign User",
  "Create Task",
  "Change Status",
  "Notify",
  "Create Project",
  "Create Chat Room",
  "Send Email (placeholder)",
  "Send WhatsApp (placeholder)",
  "Generate AI Summary (placeholder)",
  "Call Webhook (placeholder)",
];
