# Live Admin Dashboard

## Goal
Turn Workspace Admin into a real, organization-scoped dashboard using live Lovable Cloud data while preserving the CRM’s current visual language and management tools.

## What will change
- Add a live `projects` data model tied to an organization, with name, category, status, priority, owner, dates, and progress.
- Protect project data so organization members can view it and organization owners/admins can manage it.
- Extend the live data hooks with project reads and dashboard-ready loading/error states.
- Add an **Overview** tab as the default admin view with:
  - Organizations, users, teams, and projects totals
  - Member role distribution chart
  - Team size chart
  - Project status chart
  - Recent organizations, members, teams, and projects activity
- Keep the existing Users, Teams, and Organization management tabs intact.
- Add a Projects tab with live project creation, category, assignment, listing, and editable workflow status.
- Add live organization-scoped tasks with assignment, category, and editable workflow status.
- Support practical project/task states including backlog, planned, in progress, review, paused, and completed.
- Use the existing stat cards, chart component, tokens, spacing, borders, and responsive patterns from the mock CRM dashboard.

## Behavior
- The organization selector controls all user, team, project, and chart data.
- The organization total reflects all organizations available to the signed-in account.
- Users, teams, and projects reflect the selected organization only.
- Empty, loading, permission, and backend error states remain clear and responsive.
- Only owners/admins can create projects; all active organization members can view dashboard data.

## Verification
- Check database access rules and generated types.
- Verify the dashboard with an authenticated session at desktop and mobile widths.
- Confirm organization switching refreshes every count and chart without mixing records.
- Confirm project and task creation, assignment, and status updates refresh counts, charts, activity, and management tabs.
