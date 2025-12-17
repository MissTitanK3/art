# Region STG — Comprehensive User Testing Plan

This checklist translates the current `apps/region-stg` surface area into concrete scenarios the user base can execute before a major launch. Organize test cycles by persona/role so that Row-Level Security (RLS) paths and UI gating are covered end-to-end.

## 0. Logistics & Role Coverage

- **Environment baseline**
  - [ ] Confirm `.env.local` values (Supabase URLs/keys, Signal links, contact email) match the staging stack before inviting testers.
  - [ ] Run `pnpm --filter region-stg dev` and verify the `/api/health` route responds before distributing builds.
- **Accounts & permissions**
  - [ ] Prepare at least six seed accounts: new user (no profile), verified volunteer (`completeOnboarding` true), pod leader (`elevatedRoles`), dispatcher admin, regional admin, national admin (needed for Iceout sync).
  - [ ] Document how to flip roles in Supabase so testers can promote/demote themselves without engineering support.
- **Data hygiene**
  - [ ] Snapshot key tables (dispatches, meet_a_need, missing_person_records, warehouses) before testing so we can roll back polluted data.
  - [ ] Communicate that several views (Meet-A-Need, Pods, Dispatch list, Teleprompter) persist filters/settings in `localStorage`; testers should clear storage between scenarios to avoid cross-talk.

## 1. Identity, Access & Support

### 1.1 Authentication & role gating

- [ ] **Sign-up, sign-in, reset** — Walk through `/sign-up`, `/sign-in`, and `/forgot-password` with a brand-new email; confirm you are redirected to `/my-profile?reason=profile-required` until the profile is complete.
- [ ] **Role-based nav visibility** — For each persona toggle, confirm the nav links from [nav.config.ts](../nav.config.ts#L1-L120) respect `completeOnboarding`, `elevatedRoles`, `regionAdmins`, `verifiedAdmins`, etc. (e.g., `Dispatch`, `Warehouse`, `Confirmed Watch` should disappear for basic volunteers).
- [ ] **Unauthorized redirects** — Hit guarded routes directly (e.g., `/confirmed-watch`, `/admin`, `/schedules`) with an under-permissioned account and verify the guard sends you back to `/my-profile?reason=forbidden-*` with the correct banner copy.

### 1.2 My Profile & operating zones

- [ ] **Profile load & edit** — `/my-profile` should hydrate from Supabase via `ProfileLayout`; edit display name, access role, coverage zones, and confirm the toast + persisted values (check Supabase `profiles` table).
- [ ] **Reason banner regression** — Append each `reason` query param (`profile-required`, `suspended`, `forbidden-admin`, etc.) and ensure the yellow banner messaging matches the code map and disappears when “Dismiss” is clicked (query param removed).
- [ ] **Coverage map workflow** — From `/my-profile`, open “Select Zones of Operation”; add/remove multiple counties, edit grid zones, save, and confirm `/my-profile` shows the updated `operating_counties` list. Validate `CountySelectLayout` handles empty profiles gracefully.

### 1.3 Settings & notifications

- [ ] **Notification preferences** — In `/settings`, toggle `global_opt_out` and per-channel mutes, click Save, and verify rows in `notification_prefs` upsert correctly and rehydrate on reload.
- [ ] **Web push enrollment** — Use the `EnablePush` component to register/unregister a browser; confirm permission prompts, service worker status, and fallback messaging on unsupported browsers.

### 1.4 Support & guidance

- [ ] **How-to index** — `/how-to-use` should load the default section and highlight nav; switching sections updates `?section=` without scrolling. The quick panel should deep-link to Bug Tracker.
- [ ] **Bug report form** — From the How-To Bug Tracker, submit the embedded `BugReportForm` and confirm the `/app/api/bug-reports` endpoint responds (check Supabase/Sentry for entries).

### 1.5 Credentialing & trust

- [ ] **Credential card preview** — `/credentials` renders the printable card; verify it adapts to desktop + mobile and text truncation is graceful.
- [ ] **Trust management stub** — `/trust-management` currently shows placeholder copy; capture tester feedback that functionality is pending so expectations are clear.

## 2. Dispatch & Rapid Response

### 2.1 Watch map & intake (`/watch`)

- [ ] **Map vs. list parity** — Load hundreds of reports via `/api/watch`; ensure the map markers and list cards stay in sync when filters change.
- [ ] **Filter bar** — Exercise each filter toggle: hide test data, require media, lights-only, sirens-only, moving-only, time windows (`2h` → `72h`), query text, and agency multi-select. Validate the empty-state messaging for both map and list tabs.
- [ ] **Map focus + create dispatch** — Click “View on map” (should animate to the location using the `MapFocus` token) and “Create dispatch” (pre-fills `/team-req` via `lat,lng,label,agency,eventType` query params). Ensure the banner acknowledging Watch prefill appears.

### 2.2 Team request creation (`/team-req`)

- [ ] **Preset integrity** — Switch event presets (scout, mutual aid, etc.) and confirm `TEAM_CONFIG_PRESETS` drives required roles + intended actions.
- [ ] **Prefill from query string** — Start from Watch map, verify location + notes + agency autopopulate, and that editing them updates the payload.
- [ ] **Submission flow** — Submit, expect POST `/api/dispatches`, optimistic store update, then redirect to `/dispatches/submission/{id}` even if the API fails (console warning only). Validate server persistence created a row in Supabase.

### 2.3 Dispatch board (`/dispatches`) & detail (`/dispatches/submission/[id]`)

- [ ] **Filter persistence** — Adjust status/type/date filters; verify `dispatchList.filters:${REGION_IDENTIFIER}` in `localStorage` and URL query stay in sync.
- [ ] **Empty, loading, dedupe** — Simulate zero results and duplicate IDs to confirm the UI handles both without React key warnings.
- [ ] **Detail updates** — In the submission view, edit core fields (status, escalation flags), add/edit/delete timeline updates, and mutate logistics items; confirm PATCH/POST requests succeed and the local store mirrors server state.
- [ ] **Radio Comms tab** — Create/update/delete teams, logs, global check-ins, and alerts in `CommsDashboardView`; ensure timers and optimistic updates behave when offline.

### 2.4 Confirmed Watch (`/confirmed-watch`)

- [ ] **Guarded access** — Non-verified admins should hit a 403 redirect, verified admins should load the form.
- [ ] **Submission** — Send a report; inspect `/api/confirmed-watch` logs + Supabase rows to ensure payload structure matches the UI form (media links, classification, location, attachments, reporter info).

### 2.5 Scheduling & coverage

- [ ] **Dispatch schedules (`/schedules`)** — Hydrate shifts from `/api/dispatch/shifts`, add/edit/delete entries, and confirm volunteer resolution (roster lookups) works even when you start with only a roster entry ID.
- [ ] **Roster fetch fallback** — Remove local pod data and ensure the `getVolunteersForPod` path fetches `/api/roster?pod_id=...` and populates the drawer without crashing.
- [ ] **Collective calendar (`/pods/calendar`)** — Load `/api/calendar`, validate pods + org membership mapping, create shifts (check ownership payload, visibility scope), update shifts, add signups, and delete shifts. Ensure timezone formatting and parse guards around `parseISO` behave for invalid data.

### 2.6 Performance dashboard (`/performance`)

- [ ] **Auto-refresh** — Confirm the initial fetch, the 2-minute interval, and the `visibilitychange` handler all refresh without stacking requests.
- [ ] **Metrics toggles** — Toggle "Show high-risk" and verify cards appear/disappear; trigger error states (mock 500) to surface the destructive alert styling.

### 2.7 Present teleprompter (`/present`)

- [ ] **State persistence** — Update script, custom colors, font, mirroring, and speed; reload to ensure Zustand + localStorage restore values once `canSyncRef` flips.
- [ ] **Full-screen controls** — Enter/exit fullscreen on desktop + mobile, check auto-hide overlay, orientation hints, and keyboard shortcuts (space, arrows, F, H/V mirroring) using `useTeleprompterHotkeys`.
- [ ] **Import/export** — Use the import drawer to load custom copy, verify tempo calculation (`computeLineMsOrdered`) updates the countdown + total duration.

## 3. Community Support, Pods & Logistics

### 3.1 Meet-A-Need board (`/meet-a-need`)

- [ ] **Filters + persistence** — Use search, category, urgency, status, visibility, date range, pagination, and page size controls; reload to confirm `meetANeed.filters` restores settings.
- [ ] **CRUD actions** — Create a need via `SubmitNeedDrawer`, update status (`matched`, `fulfilled`, `closed`), edit fields, offer help (moves to matched), and delete (calls `safe_delete_meet_a_need`). Ensure optimistic store updates match Supabase responses.

### 3.2 Organizations (`/organizations`)

- [ ] **Org switcher** — Load organizations, switch between them, and verify pods/members/polls rehydrate per org.
- [ ] **Member management** — Add/remove members, change roles, transfer ownership; ensure permissions enforce that only elevated roles can use these controls.
- [ ] **Pod linking** — Link/unlink pods, confirm UI + backend stay consistent.
- [ ] **Norms & visibility** — Edit norms and visibility scope (`VisibilityScope`), checking for toasts and data refresh.
- [ ] **Poll lifecycle** — Create polls, vote, change status (open/closed/archived), delete, and confirm results tally.
- [ ] **Org creation** — Open the create drawer, enter data, save, and confirm the new org becomes selectable.

### 3.3 Pods directory & management (`/pods` + `/pods/[id]`)

- [ ] **Directory filters** — Search/filter by area + channel, confirm `podsList.filters:${REGION_IDENTIFIER}` persists.
- [ ] **Creation flow** — Use the modal to create a pod; confirm slug enforcement (`pod-` prefix) and fallback path when the API fails (local store adds pod and navigates anyway).
- [ ] **Detail editing** — Update name, area, channel type/link, slug, then save; verify server patch works and slug changes redirect to the new URL.
- [ ] **Archive** — Archive a pod and ensure it disappears from listings and redirects to `/pods`.

### 3.4 Warehouse dashboard (`/warehouse`)

- [ ] **Data hydration** — Confirm warehouses, zones/bins, inventory, movement logs, pick lists, confirmed pick lists, and catalog entries load from Supabase tables at page open.
- [ ] **Warehouse editing** — Add/edit/remove zones and bins, update capabilities/notes, and verify server upserts + deletes propagate correctly.
- [ ] **Inventory intake** — Use the intake drawer to add items (with optional expiration, notes); ensure `resolveInventoryLocation` updates stock and creates corresponding movement log entries.
- [ ] **Movement logs** — Create manual movement events (check steward name stamping) and verify ordering + formatting.
- [ ] **Pick list flow** — Add items to the pick list, simulate fulfillment/confirmation (moves entries to `confirmedPickLists` with metadata), and test error handling when Supabase rejects updates.
- [ ] **Catalog maintenance** — Add/update catalog items and verify they auto-complete SKUs/labels during intake.

## 4. Missing Persons & Advocacy

### 4.1 Directory (`/missing-persons`)

- [ ] **Listing + search** — Confirm `/api/missing-persons` hydrates `MissingPersonsDirectory`, search + filter interactions remain responsive with large data sets.
- [ ] **Export** — Use the directory actions to export records and verify files match the `MissingPersonsDirectory` selection.

### 4.2 Case detail (`/missing-persons/[slug]`)

- [ ] **Hydration priority** — Ensure local store records load instantly and Supabase refresh merges in latest data; simulate missing record to confirm the empty state text.
- [ ] **Edit & save** — Update any field and confirm Supabase upserts succeed; use `exportLegalAidReport` to generate the report artifact.
- [ ] **Finalize** — Trigger the “Finalize” action and confirm `/api/missing-persons/finalize` notifies advocacy groups (toast success) and errors degrade gracefully.
- [ ] **Delete** — Delete the record, ensure `safe_delete_missing_person_record` RPC runs, and you are redirected back to the directory.

### 4.3 Intake (`/missing-persons/intake`)

- [ ] **Case ID helpers** — Validate last case ID detection + sequencing and duplicate detection in the form header.
- [ ] **Export + save** — Submit the form, export to legal aid, and confirm Supabase `missing_person_records` receives the row.
- [ ] **Guardrail copy** — Confirm the alert reminding testers to collect only required PII remains prominent.

## 5. Knowledge, Training & Guidance

### 5.1 Academy dashboard (`/academy`)

- [ ] **Stats + course groups** — Confirm pod/member-derived stats populate `PodAcademyDashboardLayout`; check that completion counts match actual pod member data.
- [ ] **Operational minimum overrides** — Edit thresholds, save, and verify Supabase `region_settings` stores overrides and rehydrates on reload.
- [ ] **Sessions & instructors** — Create/edit/delete sessions, add participants, and ensure instructor lists stay in sync with Supabase tables.
- [ ] **Schedule CTA** — Use “Schedule class” buttons to deep-link into `/academy/class/{id}` (or confirm the router push works if routes are stubbed).

### 5.2 Knowledge pages

- [ ] **Intents / Roles / Impact** — Review `/intents`, `/roles`, `/impact` for copy accuracy, responsive layout, and correct cross-links (e.g., Impact page links to Roles & Intents anchors).
- [ ] **Frontline Present** — Already covered in §2.7 but treat as a knowledge tool; ensure script metadata (labels, durations) stays accurate.

### 5.3 How-To hub & Academy references

- [ ] **Academy guide cards** — Confirm the How-To sections for Academy (class creation, pods) mirror the latest flows so testers have an in-app manual.

## 6. Admin & Governance

### 6.1 Admin dashboard (`/admin`)

- [ ] **Metric blocks** — Validate totals for profiles, pods, and active dispatches align with Supabase counts.
- [ ] **Iceout sync (national admins only)** — Check status fetch, trigger a sync, and verify the success toast displays inserted/checked counts.
- [ ] **Admin navigation tiles** — Ensure each link routes correctly and respects downstream permissions.

### 6.2 Notifications panel

- [ ] **Template send** — Use a canned template from `ADMIN_NOTIFICATION_TEMPLATES`, send it, and confirm success toasts include recipient counts.
- [ ] **Custom send** — Compose a free-form notification, submit, and verify `/api/admin/notifications/send` logs the message body + metadata.

### 6.3 Advocacy groups & campaigns

- [ ] **Admin → Advocacy Network** — Smoke test `/admin/advocacy-groups` (ensure Supabase policies allow only admins), confirm CRUD works if implemented, or note TODOs if stubbed.
- [ ] **Admin → Campaigns** — Verify season creation/naming flows match expectations for the Frontiers integration (if not yet implemented, capture the gap).

### 6.4 Bug reports & trust

- [ ] **Admin → Bug Reports** — Submit from How-To, confirm the admin list populates, triage actions (mark resolved, assign) behave.
- [ ] **Admin → Trust** — Ensure signatures/trust records can be approved/denied if wired up; otherwise document the placeholder state so stakeholders know it’s pending.

## 7. Cross-cutting Regression Checks

- [ ] **API failure tolerance** — For every mutating flow (team requests, meet-a-need, pods, warehouse, missing persons), throttle or mock a 500 response and verify the UI surfaces toasts and keeps local state consistent.
- [ ] **Offline-aware stores** — Toggle network offline while editing, then restore to ensure optimistic updates don’t duplicate entries.
- [ ] **GDPR/PII boundaries** — Validate that exports (Missing Persons, Meet-A-Need) only include the fields expected for the recipient audience.
- [ ] **Accessibility** — Spot check modals/drawers for focus traps (SubmitNeedDrawer, PodCreatorLayout, Teleprompter drawers, Warehouse sheets).
- [ ] **Mobile layouts** — Test primary flows (Watch, Meet-A-Need, Pods, Dispatch detail, Warehouse pick lists) on a phone-sized viewport to ensure grids collapse without horizontal scroll.

---
Use this plan as a living document—annotate each checkbox with tester names, dates, Supabase record IDs, or bug links as runs progress. The order matches user journeys (identity → dispatch → community → advocacy → governance) so issues uncovered early don’t invalidate later scenarios.
