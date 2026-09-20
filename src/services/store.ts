import * as seed from "@/lib/mock/seed";

/**
 * In-memory store seeded with demo data. This is the only place mock records
 * live — services read and write through it, so swapping in a Supabase
 * provider later means replacing the service implementations only.
 */
export const store = {
  organizations: [...seed.organizations],
  roles: [...seed.roles],
  users: [...seed.users],
  teams: [...seed.teams],
  teamMembers: [...seed.teamMembers],
  clients: [...seed.clients],
  contacts: [...seed.contacts],
  leads: [...seed.leads],
  deals: [...seed.deals],
  projects: [...seed.projects],
  projectMembers: [...seed.projectMembers],
  projectTemplates: [...seed.projectTemplates],
  milestones: [...seed.milestones],
  tasks: [...seed.tasks],
  comments: [...seed.comments],
  dailyUpdates: [...seed.dailyUpdates],
  leaveRequests: [...seed.leaveRequests],
  meetings: [...seed.meetings],
  chatRooms: [...seed.chatRooms],
  chatMessages: [...seed.chatMessages],
  notifications: [...seed.notifications],
  quotations: [...seed.quotations],
  invoices: [...seed.invoices],
  payments: [...seed.payments],
  expenses: [...seed.expenses],
  files: [...seed.files],
  campaigns: [...seed.campaigns],
  contentItems: [...seed.contentItems],
  scheduledContent: [...seed.scheduledContent],
  metaLeads: [...seed.metaLeads],
  conversations: [...seed.conversations],
  conversationMessages: [...seed.conversationMessages],
  workflows: [...seed.workflows],
  executionLogs: [...seed.executionLogs],
  auditLogs: [...seed.auditLogs],
  activities: [...seed.activities],
};

export const DEFAULT_ORG_ID = seed.ORG_ID;
export const CURRENT_USER_ID = seed.CURRENT_USER_ID;

export const LEAVE_TYPES = seed.leaveTypes;

export function uid(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

export function nowIso(): string {
  return new Date().toISOString();
}

export function delay<T>(value: T, ms = 220): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

export function scope<T extends { organization_id: string }>(rows: T[], organizationId: string): T[] {
  return rows.filter((r) => r.organization_id === organizationId);
}
