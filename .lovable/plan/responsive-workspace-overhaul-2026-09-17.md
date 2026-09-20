# Responsive workspace overhaul

## Goal
Make the full workspace comfortable and reliable on phones, tablets, laptops, and wide desktops, with special attention to the 393px mobile layout.

## What will change
- Strengthen the shared app shell: mobile sidebar, top bar, safe-area spacing, content width, and bottom navigation.
- Make shared page headers, filters, tables, charts, dialogs, dropdowns, and form drawers adapt cleanly to narrow screens.
- Replace fragile fixed-width action rows and filters with stacked or full-width mobile layouts.
- Give dense data pages usable mobile presentations while preserving desktop tables and dashboards.
- Audit every module page for horizontal overflow, clipped controls, overlapping content, and forms that exceed the viewport.
- Keep the existing visual design, permissions, live data, and application behavior unchanged.

## Technical approach
- Fix responsive behavior primarily in shared components so all current and future pages inherit it.
- Apply focused page-level adjustments only where a page has unique dense content such as pipeline boards, calendars, chat, or document previews.
- Preserve intentional horizontal scrolling for boards and timelines, with bounded containers and clear touch behavior.
- Verify representative public, admin, CRM, project, finance, settings, and form flows at mobile and desktop widths.

## Validation
- Check key pages at 393px, tablet width, and 1280px.
- Confirm the sidebar opens/closes correctly, forms remain fully usable, tables/cards do not force page overflow, charts remain legible, and no controls overlap.
- Run the project’s type validation and inspect browser console errors.
