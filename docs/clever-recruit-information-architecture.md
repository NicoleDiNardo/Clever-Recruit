# Clever Recruit — Information Architecture

Status labels: **[Implemented]** · **[New scope]** · **[Future scope]**. This document is the spec for the Figma IA page (`04 Information Architecture`) and for route work in Phase 13.

## Sitemap overview

```
Public (unauthenticated)                    [New scope, except /login]
├── / (redirects → /jobs)                   [New scope]
├── /jobs                    Jobs directory [New scope]
├── /jobs/:jobId              Job detail    [New scope]
├── /jobs/:jobId/apply        Application   [New scope]
├── /apply/:applicationId/confirmation      [New scope]
├── /status                   Status lookup [New scope]
├── /status/:applicationId    Application status [New scope]
└── /login                    Login         [Implemented]

Authenticated — recruiter & hiring manager
├── /dashboard                              [Implemented, role-aware content — New scope]
├── /jobs (internal)                        [Implemented, extended: draft/preview/publish — New scope]
├── /jobs/:jobId (internal)                 [Implemented, extended]
├── /jobs/:jobId/edit                       [Implemented as modal — New scope: dedicated route]
├── /jobs/new                               [Implemented as modal — New scope: draft→preview→publish route]
├── /candidates                             [Implemented]
├── /candidates/:candidateId                [Implemented as drawer — kept as drawer, addressable via query param, already the case: ?candidate=]
├── /pipeline                 Pipeline board [New scope]
├── /pipeline/:jobId          Pipeline for one job [New scope]
├── /interviews               Interview list [New scope]
├── /interviews/:interviewId  Interview detail/scheduling [New scope]
├── /companies                              [Implemented]
├── /team                                   [Implemented]
├── /calendar                               [Implemented, connected to interviews — New scope for the connection]
├── /reports                                [Implemented]
├── /settings                               [Implemented]
└── /settings/notifications, /settings/profile [Implemented, currently one page — kept as tabs within /settings, not split]

Administrator
├── /admin/users              User list      [New scope]
├── /admin/users/invite       Invite user    [New scope]
├── /admin/roles              Roles & permissions (view/change on user record, not a separate matrix editor) [New scope, reduced]
└── /admin/organisation       Org settings (name, logo — minimal) [New scope, reduced]
    (Audit log — [Future scope], not built)
```

## Role-based navigation

- **Recruiter**: Dashboard, Jobs, Candidates, Pipeline, Interviews, Companies, Team, Calendar, Reports, Settings. Full access to job/candidate CRUD and pipeline actions within their organisation.
- **Hiring manager**: Dashboard (scoped to their jobs), Pipeline (scoped to their jobs), Candidates (read + shortlist/reject/feedback, scoped to their jobs), Interviews (their jobs), Calendar, Settings. No Jobs create/edit, no Companies/Team management, no Reports (org-wide) by default — sees only their own hiring metrics on Dashboard.
- **Administrator**: everything a recruiter sees, plus `/admin/*`. Whether an admin also acts as a recruiter day-to-day is an **[Assumption]**: yes, matching how small teams actually work — admin is an additive permission, not a separate silo.
- **Candidate**: only the public routes; no access to any authenticated route.

## Permission boundaries

| Action | Recruiter | Hiring manager | Admin | Candidate |
|---|---|---|---|---|
| Create/edit/close a job | ✅ | ❌ | ✅ | — |
| View candidates for a job | ✅ (all jobs) | ✅ (assigned jobs only) | ✅ | — |
| Change a candidate's stage | ✅ | ❌ (shortlist/reject only — see below) | ✅ | — |
| Shortlist / reject a candidate | ✅ | ✅ (assigned jobs only) | ✅ | — |
| Leave feedback on a candidate | ✅ | ✅ | ✅ | — |
| Schedule an interview | ✅ | ❌ (can propose availability — Future scope) | ✅ | — |
| Invite a user / change a role | ❌ | ❌ | ✅ | — |
| Apply to a job | — | — | — | ✅ |
| View own application status | — | — | — | ✅ (own application only) |

A permission-denied attempt (e.g. hiring manager navigating to `/jobs/new` via a stale link) renders a dedicated **Permission denied** state, not a redirect-and-say-nothing or a blank page — this is itself a required Figma component and coded state (see audit AUD-P0-01 acceptance criteria).

## Main content hierarchy (authenticated shell)

`AppShell (header + collapsible sidebar) → page header (title, primary action) → content (table / board / form / detail)`. This matches the existing `AppLayout`/`Sidebar` pattern — extended with role-aware nav items, not replaced.

## Entry points

- Public: direct link/share to a job (`/jobs/:jobId`), portfolio iframe embed (existing `useEmbedMode`, extended to also support embedding the public jobs board as a standalone portfolio artefact).
- Authenticated: `/login` → `/dashboard`; deep links to any authenticated route redirect through login and land back on the originally requested route after auth (not currently true — flagged as AUD implementation task, since today it always redirects to `/dashboard`... [Assumption: to confirm during implementation]).

## Exit points

- Candidate: after applying, can leave via confirmation page's "Browse more jobs" (back into public IA) or simply close the tab — no forced account creation.
- Authenticated: explicit Logout in the header menu (existing), returns to `/login`.

## Per-route specification

For every route: **Role · Purpose · Entry points · Primary action · Secondary actions · Required data · Permission requirements · Loading / Empty / Error / Success states · Exit points.**

### `/jobs` — Public jobs directory [New scope]
Role: Candidate (unauthenticated). Purpose: discover open roles. Entry: portfolio link, direct share, search engine (illustrative). Primary action: open a job. Secondary: filter by location/type, search by keyword. Required data: published jobs only (`status = published`, never draft). Permission: none. Loading: skeleton cards. Empty: "No open roles right now" with a note to check back. Error: retry affordance. Success: list renders. Exit: job detail, or leave.

### `/jobs/:jobId` — Public job detail [New scope]
Role: Candidate. Purpose: understand the role and decide to apply. Entry: from directory, or direct link. Primary action: Apply. Secondary: back to directory, share. Required data: one published job; a closed/unpublished job shows a clear "this role is no longer accepting applications" state rather than a 404. Permission: none. States: loading skeleton, error (not found → distinct from closed), success. Exit: application form, or back.

### `/jobs/:jobId/apply` — Application form [New scope]
Role: Candidate. Purpose: submit an application. Entry: from job detail only (no direct deep link into an empty form without job context — if accessed directly, redirect to job detail). Primary action: Submit application. Secondary: cancel/back (with an "are you sure, you'll lose this" confirmation once any field is filled — prevents accidental data loss per the brief's rules). Required data: name, email, phone, CV/file upload, optional cover note. Permission: none. States: field-level validation errors (invalid email/phone, missing required field, unsupported file type, file too large), submit-in-progress (disabled button + spinner), submit failure (network/timeout — retry without losing entered data), success → redirect to confirmation. Exit: confirmation page.

### `/apply/:applicationId/confirmation` [New scope]
Role: Candidate. Purpose: confirm the application was received and set expectation for next steps. Primary action: note the status-check path (email + reference, or a direct link if issued). Secondary: browse more jobs. Required data: application id, job title, submitted timestamp. Permission: only reachable immediately post-submit or via a valid link — a stale/invalid id shows an error state, not another candidate's data. Exit: status page or directory.

### `/status` and `/status/:applicationId` — Status lookup [New scope]
Role: Candidate. Purpose: check where an application stands without an account. Primary action: look up by email + application reference. States: not-found (wrong reference/email combination — generic message, doesn't confirm/deny whether an email exists, for basic privacy hygiene), loading, success (shows current stage in plain language, e.g. "In review" / "Interview scheduled" / "Not moving forward" / "Offer extended" — never exposes internal stage jargon like raw pipeline keys). Exit: directory, or close.

### `/dashboard` [Implemented, role-aware content New scope]
Role: Recruiter, hiring manager, admin. Purpose: orient — what needs attention now. Primary action varies by role (recruiter: review new applicants; hiring manager: review candidates awaiting their feedback). Required data: role-scoped counts and recent activity. States: loading skeleton (existing pattern extended), empty (a brand-new org/recruiter with zero jobs — currently not handled, since mock data always has jobs — this is a real empty state to design and build), error (data fetch failure), success.

### `/pipeline` and `/pipeline/:jobId` — Pipeline board [New scope]
Role: Recruiter, hiring manager (scoped), admin. Purpose: see and move candidates across stages visually. Primary action: move a candidate's stage (drag-and-drop, with an accessible keyboard alternative — a "Move to..." menu on each card). Secondary: bulk-select within a column, filter by job. Required data: assignments grouped by stage for the selected job(s). Permission: hiring manager sees shortlist/reject actions only, not free stage movement. States: loading, empty (no candidates for this job yet), a column with zero cards (distinct from the whole board being empty), error, success, and a specific **bulk action affecting zero records** state and **partial bulk-action failure** state per the brief's edge cases.

### `/interviews` and `/interviews/:interviewId` [New scope]
Role: Recruiter (schedule), hiring manager/admin (view), all can see interviews for jobs they have access to. Purpose: schedule and track interviews. Primary action: schedule (from candidate detail, or directly here). Required data: candidate, job, interviewer(s), time, type, outcome. States: loading, empty ("no interviews scheduled"), a **conflict** state (interviewer double-booked) and a **time-zone mismatch** notice (interviewer and candidate in different zones) per the brief's edge cases, error, success.

### `/admin/users`, `/admin/users/invite`, `/admin/roles` [New scope]
Role: Admin only. Purpose: manage who has access and at what level. Primary action: invite user (email + role). Secondary: change an existing user's role. Required data: org user list with roles. Permission: admin-gated; a non-admin who reaches the URL sees the Permission denied state, not a redirect. States: loading, empty (edge case: an org with only the admin themselves), error (invite failure — e.g. duplicate email), success (invite sent confirmation — simulated, since no real email sends, clearly labelled as such in the UI copy, e.g. "Invitation ready — in a live environment this would be emailed to sam@example.com").

Existing routes (`/candidates`, `/jobs` internal, `/companies`, `/team`, `/calendar`, `/reports`, `/settings`) keep their current purpose and are extended per the audit backlog rather than redefined.
