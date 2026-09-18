# Clever Recruit — Information Architecture

Status labels: **[Implemented]** · **[New scope]** · **[Future scope]**. This document is the spec for the Figma IA page (`04 Information Architecture`) and for route work in Phase 13.

## Sitemap overview

**Implementation note (Phase 13):** the paths below originally read `/jobs`,
`/jobs/:jobId`, etc. at the root. That collides with the existing
*authenticated* `/jobs` (internal job management, further down this sitemap)
— React Router can't route one path two different ways depending on auth
state, and the two are genuinely different pages with different data
(published-only vs. all statuses) and different layouts (public shell vs.
AppShell). Implemented under `/careers/*` instead; corrected here so the
doc matches the code rather than silently diverging from it.

```
Public (unauthenticated)                    [New scope, except /login]
├── / (redirects → /careers)                [New scope]
├── /careers                  Jobs directory [New scope]
├── /careers/:jobId           Job detail    [New scope]
├── /careers/:jobId/apply     Application   [New scope]
├── /careers/apply/:applicationId/confirmation [New scope]
├── /careers/status                   Status lookup [New scope]
├── /careers/status/:applicationId    Application status [New scope]
└── /login                    Login         [Implemented]

Authenticated — recruiter & hiring manager
├── /dashboard                              [Implemented, role-aware content — New scope]
├── /jobs (internal)                        [Implemented, extended: draft/preview/publish — New scope]
├── /jobs/:jobId (internal)                 [Implemented, extended]
├── /jobs/:jobId/edit                       [Implemented as modal — New scope: dedicated route]
├── /jobs/new                               [Implemented as modal — New scope: draft→preview→publish route]
├── /candidates                             [Implemented]
├── /candidates/:candidateId                [Implemented as drawer — kept as drawer, addressable via query param, already the case: ?candidate=]
├── /pipeline                 Pipeline board [Implemented]
├── /pipeline/:jobId          Pipeline for one job [Implemented]
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

### `/careers` — Public jobs directory [Implemented]
Role: Candidate (unauthenticated). Purpose: discover open roles. Entry: portfolio link, direct share, search engine (illustrative). Primary action: open a job. Secondary: filter by type, search by keyword/company/location. Required data: `status = 'open'` jobs only, never draft/paused/closed. Permission: none. Loading: skeleton cards. Empty: "No open roles right now" with a note to check back — distinct from a no-results-for-this-search state, which offers "clear filters" instead. Success: list renders. Exit: job detail, or leave.

### `/careers/:jobId` — Public job detail [Implemented]
Role: Candidate. Purpose: understand the role and decide to apply. Entry: from directory, or direct link. Primary action: Apply. Secondary: back to directory, check status. Required data: one job; a closed/paused job shows a clear "this role is no longer accepting applications" state rather than a 404. Permission: none. States: loading skeleton, not-found (distinct from closed/paused), success. Exit: application form, or back.

### `/careers/:jobId/apply` — Application form [Implemented]
Role: Candidate. Purpose: submit an application. Entry: from job detail only — the route requires `:jobId`, so there's no context-less empty form to land on directly. Primary action: Submit application. Required data: name, email, phone (optional), CV/résumé upload, optional cover note. Permission: none. States: field-level validation (invalid email/phone, missing name/CV, unsupported file type, file over 5MB), duplicate-application detection by email match on this job (shown as an inline "you've already applied" notice with a link to status — not a silent second record), submit-in-progress (disabled fields + loading button), success → redirect to confirmation. Exit: confirmation page. **Not implemented:** real network failure/retry (there's no backend to fail against in this client-only demo — see product-definition.md) and the unsaved-changes-on-cancel confirmation.

### `/careers/apply/:applicationId/confirmation` [Implemented]
Role: Candidate. Purpose: confirm the application was received and set expectation for next steps. Primary action: copy the application reference (id) needed for a later status check. Secondary: browse more jobs, or jump straight to status lookup. Required data: application id, job title, applicant first name, submitted timestamp. Permission: reachable via a valid id only — a stale/invalid id shows a distinct "couldn't find that application" state, not another candidate's data (no email check on this page specifically, matching the original spec — it discloses only what the candidate themselves just submitted). Exit: status page or directory.

### `/careers/status` and `/careers/status/:applicationId` — Status lookup [Implemented]
Role: Candidate. Purpose: check where an application stands without an account. Primary action: look up by email + application reference (both required even when the reference arrives pre-filled from a confirmation-page link). States: not-found (wrong reference/email combination — one generic message, doesn't distinguish which field was wrong, for basic privacy hygiene), loading, success (plain-language status via a dedicated label map — e.g. "In review" / "Interview stage" / "Not moving forward" / "Offer extended" — never the raw internal pipeline key). Exit: directory, or close.

### `/dashboard` [Implemented, role-aware content New scope]
Role: Recruiter, hiring manager, admin. Purpose: orient — what needs attention now. Primary action varies by role (recruiter: review new applicants; hiring manager: review candidates awaiting their feedback). Required data: role-scoped counts and recent activity. States: loading skeleton (existing pattern extended), empty (a brand-new org/recruiter with zero jobs — currently not handled, since mock data always has jobs — this is a real empty state to design and build), error (data fetch failure), success.

### `/pipeline` and `/pipeline/:jobId` — Pipeline board [Implemented]
Role: Recruiter, hiring manager, admin. Purpose: see and move candidates across stages visually. Primary action: move a candidate's stage — a keyboard-operable "Move to..." menu on each card (recruiter/admin only), with native HTML5 drag-and-drop layered on as a progressive enhancement, same permission gate. Secondary: bulk-select within a column plus a sticky bulk-action toolbar ("Move to..." for recruiter/admin, "Reject" for anyone with review rights), filter by job via a `Select` that navigates between `/pipeline` and `/pipeline/:jobId`. Required data: candidates grouped by stage, scoped to a job by matching `Candidate.jobTitle` against `Job.title` (case-insensitive) — the same linkage `Jobs/index.tsx`'s candidate counts already use, since `Assignment` is declared in the types but never populated in the mock data; there is no real foreign key to reuse instead. Permission: hiring manager sees shortlist/reject actions only, not free stage movement or drag — mirrors `CandidateDetail.tsx`'s existing gating exactly. States: whole-board empty, a column with zero cards (distinct, smaller inline message), an invalid `:jobId` ("Job not found"), success, and the required **bulk action affecting zero records** state (each bulk-move target and the bulk-reject button disable themselves, with a reason, when every selected candidate is already there). **Not implemented:** hiring-manager scoping to "their jobs" — there is no data in this app linking a hiring-manager `User` to specific `Job`s, so every role sees the same full board, exactly as `/candidates` already does; and **partial bulk-action failure** — there is no real backend for a batch update to fail against in this client-only demo, so rather than fabricate a random-failure UI, this is flagged spec-only, matching how the careers flow's network-failure states were handled.

### `/interviews` and `/interviews/:interviewId` [New scope]
Role: Recruiter (schedule), hiring manager/admin (view), all can see interviews for jobs they have access to. Purpose: schedule and track interviews. Primary action: schedule (from candidate detail, or directly here). Required data: candidate, job, interviewer(s), time, type, outcome. States: loading, empty ("no interviews scheduled"), a **conflict** state (interviewer double-booked) and a **time-zone mismatch** notice (interviewer and candidate in different zones) per the brief's edge cases, error, success.

### `/admin/users`, `/admin/users/invite`, `/admin/roles` [New scope]
Role: Admin only. Purpose: manage who has access and at what level. Primary action: invite user (email + role). Secondary: change an existing user's role. Required data: org user list with roles. Permission: admin-gated; a non-admin who reaches the URL sees the Permission denied state, not a redirect. States: loading, empty (edge case: an org with only the admin themselves), error (invite failure — e.g. duplicate email), success (invite sent confirmation — simulated, since no real email sends, clearly labelled as such in the UI copy, e.g. "Invitation ready — in a live environment this would be emailed to sam@example.com").

Existing routes (`/candidates`, `/jobs` internal, `/companies`, `/team`, `/calendar`, `/reports`, `/settings`) keep their current purpose and are extended per the audit backlog rather than redefined.
