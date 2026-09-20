# Project Compass

PROJECT: PROJECT MANAGEMENT CRM SaaS PLATFORM

VERSION: FRONTEND + APPLICATION LOGIC FOUNDATION

PRIMARY GOAL: Build a complete, professional, responsive Project Management CRM application with all major screens, workflows, reusable components, realistic mock data, application services, permissions-aware UI, and production-quality UX.

IMPORTANT:

This is a Project Management CRM platform, not an HRM system.

DO NOT build:

- Payroll

- Salary management

- Recruitment

- Attendance management

- Employee HR records

- Timesheets

- Time Tracker

- Work-hour monitoring

- Keyboard/mouse tracking

- Full HRM features

Keep:

- Users

- Teams

- Leave Management

- Daily Work Update

because these are operational Project Management CRM features.

Do NOT mention “vibe coding” anywhere in the product, documentation, screens, components, labels, or source comments.

==================================================

1. PRODUCT VISION

==================================================

Build a modern SaaS platform that combines:

Project Management

CRM

Client Management

Task Management

Teams

User Management

Daily Work Updates

Leave Management

Calendar

Meetings

Internal Chat

Quotations

Invoices

Payments

Expenses

Files

Notifications

Analytics

Social Marketing

Content Calendar

Meta Ads

Meta Leads

WhatsApp Lead Management

AI Assistant

AI Automation

Workflow Automation

The central business workflow is:

Lead

→ Qualification

→ Deal

→ Won

→ Client

→ Project

→ Tasks

→ Team Execution

→ Project Completion

→ Invoice

→ Payment

The platform should be capable of becoming a multi-tenant SaaS product later.

==================================================

2. DEVELOPMENT APPROACH

==================================================

For this phase:

Build the complete frontend and application workflows first.

Use:

- React

- TypeScript

- the existing Lovable project stack

- reusable components

- strict TypeScript

- clean feature-based architecture

Do NOT create a permanent production database yet.

Do NOT create uncontrolled Supabase tables.

Do NOT tightly couple components to mock data.

Create a clean service/data-provider layer so mock services can later be replaced with Supabase services without redesigning the UI.

Architecture:

UI Component

→ Feature Hook

→ Service Interface

→ Mock Data Provider

Later this must become:

UI Component

→ Feature Hook

→ Service Interface

→ Supabase Provider

Create reusable service methods such as:

getProjects()

getProject()

createProject()

updateProject()

archiveProject()

getTasks()

createTask()

updateTask()

assignTask()

getLeads()

createLead()

updateLead()

convertLead()

getClients()

getDeals()

getTeams()

getUsers()

getDailyUpdates()

getLeaveRequests()

Use realistic mock data and optionally local persistence for demo purposes.

All mock data structures must closely match the future relational database model.

==================================================

3. DESIGN DIRECTION

==================================================

Create a premium, minimal, professional B2B SaaS dashboard.

Design characteristics:

- clean white/light interface

- subtle gray-blue background areas

- modern cards

- soft borders

- restrained shadows

- excellent whitespace

- professional typography

- compact but readable data density

- rounded cards and controls

- modern SaaS tables

- subtle hover effects

- smooth transitions

- clear visual hierarchy

- accessible contrast

- responsive layout

Do not make the interface:

- overly colorful

- cartoonish

- futuristic

- gaming-like

- excessively animated

- cluttered

The visual direction should feel similar to premium modern Project Management / CRM SaaS applications.

==================================================

4. RESPONSIVE APPLICATION SHELL

==================================================

Create one reusable application shell.

DESKTOP:

Left Sidebar

+

Top Navigation

+

Main Workspace

+

Optional Context Panel

Sidebar:

- collapsible

- icon + label

- section grouping

- active route indication

- nested navigation

- responsive

Topbar:

- global search

- quick create button

- notifications

- optional workspace selector

- user profile dropdown

TABLET:

- collapsible/off-canvas sidebar

- two-column layouts where appropriate

MOBILE:

- mobile header

- compact cards

- responsive tables/cards

- mobile drawers

- touch-friendly controls

- bottom navigation

Recommended mobile bottom navigation:

Home

Projects

Tasks

CRM

More

==================================================

5. MAIN SIDEBAR NAVIGATION

==================================================

Create the navigation in this order:

DASHBOARD

- Overview

PROJECTS

- All Projects

- My Projects

- Tasks

- Kanban

- Timeline

- Milestones

- Project Templates

CRM

- Leads

- Clients

- Contacts

- Companies

- Deals

- Pipeline

TEAMS

- Teams

- Users

- Daily Work Update

- Leave Management

COMMUNICATION

- Internal Chat

- Meetings

- Calendar

- Notifications

MARKETING

- Social Overview

- Content Calendar

- Content Library

- Scheduled Content

- Campaigns

- Meta Ads

- Meta Leads

- WhatsApp

- Unified Lead Inbox

- Marketing Reports

BUSINESS

- Quotations

- Invoices

- Payments

- Expenses

FILES

- File Manager

REPORTS

- Project Reports

- Team Reports

- CRM Reports

- Marketing Reports

- Analytics

AUTOMATION

- AI Assistant

- Workflows

- Templates

- Execution Logs

- AI Usage

ADMINISTRATION

- User Management

- Roles & Permissions

- Teams Management

- Integrations

- API & Webhooks

- Audit Logs

- Settings

==================================================

6. GLOBAL DASHBOARD

==================================================

Build a professional main dashboard.

Top KPI cards:

- Active Projects

- Completed Projects

- Pending Tasks

- Overdue Tasks

- New Leads

- Active Deals

- Revenue

- Team Members

Add secondary widgets:

Project Timeline

Project Status

CRM Pipeline

Task Progress

Team Workload

Daily Work Update Status

Upcoming Meetings

Leave Overview

Recent Activities

Financial Overview

Upcoming Deadlines

Notifications

AI Insights

Add filters:

Today

7 Days

30 Days

This Month

Quarter

Custom Range

Create proper:

- loading state

- empty state

- error state

- skeleton state

==================================================

7. PROJECT MANAGEMENT MODULE

==================================================

Create:

All Projects

My Projects

Active Projects

Completed Projects

On Hold

Archived

Project Templates

Project card/list/table should support:

Project Code

Project Name

Client

Project Manager

Assigned Team

Start Date

Due Date

Status

Priority

Progress

Budget

Project statuses:

Draft

Planned

In Progress

Under Review

On Hold

Completed

Cancelled

Overdue

Archived

Create full Project Detail page with tabs:

Overview

Tasks

Kanban

Timeline

Milestones

Team

Daily Updates

Meetings

Files

Chat

Expenses

Activity

Settings

Project overview should show:

Progress

Status

Priority

Start/Due dates

Client

Manager

Team

Task summary

Milestones

Upcoming deadlines

Recent activity

Project health

Budget summary

==================================================

8. TASK MANAGEMENT

==================================================

Create one canonical task experience.

Do NOT create separate Kanban task models or Calendar task models.

Each task supports:

Title

Description

Project

Assignee

Multiple Assignees

Team

Reporter

Followers

Priority

Status

Start Date

Due Date

Progress

Checklist

Subtasks

Dependencies

Labels

Attachments

Comments

Activity

Task priorities:

Low

Medium

High

Urgent

Task statuses:

Backlog

To Do

In Progress

Review

Completed

Blocked

Views:

List

Table

Kanban

Calendar

Timeline/Gantt

My Tasks

Create task detail drawer/modal.

==================================================

9. KANBAN MODULE

==================================================

Build a polished drag-and-drop Kanban experience.

Columns:

Backlog

To Do

In Progress

Review

Completed

Blocked

Features:

- drag/drop

- task count

- priority

- assignee avatars

- due date

- labels

- project

- quick edit

- add task

- filters

The Kanban board must be based on the same task data model.

==================================================

10. TIMELINE / GANTT

==================================================

Create a visual project timeline.

Support:

- daily

- weekly

- monthly views

- tasks

- milestones

- dependencies

- project dates

- assignees

- progress

- overdue indication

Make it horizontally scrollable on smaller screens.

==================================================

11. MILESTONES

==================================================

Create Milestone Management.

Fields:

Name

Project

Description

Due Date

Responsible Team

Related Tasks

Progress

Status

Deliverables

Statuses:

Upcoming

In Progress

Completed

Overdue

==================================================

12. PROJECT TEMPLATES

==================================================

Create templates such as:

Website Development

Web Application

Digital Marketing

SEO Campaign

Branding

Software Development

Social Media Management

Template can define:

Tasks

Subtasks

Milestones

Teams

Default deadlines

Checklists

Workflow stages

==================================================

13. CRM — LEADS

==================================================

Create Leads module.

Fields:

Lead ID

Name

Email

Phone

Company

Source

Assigned User

Status

Stage

Estimated Value

Created Date

Last Activity

Tags

Notes

Lead sources:

Manual

Website

Facebook

Instagram

WhatsApp

Referral

Campaign

Other

Lead workflow:

New

→ Contacted

→ Qualified

→ Proposal

→ Negotiation

→ Won / Lost

Create:

Lead List

Lead Table

Lead Detail

Lead Activity Timeline

Lead Notes

Lead Follow-Up

Lead Conversion

==================================================

14. DEALS & PIPELINE

==================================================

Create visual sales pipeline.

Deal fields:

Title

Lead

Client

Value

Probability

Pipeline

Stage

Expected Closing Date

Assigned Sales User

Status

Activities

Pipeline stages:

New Opportunity

Qualified

Proposal

Negotiation

Won

Lost

Create drag-and-drop deal pipeline.

==================================================

15. LEAD → CLIENT → PROJECT CONVERSION

==================================================

Build frontend workflow:

Lead

→ Qualify

→ Create Deal

→ Deal Won

→ Convert to Client

→ Create Project

When user clicks Convert:

show confirmation workflow allowing:

Create Client

Create Project

Choose Project Template

Assign Project Manager

Assign Team

Set Start Date

Set Due Date

Use mock services now.

==================================================

16. CLIENT MANAGEMENT

==================================================

Client profile tabs:

Overview

Contacts

Deals

Projects

Meetings

Quotations

Invoices

Payments

Files

Notes

Activity

Fields:

Client Name

Company

Email

Phone

Website

Address

Owner

Status

Created Date

Create a complete 360° client view.

==================================================

17. TEAMS MODULE

==================================================

Create Teams module.

Team fields:

Team Name

Team Lead

Members

Projects

Tasks

Status

Team detail tabs:

Overview

Members

Projects

Tasks

Daily Updates

Meetings

Chat

Files

Performance

Activity

Add:

- team workload

- team availability

- task completion

- current projects

==================================================

18. USER MANAGEMENT

==================================================

Create User Management.

User fields:

Profile Photo

Full Name

Email

Phone

Role

Teams

Status

Last Login

Created Date

Statuses:

Invited

Active

Inactive

Suspended

Locked

Pages:

All Users

Active Users

Pending Invitations

Suspended Users

Roles

Permissions

Sessions

Activity

Create user invitation UI.

Do not build real email invitation backend yet.

==================================================

19. ROLES & PERMISSIONS

==================================================

Create permission-based UI.

Default roles:

Organization Owner

Admin

Project Manager

Team Lead

Sales Manager

Sales Executive

Team Member

Finance User

Client

Permission examples:

project.read

project.create

project.update

project.delete

task.read

task.create

task.assign

task.update

lead.read

lead.create

lead.assign

team.manage

daily_update.review

leave.approve

invoice.create

Create Custom Role screen.

Create permission matrix UI.

==================================================

20. DAILY WORK UPDATE

==================================================

Create dedicated Daily Work Update module.

Employee/user form:

Completed Today

Currently Working On

Next Plan

Blockers

Related Project

Related Tasks

Overall Status

Attachments

Statuses:

Draft

Submitted

Late

Missing

Reviewed

Manager dashboard:

Submitted Today

Missing

Late

On Leave

Blocked

Show team status:

User

Submission

Project

Blocker

Submitted Time

Create Weekly Summary screen.

Create AI Summary placeholder UI.

==================================================

21. DAILY WORK UPDATE AUTOMATION UI

==================================================

Create settings:

First Reminder

Final Reminder

Submission Deadline

Escalation Time

Working Days

Holiday Exclusion

Leave Exclusion

Notify Team Lead

Visual workflow:

Working Day

→ Check Active User

→ Check Leave

→ Check Update

→ Reminder

→ Deadline

→ Escalation

→ Team Summary

Do not implement real scheduled backend jobs yet.

Create mock automation behavior/UI.

==================================================

22. LEAVE MANAGEMENT

==================================================

Create:

My Leave

Leave Requests

Team Leave

Leave Calendar

Leave Balance

Leave Types

Approval Settings

Leave fields:

Leave Type

Start Date

End Date

Duration

Full/Half Day

Reason

Attachment

Approver

Status

Statuses:

Draft

Pending

Approved

Rejected

Cancelled

Show leave balance cards.

Create manager approval screen.

Show team availability warning if multiple users overlap.

==================================================

23. CALENDAR

==================================================

Create unified calendar.

Display:

Tasks

Project Deadlines

Milestones

Meetings

Leave

Content Schedules

Events

Reminders

Views:

Month

Week

Day

Agenda

Filters:

Project

Team

User

Event Type

==================================================

24. MEETINGS

==================================================

Create Meetings module.

Fields:

Title

Participants

Client

Project

Date

Start Time

End Time

Meeting URL

Location

Agenda

Notes

Status

Reminder

Meeting types:

Internal

Project

Client

Sales

Create Upcoming, Past, Today views.

==================================================

25. INTERNAL CHAT

==================================================

Create complete real-time-style UI.

Chat types:

Direct

Group

Team

Project

Deal/Client Context

Features:

Message list

Conversation list

Typing indicator UI

Read receipt UI

Unread count

Mentions

Emoji reactions

Reply

Edit

Delete

Attachments

Image preview

Search

Pinned messages

Use mock messages for now.

Architecture must be ready for Supabase Realtime later.

==================================================

26. NOTIFICATIONS

==================================================

Create notification center.

Types:

Task Assigned

Project Deadline

Task Overdue

Meeting Reminder

Mention

Daily Update Reminder

Leave Approval

Invoice Alert

Content Approval

Publishing Failure

System Alert

Support:

Read

Unread

Mark All Read

Filter

Preferences

==================================================

27. QUOTATIONS

==================================================

Create quotation management.

Fields:

Quotation Number

Client

Project

Items

Quantity

Rate

Discount

Tax

Subtotal

Total

Terms

Expiry Date

Status

Statuses:

Draft

Sent

Accepted

Rejected

Expired

Create preview/PDF-style UI.

==================================================

28. INVOICES

==================================================

Invoice fields:

Invoice Number

Client

Project

Quotation

Items

Tax

Discount

Amount

Paid

Outstanding

Issue Date

Due Date

Status

Statuses:

Draft

Sent

Partially Paid

Paid

Overdue

Cancelled

Create professional invoice preview.

==================================================

29. PAYMENTS

==================================================

Create:

Payment List

Record Payment

Payment Details

Fields:

Invoice

Client

Amount

Payment Method

Transaction Reference

Payment Date

Status

Notes

==================================================

30. EXPENSES

==================================================

Create:

Project Expenses

General Expenses

Fields:

Project

Category

Vendor

Amount

Date

Attachment

Status

Notes

==================================================

31. FILE MANAGER

==================================================

Create:

Folders

Project Files

Client Files

Task Files

Shared Files

Marketing Assets

Features:

Grid/List

Upload UI

Preview

Download action

Delete/Archive

Search

Filter

File Type

Size

Uploader

Date

Use mock upload behavior.

==================================================

32. SOCIAL MARKETING OVERVIEW

==================================================

Create marketing dashboard.

KPIs:

Ad Spend

Reach

Impressions

Clicks

CTR

CPC

CPM

Leads

CPL

Conversions

ROAS

Scheduled Content

Published Content

Create charts with realistic mock data.

==================================================

33. CONTENT CALENDAR

==================================================

Create Content Calendar module.

Views:

Month

Week

Day

Agenda

Campaign

Platform

Content types:

Static Post

Carousel

Reel

Story

Short Video

Long Video

Link Post

Campaign Creative

Statuses:

Idea

Planned

In Progress

Designing

Review

Changes Requested

Approved

Scheduled

Publishing

Published

Failed

Cancelled

==================================================

34. CONTENT CREATION WORKFLOW

==================================================

Create workflow:

Idea

→ Brief

→ Copywriting

→ Design / Video

→ Review

→ Changes Requested

→ Approval

→ Scheduled

→ Published

→ Performance

Fields:

Title

Caption

Content Type

Platform

Campaign

Media

Thumbnail

Hashtags

CTA

Destination URL

Writer

Designer

Reviewer

Approver

Publish Date

Publish Time

Timezone

==================================================

35. CONTENT LIBRARY

==================================================

Create library categories:

Images

Videos

Reels

Logos

Templates

Captions

Campaign Assets

Filters:

Client

Campaign

Platform

Type

Creator

Date

Tag

==================================================

36. SCHEDULED CONTENT

==================================================

Create publishing queue UI.

Statuses:

Waiting

Processing

Publishing

Published

Retrying

Failed

Cancelled

Columns:

Content

Platform

Account

Schedule

Status

Attempts

Result

Create retry UI.

Do not implement real Meta publishing yet.

==================================================

37. META ADS

==================================================

Create Meta Ads dashboard UI.

Show:

Campaign

Status

Spend

Reach

Impressions

Clicks

CTR

CPC

CPM

Leads

CPL

Conversions

ROAS

Pages:

Accounts

Campaigns

Ad Sets

Ads

Lead Forms

Reports

Use mock integration status.

==================================================

38. META LEADS

==================================================

Create lead source interface showing:

Name

Email

Phone

Campaign

Ad

Ad Set

Lead Form

Created Time

Assignment

CRM Status

Add:

Convert to CRM Lead

Assign User

Add Note

Create Follow-Up

==================================================

39. WHATSAPP / UNIFIED LEAD INBOX

==================================================

Build a 3-column professional inbox:

Left:

Conversations

Center:

Messages

Right:

Lead / Client Details

Actions:

Create Lead

Create Client

Create Deal

Assign User

Add Note

Create Task

Schedule Meeting

Use realistic mock WhatsApp conversations.

==================================================

40. AI ASSISTANT

==================================================

Create AI Assistant UI.

Functions:

Project Summary

Task Summary

Daily Update Summary

Meeting Summary

Lead Summary

Lead Scoring

Suggested Reply

Campaign Analysis

Content Ideas

Caption Generator

Reel Script

Automation Help

For now:

Use simulated responses / placeholders.

Do not expose or require an AI API key.

==================================================

41. AUTOMATION BUILDER

==================================================

Create visual automation builder based on:

TRIGGER

→ CONDITION

→ ACTION

Trigger examples:

Lead Created

Deal Won

Project Created

Task Overdue

Daily Update Missing

Leave Requested

Content Approved

WhatsApp Message Received

Conditions:

Project Type

Lead Source

Team

User

Priority

Status

Value

Score

Actions:

Assign User

Create Task

Change Status

Notify

Create Project

Create Chat Room

Send Email Placeholder

Send WhatsApp Placeholder

Generate AI Summary Placeholder

Call Webhook Placeholder

Create:

Workflow List

Workflow Builder

Execution Logs

Run History

Enable/Disable

==================================================

42. ANALYTICS

==================================================

Create analytics dashboards:

Project Analytics

CRM Analytics

Team Analytics

Financial Analytics

Marketing Analytics

Project:

Completion Rate

Delayed Projects

Overdue Tasks

Milestone Performance

CRM:

Lead Sources

Lead Conversion

Pipeline Value

Won/Lost Deals

Team:

Task Completion

Availability

Daily Update Submission

Finance:

Invoices

Outstanding

Revenue

Expenses

Marketing:

Ad Spend

Leads

CPL

Content Performance

==================================================

43. GLOBAL SEARCH

==================================================

Create command-style global search.

Search:

Projects

Tasks

Clients

Leads

Deals

Users

Teams

Files

Meetings

Invoices

Content

Add keyboard shortcut support if suitable.

==================================================

44. AUDIT LOGS

==================================================

Create Admin Audit Logs screen.

Show:

User

Action

Entity

Old Value

New Value

Date

IP Placeholder

Status

Examples:

Project Created

Task Completed

User Role Changed

Deal Won

Invoice Updated

Leave Approved

Automation Executed

==================================================

45. INTEGRATION CENTER

==================================================

Create integration cards:

Supabase

Meta

WhatsApp Business

Email

AI Provider

Webhooks

Show:

Connected

Not Connected

Configuration Required

Error

Do not require real credentials yet.

==================================================

46. SETTINGS

==================================================

Create organized settings pages:

Organization

Branding

General

Timezone

Currency

Work Days

Holidays

Users

Roles

Permissions

Teams

Project Statuses

Task Statuses

CRM Pipelines

Leave Settings

Content Settings

Notifications

Automation

Integrations

Security

==================================================

47. MOCK DATA MODEL

==================================================

Create realistic typed mock entities that closely match future Supabase tables.

Every major business entity should have:

id

organization_id

created_at

updated_at

where appropriate.

Examples:

Organization

User

OrganizationMember

Role

Permission

Team

TeamMember

Client

Contact

Lead

Deal

Project

ProjectMember

Task

Milestone

DailyWorkUpdate

LeaveRequest

Meeting

ChatRoom

ChatMessage

Quotation

Invoice

Payment

Expense

FileRecord

Notification

ContentItem

Campaign

AutomationWorkflow

AuditLog

Do not store relational data unnecessarily in unstructured JSON.

==================================================

48. ORGANIZATION-AWARE ARCHITECTURE

==================================================

Even though Supabase is not yet connected, design data and services as multi-tenant.

Every business service should conceptually accept an organization scope.

Example:

getProjects(organizationId)

getLeads(organizationId)

getTeams(organizationId)

Do not mix records between mock organizations.

Create a workspace/company selector placeholder if useful.

==================================================

49. PERMISSION-AWARE UI

==================================================

Create a mock permission system.

Components/routes/actions should support permission checks.

Examples:

can("project.create")

can("task.assign")

can("lead.update")

can("leave.approve")

can("invoice.create")

Hide or disable actions based on permissions.

This will later connect to Supabase RLS + database RBAC.

==================================================

50. USER EXPERIENCE REQUIREMENTS

==================================================

Every important page must include:

Loading state

Skeleton state

Empty state

Error state

Success feedback

Confirmation dialog

Form validation

Responsive design

Accessibility-friendly controls

Tooltip where useful

Forms must have:

- required field validation

- useful error messages

- cancel/save

- dirty-state awareness where appropriate

Tables must support where appropriate:

Search

Filter

Sort

Pagination

Column visibility

Bulk actions

Responsive handling

==================================================

51. QUICK CREATE

==================================================

Create a global “+ Create” menu.

Options:

Project

Task

Lead

Client

Deal

Meeting

Daily Update

Leave Request

Quotation

Invoice

Content

==================================================

52. ACTIVITY TIMELINE

==================================================

Create reusable ActivityTimeline component.

Use inside:

Projects

Tasks

Clients

Leads

Deals

Users

Example events:

Created Project

Changed Status

Assigned User

Added Comment

Uploaded File

Completed Task

Updated Deadline

==================================================

53. SHARED COMPONENTS

==================================================

Build reusable components rather than duplicating layouts.

Examples:

AppShell

Sidebar

Topbar

PageHeader

StatCard

DataTable

StatusBadge

PriorityBadge

UserAvatarGroup

SearchInput

FilterBar

EmptyState

ErrorState

SkeletonCard

ConfirmDialog

FormDrawer

ActivityTimeline

FileUploader

CommentThread

MetricChart

Calendar

KanbanBoard

TimelineView

PermissionGuard

==================================================

54. ROUTING

==================================================

Create clean routes similar to:

/dashboard

/projects

/projects/:id

/tasks

/kanban

/timeline

/milestones

/crm/leads

/crm/clients

/crm/contacts

/crm/deals

/crm/pipeline

/teams

/users

/daily-updates

/leave

/chat

/calendar

/meetings

/notifications

/marketing

/marketing/content-calendar

/marketing/content-library

/marketing/scheduled

/marketing/meta

/marketing/meta-leads

/marketing/whatsapp

/marketing/inbox

/business/quotations

/business/invoices

/business/payments

/business/expenses

/files

/analytics

/automation

/automation/:id

/admin/users

/admin/roles

/admin/integrations

/admin/audit

/settings

==================================================

55. MOBILE REQUIREMENTS

==================================================

Do not simply shrink desktop screens.

Create mobile-specific behavior:

Dashboard:

stacked cards

Tables:

cards or horizontal responsive table

Kanban:

horizontal swipe

Timeline:

horizontal scrolling

Chat:

conversation screen navigation

Project:

compact tabs / selector

Forms:

full-screen drawers where appropriate

Bottom navigation:

Home

Projects

Tasks

CRM

More

==================================================

56. PERFORMANCE

==================================================

Use:

lazy loading where appropriate

code splitting

memoization only where useful

efficient data structures

optimized image handling

virtualized long lists if necessary

Avoid unnecessary heavy animations.

==================================================

57. CODE QUALITY

==================================================

Requirements:

- Strict TypeScript

- No unnecessary `any`

- Reusable types

- Feature-based separation

- Avoid huge monolithic components

- Separate presentation from services

- Avoid duplicated business logic

- Centralize constants

- Centralize status definitions

- Centralize permission definitions

- Clear naming

- No dead code

- No fake backend APIs tightly embedded inside components

==================================================

58. DEMO DATA

==================================================

Create professional realistic demo data.

Examples:

Projects:

Corporate Website

CRM Implementation

SEO Campaign

Mobile Application

Clients:

ABC Holdings

Nova Retail

Prime Properties

Teams:

Development

Design

Marketing

Sales

Create enough realistic data to make:

Dashboard

Kanban

Timeline

CRM Pipeline

Analytics

Calendar

Chat

Invoices

look complete and professional.

==================================================

59. IMPORTANT ARCHITECTURE RULES

==================================================

DO NOT:

- Create random duplicate models

- Create separate Kanban tasks

- Create separate calendar tasks

- Hardcode data directly inside pages

- Create production secrets

- Expose API tokens

- Implement payroll

- Implement attendance

- Implement timesheets

- Implement Time Tracker

- Implement full HRM

- Add unnecessary modules

- Change the architecture without reason

Use one source of truth per domain.

Examples:

tasks

→ List

→ Kanban

→ Timeline

→ Calendar

→ Dashboard

projects

→ Dashboard

→ Project List

→ Reports

==================================================

60. FUTURE SUPABASE READINESS

==================================================

The application must be ready for later integration with:

Supabase PostgreSQL

Supabase Auth

Supabase Storage

Supabase Realtime

Supabase Row Level Security

Supabase Edge Functions

Do not connect everything automatically yet.

Prepare clean adapters/interfaces.

Future mapping:

MockAuthService

→ SupabaseAuthService

MockProjectService

→ SupabaseProjectService

MockCRMService

→ SupabaseCRMService

MockChatService

→ SupabaseRealtimeChatService

MockFileService

→ SupabaseStorageService

==================================================

61. FINAL DELIVERABLE

==================================================

Generate a fully navigable Project Management CRM frontend/application prototype.

The application must:

- look production-grade

- feel consistent across every module

- use one design system

- be responsive

- use realistic structured mock data

- demonstrate complete workflows

- use reusable service abstractions

- be prepared for Supabase

- compile without blocking TypeScript errors

- have no broken routes

- have no placeholder pages that are completely empty

Prioritize quality over unnecessary visual decoration.

Do not attempt to connect real payment, Meta, WhatsApp, AI, email or publishing APIs in this first build.

Represent those integrations professionally through interfaces, demo states, and mock services.

At the end:

1. Review all routes.

2. Fix broken navigation.

3. Fix TypeScript errors.

4. Fix obvious responsive problems.

5. Remove duplicate components.

6. Ensure sidebar permissions work with mock roles.

7. Ensure all primary workflows are navigable.

8. Ensure all pages use the same design system.

9. Ensure the project is ready for the next phase:

   Supabase Database + Auth + RLS Integration.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://taskforge-grow.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/73f14a0c-672a-45e4-b885-fd701c654334).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
#   T e a m l i o - - - T a s k - M a n a g e m e n t - C R M  
 #   T e a m l i o - - - T a s k - M a n a g e m e n t - C R M  
 