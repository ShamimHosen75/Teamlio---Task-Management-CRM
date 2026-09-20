import type {
  ActivityEvent,
  AppNotification,
  AuditLog,
  AutomationWorkflow,
  Campaign,
  ChatMessage,
  ChatRoom,
  Client,
  Comment,
  Contact,
  ContentItem,
  Conversation,
  ConversationMessage,
  DailyWorkUpdate,
  Deal,
  Expense,
  ExecutionLog,
  FileRecord,
  Invoice,
  Lead,
  LeaveRequest,
  MetaLead,
  Meeting,
  Milestone,
  Organization,
  Payment,
  Project,
  ProjectMember,
  ProjectTemplate,
  Quotation,
  Role,
  ScheduledContent,
  Task,
  Team,
  TeamMember,
  User,
} from "@/lib/types";
import { ROLE_PERMISSIONS } from "@/lib/permissions";

const ORG = "org_001";
const ORG2 = "org_002";

const NOW = new Date("2026-09-16T09:00:00.000Z");

export function daysFromNow(d: number): string {
  const date = new Date(NOW);
  date.setDate(date.getDate() + d);
  return date.toISOString();
}
export function dateOnly(d: number): string {
  return daysFromNow(d).slice(0, 10);
}

const stamp = (d: number) => ({ created_at: daysFromNow(d), updated_at: daysFromNow(d + 1) });
const base = (id: string, d: number, org = ORG) => ({
  id,
  organization_id: org,
  ...stamp(d),
});

/* ------------------------------ organizations ----------------------------- */

export const organizations: Organization[] = [
  {
    id: ORG,
    name: "Teamlio",
    slug: "teamlio",
    currency: "USD",
    timezone: "Asia/Dhaka",
    created_at: daysFromNow(-720),
    updated_at: daysFromNow(-10),
  },
  {
    id: ORG2,
    name: "Atlas Studio",
    slug: "atlas",
    currency: "USD",
    timezone: "Europe/Berlin",
    created_at: daysFromNow(-300),
    updated_at: daysFromNow(-20),
  },
];

/* ---------------------------------- roles --------------------------------- */

export const roles: Role[] = Object.entries(ROLE_PERMISSIONS).map(([name, perms], i) => ({
  ...base(`role_${i + 1}`, -700),
  name,
  description: `${name} default role`,
  is_system: true,
  permissions: perms as string[],
}));

const roleId = (name: string) => roles.find((r) => r.name === name)!.id;

/* ---------------------------------- users --------------------------------- */

const userSeed: [string, string, string, string, User["status"]][] = [
  ["Ayesha Rahman", "ayesha@teamlio.io", "Organization Owner", "Founder & CEO", "Active"],
  ["Daniel Okafor", "daniel@teamlio.io", "Admin", "Operations Director", "Active"],
  ["Priya Nair", "priya@teamlio.io", "Project Manager", "Senior Project Manager", "Active"],
  ["Marco Bianchi", "marco@teamlio.io", "Project Manager", "Delivery Manager", "Active"],
  ["Sofia Lindqvist", "sofia@teamlio.io", "Team Lead", "Design Lead", "Active"],
  ["Tanvir Hasan", "tanvir@teamlio.io", "Team Lead", "Engineering Lead", "Active"],
  ["Grace Mensah", "grace@teamlio.io", "Sales Manager", "Head of Sales", "Active"],
  ["Liam Carter", "liam@teamlio.io", "Sales Executive", "Account Executive", "Active"],
  ["Nadia Haque", "nadia@teamlio.io", "Team Member", "Frontend Engineer", "Active"],
  ["Omar Farouk", "omar@teamlio.io", "Team Member", "Backend Engineer", "Active"],
  ["Elena Petrova", "elena@teamlio.io", "Team Member", "Content Strategist", "Active"],
  ["Jae-won Park", "jaewon@teamlio.io", "Team Member", "Motion Designer", "Inactive"],
  ["Ruth Adeyemi", "ruth@teamlio.io", "Finance User", "Finance Manager", "Active"],
  ["Peter Novak", "peter@teamlio.io", "Team Member", "QA Engineer", "Invited"],
  ["Chen Wei", "chen@teamlio.io", "Team Member", "Data Analyst", "Suspended"],
];

export const users: User[] = userSeed.map(([full_name, email, role, job_title, status], i) => ({
  ...base(`usr_${String(i + 1).padStart(3, "0")}`, -600 + i * 5),
  full_name,
  email,
  phone: `+8801${(700000000 + i * 111111).toString().slice(0, 9)}`,
  avatar_url: null,
  job_title,
  role_id: roleId(role),
  status,
  last_login_at: status === "Active" ? daysFromNow(-(i % 4)) : null,
}));

export const CURRENT_USER_ID = "usr_001";

/* ---------------------------------- teams --------------------------------- */

export const teams: Team[] = [
  ["Development", "usr_006", "#2563eb"],
  ["Design", "usr_005", "#7c3aed"],
  ["Marketing", "usr_011", "#0891b2"],
  ["Sales", "usr_007", "#059669"],
].map(([name, lead, color], i) => ({
  ...base(`team_${i + 1}`, -500),
  name: name as string,
  description: `${name} team responsible for ${String(name).toLowerCase()} delivery.`,
  lead_user_id: lead as string,
  status: "Active" as const,
  color: color as string,
}));

export const teamMembers: TeamMember[] = [
  ["team_1", "usr_006"],
  ["team_1", "usr_009"],
  ["team_1", "usr_010"],
  ["team_1", "usr_014"],
  ["team_2", "usr_005"],
  ["team_2", "usr_012"],
  ["team_3", "usr_011"],
  ["team_3", "usr_015"],
  ["team_4", "usr_007"],
  ["team_4", "usr_008"],
  ["team_1", "usr_003"],
  ["team_2", "usr_004"],
].map(([team_id, user_id], i) => ({
  ...base(`tm_${i + 1}`, -480),
  team_id,
  user_id,
  role_in_team: i % 5 === 0 ? "Lead" : "Member",
}));

/* --------------------------------- clients -------------------------------- */

const clientSeed: [string, string, string, string][] = [
  ["ABC Holdings", "Finance", "usr_007", "Active"],
  ["Nova Retail", "Retail", "usr_008", "Active"],
  ["Prime Properties", "Real Estate", "usr_007", "Active"],
  ["Helio Health", "Healthcare", "usr_008", "Prospect"],
  ["Vertex Logistics", "Logistics", "usr_007", "Active"],
  ["Lumen Education", "Education", "usr_008", "Inactive"],
];

export const clients: Client[] = clientSeed.map(([name, industry, owner, status], i) => ({
  ...base(`cli_${i + 1}`, -400 + i * 10),
  name,
  company: `${name} Ltd.`,
  email: `contact@${name.toLowerCase().replace(/\s+/g, "")}.com`,
  phone: `+1 555 0${100 + i}`,
  website: `https://${name.toLowerCase().replace(/\s+/g, "")}.com`,
  address: `${10 + i} Riverside Avenue, Suite ${200 + i}`,
  owner_user_id: owner,
  status: status as Client["status"],
  industry,
}));

export const contacts: Contact[] = clients.flatMap((c, i) => [
  {
    ...base(`con_${i * 2 + 1}`, -390),
    client_id: c.id,
    full_name: ["Sarah Kim", "Michael Bosch", "Aditi Sharma", "Tom Whitfield", "Lea Dupont", "Hasan Ali"][i],
    email: `lead.contact${i + 1}@${c.name.toLowerCase().replace(/\s+/g, "")}.com`,
    phone: `+1 555 1${100 + i}`,
    designation: "Head of Marketing",
    is_primary: true,
  },
  {
    ...base(`con_${i * 2 + 2}`, -380),
    client_id: c.id,
    full_name: ["Jonas Berg", "Amina Yusuf", "Carlos Rivera", "Mei Ling", "Ivan Petrov", "Nora Haddad"][i],
    email: `ops.contact${i + 1}@${c.name.toLowerCase().replace(/\s+/g, "")}.com`,
    phone: `+1 555 2${100 + i}`,
    designation: "Operations Manager",
    is_primary: false,
  },
]);

/* ---------------------------------- leads --------------------------------- */

const leadSeed: [string, string, Lead["source"], Lead["status"], number][] = [
  ["Farhan Chowdhury", "Bright Lane Cafe", "Website", "New", 4500],
  ["Isabella Rossi", "Rossi Interiors", "Instagram", "Contacted", 12000],
  ["Kwame Boateng", "Boateng Legal", "Referral", "Qualified", 18500],
  ["Hannah Weber", "Weber Fitness", "Facebook", "Proposal", 26000],
  ["Raj Malhotra", "Malhotra Motors", "WhatsApp", "Negotiation", 42000],
  ["Clara Mendes", "Mendes Travel", "Campaign", "Won", 31000],
  ["Yusuf Demir", "Demir Foods", "Manual", "Lost", 9000],
  ["Alice Munro", "Munro Analytics", "Website", "Contacted", 15000],
  ["Peter Kallio", "Kallio Homes", "Referral", "Qualified", 22000],
  ["Zara Ahmed", "Ahmed Fashion", "Instagram", "New", 7800],
  ["Diego Santos", "Santos Construction", "Facebook", "Proposal", 54000],
  ["Mila Novak", "Novak Dental", "Website", "Negotiation", 16500],
  ["Ethan Brooks", "Brooks Media", "Campaign", "New", 11000],
  ["Sana Iqbal", "Iqbal Tutors", "WhatsApp", "Contacted", 6200],
];

export const leads: Lead[] = leadSeed.map(([name, company, source, status, value], i) => ({
  ...base(`lead_${String(i + 1).padStart(3, "0")}`, -90 + i * 4),
  code: `LD-${1000 + i}`,
  name,
  email: `${name.split(" ")[0].toLowerCase()}@${company.toLowerCase().replace(/\s+/g, "")}.com`,
  phone: `+1 555 3${100 + i}`,
  company,
  source,
  assigned_user_id: i % 2 === 0 ? "usr_008" : "usr_007",
  status,
  estimated_value: value,
  last_activity_at: daysFromNow(-(i % 9)),
  tags: [source === "Referral" ? "warm" : "inbound", value > 20000 ? "high-value" : "smb"],
  notes: "Requested a detailed scope and indicative timeline.",
  converted_client_id: status === "Won" ? "cli_002" : null,
}));

/* ---------------------------------- deals --------------------------------- */

const dealSeed: [string, Deal["stage"], number, number][] = [
  ["Corporate Website Redesign — ABC Holdings", "Proposal", 48000, 60],
  ["CRM Implementation — Nova Retail", "Negotiation", 76000, 75],
  ["SEO Retainer — Prime Properties", "Qualified", 24000, 40],
  ["Mobile App MVP — Helio Health", "New Opportunity", 95000, 20],
  ["Brand Refresh — Vertex Logistics", "Won", 32000, 100],
  ["LMS Platform — Lumen Education", "Lost", 58000, 0],
  ["Social Media Retainer — Nova Retail", "Proposal", 18000, 55],
  ["E-commerce Build — Ahmed Fashion", "Qualified", 41000, 45],
  ["Performance Ads — Santos Construction", "Negotiation", 27000, 70],
  ["Website Care Plan — Boateng Legal", "New Opportunity", 9000, 25],
];

export const deals: Deal[] = dealSeed.map(([title, stage, value, probability], i) => ({
  ...base(`deal_${String(i + 1).padStart(3, "0")}`, -70 + i * 5),
  title,
  lead_id: i < leads.length ? leads[i].id : null,
  client_id: i < clients.length ? clients[i].id : null,
  value,
  probability,
  pipeline: "Default Pipeline",
  stage,
  expected_close_date: dateOnly(10 + i * 6),
  owner_user_id: i % 2 === 0 ? "usr_007" : "usr_008",
}));

/* ------------------------------- templates -------------------------------- */

export const projectTemplates: ProjectTemplate[] = [
  ["Website Development", "Web", 45],
  ["Web Application", "Software", 90],
  ["Digital Marketing", "Marketing", 60],
  ["SEO Campaign", "Marketing", 120],
  ["Branding", "Creative", 30],
  ["Software Development", "Software", 120],
  ["Social Media Management", "Marketing", 90],
].map(([name, category, days], i) => ({
  ...base(`tpl_${i + 1}`, -300),
  name: name as string,
  category: category as string,
  description: `Standardised delivery blueprint for ${String(name).toLowerCase()} engagements.`,
  default_duration_days: days as number,
  task_titles: [
    "Kickoff & discovery workshop",
    "Requirement documentation",
    "Information architecture",
    "Design system setup",
    "Build phase 1",
    "Internal QA",
    "Client review",
    "Launch & handover",
  ],
  milestone_titles: ["Discovery complete", "Design approved", "Build complete", "Go live"],
  workflow_stages: ["Discovery", "Design", "Build", "Review", "Launch"],
}));

/* --------------------------------- projects ------------------------------- */

const projectSeed: [string, string, Project["status"], Project["priority"], number, number, string][] = [
  ["Corporate Website Revamp", "cli_1", "In Progress", "High", 62, 48000, "usr_003"],
  ["CRM Implementation", "cli_2", "In Progress", "Urgent", 41, 76000, "usr_004"],
  ["SEO Growth Campaign", "cli_3", "Under Review", "Medium", 78, 24000, "usr_003"],
  ["Mobile Application MVP", "cli_4", "Planned", "High", 8, 95000, "usr_004"],
  ["Brand Identity Refresh", "cli_5", "Completed", "Medium", 100, 32000, "usr_003"],
  ["Learning Portal", "cli_6", "On Hold", "Low", 34, 58000, "usr_004"],
  ["Retail Analytics Dashboard", "cli_2", "In Progress", "High", 55, 39000, "usr_003"],
  ["Property Listing Platform", "cli_3", "Overdue", "Urgent", 71, 67000, "usr_004"],
  ["Social Content Retainer", "cli_2", "In Progress", "Medium", 46, 18000, "usr_003"],
  ["Legacy Site Archive", "cli_6", "Archived", "Low", 100, 8000, "usr_004"],
];

export const projects: Project[] = projectSeed.map(
  ([name, client, status, priority, progress, budget, manager], i) => ({
    ...base(`prj_${String(i + 1).padStart(3, "0")}`, -200 + i * 12),
    code: `PRJ-${101 + i}`,
    name,
    description: `${name} delivery engagement covering discovery, execution, QA and handover.`,
    client_id: `cli_${client.split("_")[1]}`,
    manager_user_id: manager,
    team_ids: i % 3 === 0 ? ["team_1", "team_2"] : i % 3 === 1 ? ["team_1"] : ["team_3", "team_4"],
    start_date: dateOnly(-120 + i * 9),
    due_date: dateOnly(status === "Overdue" ? -6 : 20 + i * 11),
    status,
    priority,
    progress,
    budget,
    spent: Math.round(budget * (progress / 100) * 0.82),
    health: progress > 60 ? "On Track" : progress > 35 ? "At Risk" : "Off Track",
    template_id: `tpl_${(i % 7) + 1}`,
  }),
);

export const projectMembers: ProjectMember[] = projects.flatMap((p, i) =>
  ["usr_009", "usr_010", "usr_005", "usr_011"].map((u, j) => ({
    ...base(`pm_${i}_${j}`, -180),
    project_id: p.id,
    user_id: u,
    role_in_project: j === 0 ? "Tech Lead" : "Contributor",
  })),
);

/* -------------------------------- milestones ------------------------------ */

export const milestones: Milestone[] = projects.flatMap((p, i) =>
  ["Discovery complete", "Design approved", "Build complete", "Go live"].map((name, j) => {
    const progress = Math.max(0, Math.min(100, p.progress - j * 22));
    const status: Milestone["status"] =
      progress >= 100 ? "Completed" : progress > 0 ? "In Progress" : j === 3 && p.status === "Overdue" ? "Overdue" : "Upcoming";
    return {
      ...base(`ms_${i + 1}_${j + 1}`, -150),
      project_id: p.id,
      name,
      description: `${name} for ${p.name}.`,
      due_date: dateOnly(-40 + i * 8 + j * 15),
      team_id: `team_${(j % 4) + 1}`,
      progress,
      status,
      deliverables: ["Signed-off document", "Review recording", "Updated plan"],
    };
  }),
);

/* ---------------------------------- tasks --------------------------------- */

const taskTitles = [
  "Kickoff & discovery workshop",
  "Stakeholder interviews",
  "Requirement documentation",
  "Information architecture",
  "Wireframes for key screens",
  "Design system setup",
  "Homepage visual design",
  "Component library build",
  "API contract definition",
  "Database schema draft",
  "Authentication flow",
  "Dashboard implementation",
  "Content migration",
  "Accessibility audit",
  "Internal QA pass",
  "Client review session",
  "Performance optimisation",
  "Launch checklist & handover",
];

const statuses: Task["status"][] = ["Backlog", "To Do", "In Progress", "Review", "Completed", "Blocked"];
const priorities: Task["priority"][] = ["Low", "Medium", "High", "Urgent"];
const assignees = ["usr_009", "usr_010", "usr_005", "usr_011", "usr_012", "usr_006"];

export const tasks: Task[] = projects.flatMap((p, pi) =>
  taskTitles.slice(0, pi % 2 === 0 ? 12 : 9).map((title, ti) => {
    const idx = pi * 12 + ti;
    const status = statuses[(pi + ti) % statuses.length];
    return {
      ...base(`task_${String(idx + 1).padStart(4, "0")}`, -100 + ti),
      code: `TSK-${2000 + idx}`,
      title,
      description: `${title} for ${p.name}. Coordinate with the assigned team and update progress daily.`,
      project_id: p.id,
      assignee_ids: [assignees[(pi + ti) % assignees.length]],
      team_id: p.team_ids[0] ?? null,
      reporter_id: p.manager_user_id,
      follower_ids: [p.manager_user_id, "usr_002"],
      priority: priorities[(ti + pi) % priorities.length],
      status,
      start_date: dateOnly(-30 + ti * 3),
      due_date: dateOnly(-8 + ti * 4 + pi),
      progress: status === "Completed" ? 100 : status === "In Progress" ? 45 + ((ti * 7) % 40) : status === "Review" ? 85 : 0,
      checklist: [
        { id: `${idx}_c1`, title: "Draft prepared", done: true },
        { id: `${idx}_c2`, title: "Peer reviewed", done: status === "Completed" },
        { id: `${idx}_c3`, title: "Signed off", done: status === "Completed" },
      ],
      parent_task_id: null,
      dependency_ids: ti > 0 ? [`task_${String(pi * 12 + ti).padStart(4, "0")}`] : [],
      labels: [["frontend", "backend", "design", "content", "qa"][(ti + pi) % 5]],
      attachment_ids: [],
      milestone_id: `ms_${pi + 1}_${Math.min(4, Math.floor(ti / 3) + 1)}`,
    };
  }),
);

export const comments: Comment[] = tasks.slice(0, 40).flatMap((t, i) => [
  {
    ...base(`cmt_${i}_1`, -12),
    entity_type: "task",
    entity_id: t.id,
    author_id: assignees[i % assignees.length],
    body: "Picked this up today, first draft should be ready by tomorrow morning.",
  },
  {
    ...base(`cmt_${i}_2`, -10),
    entity_type: "task",
    entity_id: t.id,
    author_id: "usr_003",
    body: "Thanks — please share the draft in the project channel before review.",
  },
]);

/* ------------------------------ daily updates ----------------------------- */

const activeUsers = users.filter((u) => u.status === "Active");

export const dailyUpdates: DailyWorkUpdate[] = activeUsers.flatMap((u, i) =>
  [0, -1, -2, -3, -4].map((d) => {
    const status: DailyWorkUpdate["status"] =
      d === 0 ? (i % 5 === 0 ? "Missing" : i % 4 === 0 ? "Late" : "Submitted") : i % 3 === 0 ? "Reviewed" : "Submitted";
    return {
      ...base(`du_${u.id}_${d}`, d),
      user_id: u.id,
      date: dateOnly(d),
      completed_today: "Closed out review comments and shipped two components.",
      working_on: "Dashboard widgets and responsive table behaviour.",
      next_plan: "Start the reporting filters and write unit checks.",
      blockers: i % 4 === 0 ? "Waiting on final copy from the client." : "",
      project_id: projects[i % projects.length].id,
      task_ids: [tasks[i % tasks.length].id],
      status,
      submitted_at: status === "Missing" ? null : daysFromNow(d),
    };
  }),
);

/* --------------------------------- leave ---------------------------------- */

export const leaveTypes = ["Annual Leave", "Sick Leave", "Casual Leave", "Unpaid Leave", "Parental Leave"];

export const leaveRequests: LeaveRequest[] = activeUsers.slice(0, 10).map((u, i) => {
  const status: LeaveRequest["status"] = (["Pending", "Approved", "Rejected", "Pending", "Cancelled"] as const)[i % 5];
  return {
    ...base(`lv_${i + 1}`, -20 + i),
    user_id: u.id,
    leave_type: leaveTypes[i % leaveTypes.length],
    start_date: dateOnly(2 + i * 3),
    end_date: dateOnly(3 + i * 3),
    duration_days: i % 3 === 0 ? 0.5 : 2,
    half_day: i % 3 === 0,
    reason: "Planned personal time off.",
    approver_id: "usr_003",
    status,
  };
});

/* -------------------------------- meetings -------------------------------- */

export const meetings: Meeting[] = Array.from({ length: 12 }).map((_, i) => ({
  ...base(`mtg_${i + 1}`, -30 + i * 3),
  title: [
    "Weekly delivery stand-up",
    "Client review — ABC Holdings",
    "CRM data migration sync",
    "Sales pipeline review",
    "Design critique",
    "Sprint planning",
    "Campaign performance review",
    "Quarterly business review",
    "Onboarding walkthrough",
    "Retro — Website Revamp",
    "Budget review",
    "Content planning",
  ][i],
  type: (["Internal", "Client", "Project", "Sales"] as const)[i % 4],
  participant_ids: ["usr_001", "usr_003", "usr_005", "usr_009"].slice(0, (i % 3) + 2),
  client_id: i % 3 === 0 ? clients[i % clients.length].id : null,
  project_id: projects[i % projects.length].id,
  date: dateOnly(i - 4),
  start_time: `${9 + (i % 7)}:00`,
  end_time: `${10 + (i % 7)}:00`,
  meeting_url: "https://meet.example.com/teamlio-" + (100 + i),
  location: i % 2 === 0 ? "Online" : "Meeting Room 2",
  agenda: "Progress review, blockers, next steps and owner assignment.",
  notes: i < 4 ? "Action items captured and assigned to owners." : "",
  status: i < 4 ? "Completed" : "Scheduled",
}));

/* ---------------------------------- chat ---------------------------------- */

export const chatRooms: ChatRoom[] = [
  ["Development", "Team"],
  ["Corporate Website Revamp", "Project"],
  ["Design", "Team"],
  ["Priya Nair", "Direct"],
  ["Tanvir Hasan", "Direct"],
  ["CRM Implementation", "Project"],
  ["Sales Huddle", "Group"],
  ["ABC Holdings", "Client"],
].map(([name, type], i) => ({
  ...base(`room_${i + 1}`, -60),
  name: name as string,
  type: type as ChatRoom["type"],
  member_ids: ["usr_001", "usr_003", "usr_005", "usr_009", "usr_010"],
  project_id: i === 1 ? "prj_001" : i === 5 ? "prj_002" : null,
  last_message_at: daysFromNow(-(i % 3)),
  unread_count: i % 3 === 0 ? i : 0,
}));

const chatBodies = [
  "Morning all — standup notes are in the doc.",
  "I pushed the new component library, ready for review.",
  "Client confirmed the launch date, we're good for the 28th.",
  "Can someone take a look at the failing QA case?",
  "Design handoff is complete, Figma link pinned above.",
  "Invoice for milestone 2 has been sent.",
  "Great work on the dashboard, looks sharp.",
  "I'll be on leave Thursday, Omar is covering.",
];

export const chatMessages: ChatMessage[] = chatRooms.flatMap((room, ri) =>
  chatBodies.map((body, mi) => ({
    ...base(`msg_${ri + 1}_${mi + 1}`, -3 + mi * 0.1),
    room_id: room.id,
    author_id: ["usr_003", "usr_009", "usr_005", "usr_001", "usr_010"][(ri + mi) % 5],
    body,
    reply_to_id: null,
    reactions: mi % 4 === 0 ? [{ emoji: "👍", user_ids: ["usr_001", "usr_005"] }] : [],
    pinned: mi === 4,
    read_by: ["usr_001"],
  })),
);

/* ------------------------------ notifications ----------------------------- */

export const notifications: AppNotification[] = [
  ["Task Assigned", "New task assigned", "Priya assigned you “Dashboard implementation”.", "/tasks"],
  ["Project Deadline", "Deadline approaching", "Property Listing Platform is due in 2 days.", "/projects"],
  ["Task Overdue", "Task overdue", "“Content migration” is 3 days overdue.", "/tasks"],
  ["Meeting Reminder", "Meeting in 30 minutes", "Client review — ABC Holdings.", "/meetings"],
  ["Mention", "You were mentioned", "Sofia mentioned you in Design channel.", "/chat"],
  ["Daily Update Reminder", "Daily update pending", "Submit your work update before 6:30 PM.", "/daily-updates"],
  ["Leave Approval", "Leave request pending", "Nadia Haque requested 2 days annual leave.", "/leave"],
  ["Invoice Alert", "Invoice overdue", "INV-2043 for Nova Retail is 6 days overdue.", "/business/invoices"],
  ["Content Approval", "Content awaiting approval", "3 posts are waiting for your approval.", "/marketing/content-calendar"],
  ["Publishing Failure", "Publishing failed", "Instagram reel failed to publish, retry queued.", "/marketing/scheduled"],
  ["System Alert", "Integration warning", "Meta token expires in 7 days.", "/admin/integrations"],
].map(([type, title, body, link], i) => ({
  ...base(`ntf_${i + 1}`, -(i % 6)),
  type: type as AppNotification["type"],
  title: title as string,
  body: body as string,
  read: i > 5,
  link: link as string,
}));

/* -------------------------------- business -------------------------------- */

const items = (n: number, seed: number) =>
  Array.from({ length: n }).map((_, i) => ({
    id: `li_${seed}_${i}`,
    description: ["Discovery & strategy", "UI/UX design", "Frontend development", "Backend development", "QA & launch support"][i % 5],
    quantity: 1 + ((seed + i) % 4),
    rate: 1200 + ((seed + i) % 5) * 450,
  }));

export const quotations: Quotation[] = Array.from({ length: 8 }).map((_, i) => ({
  ...base(`quo_${i + 1}`, -60 + i * 6),
  number: `QT-${3000 + i}`,
  client_id: clients[i % clients.length].id,
  project_id: projects[i % projects.length].id,
  items: items(3, i),
  discount: i % 3 === 0 ? 500 : 0,
  tax_rate: 5,
  terms: "50% advance on acceptance, remaining on delivery. Valid for 30 days.",
  expiry_date: dateOnly(15 + i * 3),
  status: (["Draft", "Sent", "Accepted", "Rejected", "Expired"] as const)[i % 5],
}));

export const invoices: Invoice[] = Array.from({ length: 10 }).map((_, i) => {
  const its = items(3, i + 20);
  const total = its.reduce((s, it) => s + it.quantity * it.rate, 0);
  const status = (["Draft", "Sent", "Partially Paid", "Paid", "Overdue", "Cancelled"] as const)[i % 6];
  return {
    ...base(`inv_${i + 1}`, -50 + i * 5),
    number: `INV-${2040 + i}`,
    client_id: clients[i % clients.length].id,
    project_id: projects[i % projects.length].id,
    quotation_id: quotations[i % quotations.length].id,
    items: its,
    discount: i % 4 === 0 ? 300 : 0,
    tax_rate: 5,
    paid_amount: status === "Paid" ? total : status === "Partially Paid" ? Math.round(total * 0.4) : 0,
    issue_date: dateOnly(-40 + i * 4),
    due_date: dateOnly(status === "Overdue" ? -6 : 10 + i * 4),
    status,
  };
});

export const payments: Payment[] = invoices.slice(0, 8).map((inv, i) => ({
  ...base(`pay_${i + 1}`, -30 + i * 3),
  invoice_id: inv.id,
  client_id: inv.client_id,
  amount: inv.paid_amount || 2500 + i * 700,
  method: (["Bank Transfer", "Card", "Cash", "Mobile Banking", "Cheque"] as const)[i % 5],
  reference: `TRX-${90000 + i}`,
  payment_date: dateOnly(-25 + i * 3),
  status: (["Completed", "Completed", "Pending", "Failed"] as const)[i % 4],
  notes: "Received against milestone billing.",
}));

export const expenses: Expense[] = Array.from({ length: 12 }).map((_, i) => ({
  ...base(`exp_${i + 1}`, -45 + i * 3),
  project_id: i % 3 === 0 ? null : projects[i % projects.length].id,
  category: ["Software", "Hosting", "Subcontractor", "Travel", "Advertising", "Equipment"][i % 6],
  vendor: ["Figma", "AWS", "Studio Ink", "Uber", "Meta", "Apple Store"][i % 6],
  amount: 120 + i * 185,
  date: dateOnly(-40 + i * 3),
  status: (["Approved", "Pending", "Rejected"] as const)[i % 3],
  notes: "Recorded against project delivery cost.",
}));

/* ---------------------------------- files --------------------------------- */

export const files: FileRecord[] = Array.from({ length: 24 }).map((_, i) => ({
  ...base(`file_${i + 1}`, -60 + i * 2),
  name: [
    "project-brief.pdf",
    "wireframes-v3.fig",
    "homepage-hero.png",
    "contract-signed.pdf",
    "analytics-export.csv",
    "brand-guidelines.pdf",
    "campaign-reel.mp4",
    "meeting-notes.docx",
  ][i % 8].replace(".", `-${i + 1}.`),
  folder: ["Project Files", "Client Files", "Task Files", "Shared Files", "Marketing Assets"][i % 5],
  mime_type: ["application/pdf", "image/png", "video/mp4", "text/csv", "application/msword"][i % 5],
  size_kb: 120 + i * 350,
  uploader_id: assignees[i % assignees.length],
  project_id: projects[i % projects.length].id,
  client_id: clients[i % clients.length].id,
  task_id: null,
  shared: i % 4 === 0,
}));

/* ------------------------------- marketing -------------------------------- */

export const campaigns: Campaign[] = Array.from({ length: 6 }).map((_, i) => ({
  ...base(`cmp_${i + 1}`, -80 + i * 10),
  name: [
    "Q3 Lead Generation",
    "Retail Festive Sale",
    "Property Launch Awareness",
    "Healthcare Signups",
    "Brand Reach Boost",
    "Course Enrolment Drive",
  ][i],
  client_id: clients[i % clients.length].id,
  objective: ["Lead Generation", "Conversions", "Reach", "Traffic"][i % 4],
  status: (["Active", "Active", "Paused", "Completed"] as const)[i % 4],
  spend: 2400 + i * 1350,
  reach: 84000 + i * 23000,
  impressions: 152000 + i * 41000,
  clicks: 3200 + i * 870,
  leads: 120 + i * 45,
  conversions: 28 + i * 11,
  revenue: 14000 + i * 7600,
  start_date: dateOnly(-70 + i * 8),
  end_date: dateOnly(20 + i * 8),
}));

export const contentItems: ContentItem[] = Array.from({ length: 22 }).map((_, i) => ({
  ...base(`cnt_${i + 1}`, -30 + i),
  title: [
    "Client success story",
    "Behind the scenes reel",
    "Product feature carousel",
    "Founder insight post",
    "Festive offer creative",
    "Team culture story",
    "Case study teaser",
    "Industry stat post",
  ][i % 8] + ` #${i + 1}`,
  caption: "Sharing how our delivery team keeps projects on track from kickoff to launch.",
  content_type: (["Static Post", "Carousel", "Reel", "Story", "Short Video", "Link Post"] as const)[i % 6],
  platform: (["Facebook", "Instagram", "LinkedIn", "YouTube"] as const)[i % 4],
  campaign_id: campaigns[i % campaigns.length].id,
  client_id: clients[i % clients.length].id,
  hashtags: ["#projectmanagement", "#agency", "#delivery"],
  cta: "Learn more",
  destination_url: "https://teamlio.io/work",
  writer_id: "usr_011",
  designer_id: "usr_012",
  reviewer_id: "usr_005",
  approver_id: "usr_002",
  publish_date: dateOnly(-10 + i),
  publish_time: `${9 + (i % 9)}:30`,
  timezone: "Asia/Dhaka",
  status: (
    ["Idea", "Planned", "Designing", "Review", "Changes Requested", "Approved", "Scheduled", "Published", "Failed"] as const
  )[i % 9],
}));

export const scheduledContent: ScheduledContent[] = contentItems.slice(0, 12).map((c, i) => ({
  ...base(`sch_${i + 1}`, -5 + i),
  content_id: c.id,
  platform: c.platform,
  account: `@teamlio.${c.platform.toLowerCase()}`,
  scheduled_at: daysFromNow(i - 2),
  status: (["Waiting", "Processing", "Publishing", "Published", "Retrying", "Failed", "Cancelled"] as const)[i % 7],
  attempts: i % 3,
  result: i % 7 === 5 ? "Token expired — reconnect the account" : "OK",
}));

export const metaLeads: MetaLead[] = Array.from({ length: 14 }).map((_, i) => ({
  ...base(`mlead_${i + 1}`, -14 + i),
  full_name: [
    "Arif Khan",
    "Julia Roberts",
    "Samuel Osei",
    "Nina Kapoor",
    "Tomasz Kowalski",
    "Leila Mansour",
    "David Chen",
  ][i % 7],
  email: `metalead${i + 1}@example.com`,
  phone: `+1 555 7${100 + i}`,
  campaign_id: campaigns[i % campaigns.length].id,
  ad_name: `Ad Creative ${i + 1}`,
  ad_set_name: `Interest Set ${(i % 3) + 1}`,
  lead_form: "Consultation Request Form",
  assigned_user_id: i % 3 === 0 ? null : "usr_008",
  crm_status: (["New", "Assigned", "Converted", "Rejected"] as const)[i % 4],
}));

export const conversations: Conversation[] = Array.from({ length: 8 }).map((_, i) => ({
  ...base(`cnv_${i + 1}`, -6 + i * 0.5),
  channel: (["WhatsApp", "Instagram", "Facebook"] as const)[i % 3],
  contact_name: ["Arif Khan", "Julia Roberts", "Samuel Osei", "Nina Kapoor", "Leila Mansour", "David Chen", "Mila Novak", "Zara Ahmed"][i],
  contact_phone: `+8801${800000000 + i * 1111}`,
  last_message: [
    "Can you share the package pricing?",
    "Thanks, that works for us.",
    "Is the offer still valid?",
    "We'd like to schedule a call.",
    "Please send the proposal.",
    "What's the delivery timeline?",
    "Received the invoice, thank you.",
    "Do you handle social media too?",
  ][i],
  last_message_at: daysFromNow(-(i * 0.2)),
  unread: i % 3 === 0 ? 2 : 0,
  assigned_user_id: i % 2 === 0 ? "usr_008" : null,
  lead_id: leads[i].id,
}));

export const conversationMessages: ConversationMessage[] = conversations.flatMap((c, ci) =>
  [
    ["in", "Hi, I saw your ad about website development."],
    ["out", "Hello! Thanks for reaching out. Could you tell us a bit about your business?"],
    ["in", "We run a retail store and need an online shop."],
    ["out", "Perfect — we build e-commerce platforms. What's your target launch date?"],
    ["in", c.last_message],
  ].map(([direction, body], mi) => ({
    ...base(`cmsg_${ci}_${mi}`, -1 + mi * 0.05),
    conversation_id: c.id,
    direction: direction as "in" | "out",
    body: body as string,
    sent_at: daysFromNow(-1 + mi * 0.05),
  })),
);

/* ------------------------------- automation ------------------------------- */

export const workflows: AutomationWorkflow[] = [
  ["Assign new website leads", "Lead Created", "Assign User"],
  ["Create project when deal is won", "Deal Won", "Create Project"],
  ["Escalate missing daily updates", "Daily Update Missing", "Notify"],
  ["Notify manager on overdue tasks", "Task Overdue", "Notify"],
  ["Create chat room for new project", "Project Created", "Create Chat Room"],
  ["Route WhatsApp enquiries to sales", "WhatsApp Message Received", "Assign User"],
].map(([name, trigger, action], i) => ({
  ...base(`wf_${i + 1}`, -120 + i * 10),
  name: name as string,
  description: `${trigger} → condition check → ${action}.`,
  trigger: trigger as string,
  conditions: [{ field: "Lead Source", operator: "is", value: "Website" }],
  actions: [{ type: action as string, config: "Sales team round-robin" }],
  enabled: i % 4 !== 3,
  runs: 12 + i * 31,
  last_run_at: daysFromNow(-(i % 5)),
}));

export const executionLogs: ExecutionLog[] = workflows.flatMap((w, wi) =>
  Array.from({ length: 4 }).map((_, i) => ({
    ...base(`log_${wi}_${i}`, -(i + 1)),
    workflow_id: w.id,
    status: (["Success", "Success", "Failed", "Skipped"] as const)[i],
    message: i === 2 ? "Action failed: recipient not resolved" : "Completed all actions",
    duration_ms: 120 + i * 85,
    ran_at: daysFromNow(-(i + 1)),
  })),
);

export const auditLogs: AuditLog[] = Array.from({ length: 20 }).map((_, i) => ({
  ...base(`aud_${i + 1}`, -(i % 10)),
  user_id: users[i % users.length].id,
  action: [
    "Project Created",
    "Task Completed",
    "User Role Changed",
    "Deal Won",
    "Invoice Updated",
    "Leave Approved",
    "Automation Executed",
  ][i % 7],
  entity_type: ["Project", "Task", "User", "Deal", "Invoice", "Leave", "Workflow"][i % 7],
  entity_label: ["PRJ-101", "TSK-2004", "Nadia Haque", "Brand Refresh", "INV-2043", "LV-3", "Assign new website leads"][i % 7],
  old_value: ["—", "In Progress", "Team Member", "Negotiation", "Sent", "Pending", "—"][i % 7],
  new_value: ["Created", "Completed", "Team Lead", "Won", "Paid", "Approved", "Success"][i % 7],
  ip: `103.12.${20 + (i % 40)}.${100 + i}`,
  status: i % 9 === 8 ? "Failed" : "Success",
}));

export const activities: ActivityEvent[] = Array.from({ length: 30 }).map((_, i) => ({
  ...base(`act_${i + 1}`, -(i % 12)),
  entity_type: ["project", "task", "lead", "client", "deal"][i % 5],
  entity_id: [projects[i % projects.length].id, tasks[i % tasks.length].id, leads[i % leads.length].id, clients[i % clients.length].id, deals[i % deals.length].id][i % 5],
  actor_id: users[i % users.length].id,
  action: ["Created project", "Changed status", "Assigned user", "Added comment", "Uploaded file", "Completed task", "Updated deadline"][i % 7],
  detail: ["Initial setup completed", "Moved to In Progress", "Assigned to Nadia Haque", "Left a review note", "Added brand-guidelines.pdf", "Marked as complete", "Pushed due date by 3 days"][i % 7],
}));

export const ORG_ID = ORG;
