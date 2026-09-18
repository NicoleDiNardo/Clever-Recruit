# Clever Recruit — Product & Repository Audit

Date: 2026-09-19
Author: Claude, on behalf of Nicole Di Nardo
Scope of inspection: `NicoleDiNardo/Clever-Recruit` (branches `main`, `audit-fixes` — identical, no divergence), local working copy, deployed Vercel app at `https://clever-recruit-client.vercel.app`.

This audit inspects what exists today. It does not assume the product is unfinished or low quality — a real prior audit-and-fix pass is already visible in the git history, and that work is preserved and built on, not redone.

---

## 1. Executive summary

Clever Recruit is a client-only, demo-data React application that presents itself as an applicant-tracking system (ATS) for a single user type — an internal recruiter. It is deployed to Vercel as a static SPA (`VITE_DEMO_MODE=true`, mock data only) and is built to also run embedded in an iframe on Nicole's portfolio site (`useEmbedMode`).

A real backend exists in the repository (Express 5, Prisma, PostgreSQL, JWT, Zod) but **is not what is deployed** — `vercel.json` only builds `client/`. The backend should be described in the case study as "designed and implemented, not deployed," not as a live system.

The recruiter-facing surface is genuinely solid: nine working routes, a filterable/sortable/paginated candidates table with a keyboard-navigable detail drawer, working create/edit/delete flows for jobs and candidates, notes and tasks on a candidate, and a prior fix pass that specifically addressed contrast, empty states, a pagination trap, a dead-end blank-page route, and inconsistent stage colours (documented in code comments — see `statusColors.ts`). This is above the bar for a portfolio demo and should be preserved.

What does not exist yet: any candidate-facing surface (no public jobs board, job detail, application form, CV upload, or status tracker), a distinct hiring-manager role or workflow, an admin/permissions/user-management area, a dedicated interview-scheduling entity, in-app messaging, and a Kanban-style pipeline view (stage changes today happen one-at-a-time via a dropdown in the candidate drawer, not drag-and-drop). There is also no test suite, no CI, no lint config, and no `/docs` folder prior to this audit. The `Mockups`/`Wireframe`/`Style Guide` PNGs in the repo root are static images, not a live Figma file.

## 2. Existing product scope

A single-role internal recruiter tool covering: dashboard KPIs, candidate management, job management, company directory, team roster, calendar, reports, and settings. Login exists but is demo-only (hardcoded credential, bypassed entirely in embed mode).

## 3. Existing routes and screens

| Route | Screen | Notes |
|---|---|---|
| `/login` | Login | Demo credential only; skipped in embed mode |
| `/dashboard` | Dashboard | KPI cards, pipeline chart, recent activity |
| `/candidates` | Candidates list + detail drawer | Search, filters (status/stage/role/own-only), sort, pagination, create/edit/delete, Notes & Tasks tabs |
| `/jobs` | Jobs list + detail panel | Filter, create/edit, open→closed status change, delete |
| `/companies` | Companies directory | Company cards with open-role counts |
| `/team` | Team roster | Member cards, workload/performance stats |
| `/calendar` | Calendar | Generic calendar, not interview-specific |
| `/reports` | Reports | Funnel and metric visualisations |
| `/settings` | Settings | Profile, notification prefs, a read-only "Role" field |
| `*` | NotFound | Added in a prior fix — previously unmatched routes rendered a blank page with no shell |

No public (unauthenticated) routes exist beyond `/login`.

## 4. Existing user roles

The data model (`User.role`, default `"recruiter"`) and seed/mock data include `recruiter` and `admin` as string values, but **no UI branches on role**. Every authenticated user sees every route and every action, regardless of the `role` field. There is no hiring-manager role and no candidate account concept at all — candidates aren't modelled as users, only as records recruiters manage.

## 5. Existing strengths

- **Consistent stage colour system.** `statusColors.ts` is a single source of truth with a code comment explaining exactly what it replaced: three disagreeing colour maps (Dashboard/Candidates/Reports) where "hired" was green in two places and red — the app's rejection colour — in a third, and 69% of seeded stage values had no colour at all.
- **A real fix pass already happened.** Commits like `Fix Clever Recruit's blank-page route, pagination trap and shuffling job counts`, `Fix sidebar covering page content on desktop widths`, `Give every page an h1`, and `Fix Jobs table overflow, logo fallbacks, and inverted metric colours on Reports` show deliberate, documented problem-solving, not just feature accretion.
- **Candidate drawer accessibility basics are in place**: `aria-label`s on icon-only prev/next/close/edit/delete controls, `aria-current="page"` on active nav items, keyboard prev/next through the filtered candidate list.
- **Sensible embed architecture.** `useEmbedMode` cleanly separates "standalone app" from "portfolio iframe" behaviour (skips login, adjusts layout) rather than branching ad hoc through the app.
- **Typed data model** with Prisma schema and matching TypeScript interfaces kept in sync (`User`, `Candidate`, `Company`, `Job`, `Assignment`, `Note`, `Task`).

## 6. Critical problems (see backlog for full detail)

- No role-based access control anywhere in the UI — every user can see and do everything, which is both a functional gap and, if this were ever connected to the real backend, a security problem (AUD-P0-01).
- No candidate-facing product at all — for a tool whose brief is "recruitment and applicant-tracking," there is no way for a candidate to apply (AUD-P0-02).
- Pipeline stage changes are single-record, dropdown-driven, with no bulk action and no visual pipeline/Kanban (AUD-P1-01).
- Interview scheduling has no dedicated data model or UI — `Calendar` is a generic calendar page, not tied to `Assignment`/candidate/job (AUD-P1-02).

## 7. Missing workflows

Against the brief's required workflows, these do not exist in any form today: job publishing/preview (jobs only toggle open/closed, no draft or preview state), candidate discovery/application, CV upload, application confirmation, candidate status tracking, hiring-manager review/shortlist/reject/feedback, structured interview scheduling, candidate communication, and admin invite/role/permission management.

## 8. Accessibility findings

| ID | Priority | Location | Finding |
|---|---|---|---|
| A11Y-01 | P1 | Candidates table | Sortable column headers are clickable but not exposed as buttons with `aria-sort`; screen-reader users can't tell a column is sortable or which direction is active. |
| A11Y-02 | P1 | Drawers/Modals (candidate detail, create/edit forms) | No confirmation that focus moves into the drawer/modal on open and returns to the trigger on close — Mantine handles this by default, but it hasn't been verified against this app's custom drawer usage; needs a manual keyboard pass. |
| A11Y-03 | P2 | Login | Demo-credential autofill button has no confirmation it's reachable by keyboard alone. |
| A11Y-04 | P2 | Global | No visible skip-to-content link for keyboard users navigating past the sidebar on every page load. |
| A11Y-05 | P2 | Notifications bell / popover | Unread-count `Indicator` needs a text alternative (e.g. `aria-label="3 unread notifications"`), not just a coloured dot. |
| A11Y-06 | P3 | Global | No `prefers-reduced-motion` handling verified for Mantine's default transitions (drawer slide, modal fade). |

This is a targeted list based on static inspection, not a full WCAG 2.1 AA pass — Phase 15 (QA) should run an actual keyboard-only and screen-reader pass against the live deployment before these are closed out.

## 9. Responsive findings

`AppLayout`/`Sidebar` already went through at least one responsive fix (`Fix sidebar covering page content on desktop widths`, `Fix Clever Recruit mobile embed with compact candidate cards`). Not yet verified at the brief's specific breakpoints (360/390/768/1024/1280/1440) in this pass — flagged as a QA task (Phase 15) rather than asserted here, since claiming a responsive audit without actually loading the deployed app at each width would be exactly the kind of unverified claim this project must avoid.

## 10. Technical findings

| ID | Priority | Area | Finding |
|---|---|---|---|
| TECH-01 | P1 | Quality gates | No ESLint config, no test runner (Vitest/Jest/Playwright), no CI workflow. Type errors can currently ship silently — a prior commit (`Name Clever Recruit's icon controls and fix the type errors vite never showed`) documents exactly this: `vite build` does not typecheck by default. |
| TECH-02 | P1 | Deployment honesty | The deployed app never talks to the Express/Prisma backend. This must be described accurately in the case study and README — "full-stack architecture designed and implemented; production demo runs on mock data" — not implied to be a live full-stack deployment. |
| TECH-03 | P2 | Data model | No `Interview`, `Application`, or `Permission`/`Role`-as-relation model — `role` is a free string on `User`, not an enum or a permissions table, so there's nothing to enforce against. |
| TECH-04 | P2 | State | Candidates state lives in `CandidatesContext`; Jobs state is local `useState` in the page component (`setJobs` inline in `Jobs/index.tsx`). Inconsistent — worth unifying before adding more entities (interviews, applications) on top. |
| TECH-05 | P3 | Repo hygiene | Root-level PNGs (`Clever Recruit Cover.png`, `Style Guide.png`, `Mockups Desktop/Mobile`, `Wireframe Desktop/Mobile`) are static exports, not a live design source — once a Figma file exists, these should be replaced by a link to it, not deleted outright (they're evidence of prior design thinking). |

## 11. Case-study findings

| Question | Status |
|---|---|
| Does it explain the problem? | No — no case-study document exists yet. |
| Are users and constraints clear? | No — no product-definition document exists yet. |
| Are design decisions demonstrated? | Partially, in commit messages only (e.g. the `statusColors.ts` comment) — not surfaced anywhere a portfolio visitor would see it. |
| Are flows and IA visible? | No. |
| Are wireframes shown? | Static PNGs exist in the repo but aren't linked from anywhere visitor-facing, and aren't a live/editable Figma source. |
| Is the design system shown? | No live Figma design system exists. |
| Are accessibility and edge cases shown? | No. |
| Is implementation shown? | Yes — the deployed app itself. |
| Are outcomes evidence-based? | N/A — no outcomes/metrics are claimed anywhere, which is correct; none should be invented. |
| What's missing? | Everything in Phases 2–17 of this engagement: product definition, IA, flows, edge cases, Figma file, case-study write-up, portfolio screenshots. |

## 12. Prioritised backlog

Priority key: **P0** blocks core use / accessibility / security / data-loss risk · **P1** major usability or product-flow problem · **P2** important, non-blocking improvement · **P3** polish/optimisation/future.

---

**AUD-P0-01 — No role-based access control in the UI**
- Area: Product / Security
- Location: Global (`ProtectedRoute` in `App.tsx`; no role check anywhere)
- Problem: Any authenticated user reaches every route and action regardless of `User.role`. A hiring manager account (once it exists) would be able to edit jobs, delete candidates, and access admin settings.
- Why it matters: The brief requires distinct recruiter/hiring-manager/admin permission boundaries; without this, "roles" are cosmetic labels, not a real product model, and the case study can't honestly claim permission-aware design.
- Recommended fix: Introduce a `role` enum, a `usePermissions`/`can()` helper, and route- and action-level guards; render permission-denied states rather than hiding controls silently.
- Acceptance criteria: A hiring-manager test account cannot reach `/settings` → Team management or delete a job; a recruiter cannot reach an admin-only screen; each denial shows a real "permission denied" state, not a blank page or silent no-op.

**AUD-P0-02 — No candidate-facing product surface exists**
- Area: Product / IA
- Location: Global — no public routes beyond `/login`
- Problem: The product's stated category is "recruitment and applicant-tracking," but there is no way for a candidate to discover a job, view it, or apply.
- Why it matters: This is the single largest gap between the current app and the brief, and the most portfolio-visible one — a recruitment product with no candidate journey is only half the story.
- Recommended fix: Build a public jobs directory, job detail, application form with CV upload, confirmation, and a status-lookup page (scope confirmed with Nicole as new, in-scope work).
- Acceptance criteria: An unauthenticated visitor can browse open jobs, view one, submit an application with a file, see a confirmation, and check status later — end to end, with real validation and error states.

**AUD-P1-01 — No visual pipeline / bulk candidate actions**
- Area: Interaction design
- Location: `Candidates/CandidateDetail.tsx` (single `Select` for stage), `Candidates/index.tsx` (no bulk selection)
- Problem: Moving a candidate through stages is one dropdown, one candidate, one save, at a time. There's no board view and no way to act on multiple candidates at once.
- Why it matters: "Candidate pipeline management" is a named requirement and a core recruiter workflow; a table with a dropdown does not communicate pipeline health at a glance the way a board does.
- Recommended fix: Add a pipeline/board view (grouped by stage) with drag-and-drop or an accessible keyboard-operable move action, plus row-selection + bulk stage/reject actions on the table view.
- Acceptance criteria: A recruiter can see all candidates for a job grouped by stage in one view, move a candidate between stages via mouse or keyboard, and apply a status change to a multi-selected set of candidates with a single confirmation.

**AUD-P1-02 — No interview-scheduling data model or flow**
- Area: Product / Data model
- Location: `server/prisma/schema.prisma` (no `Interview` model), `Calendar/index.tsx` (generic, unconnected)
- Problem: There's a Calendar page, but nothing on it is tied to a candidate, job, or assignment — it can't represent "interview with Sarah Connor for Senior Developer, Tuesday 2pm."
- Why it matters: Interview scheduling is a named required workflow and a natural connective flow between recruiter and hiring-manager collaboration.
- Recommended fix: Add an `Interview` entity (candidate, job, interviewer(s), time, type, outcome) and a scheduling flow reachable from the candidate detail view, surfaced on Calendar.
- Acceptance criteria: A recruiter can schedule an interview from a candidate's profile, it appears on Calendar, and a time-zone/conflict check is applied.

**AUD-P1-03 — Job status has no draft/preview state**
- Area: Product
- Location: `Jobs/index.tsx` (`status: 'open' | 'closed'` only)
- Problem: There's no way to create a job, preview it as a candidate would see it, and then publish — it's live (open) the moment it's saved.
- Why it matters: "Job creation and publishing" as a named requirement implies a preview-then-publish moment; going straight to live risks publishing an unfinished listing.
- Recommended fix: Add a `draft` status and a preview step before `open`.
- Acceptance criteria: A new job defaults to draft, is only visible on the (new) public jobs board once published, and can be previewed in the candidate-facing layout before publishing.

**AUD-P1-04 — No admin/user-management surface**
- Area: Product / IA
- Location: `Settings/index.tsx` (profile-only), `Team/index.tsx` (read-only roster)
- Problem: `Settings` shows a read-only "Role" field; there's no way to invite a user, change anyone's role, or view organisation-level settings.
- Why it matters: Administrator is a named primary user role in the brief; without this, "admin" is a data value with no product behind it.
- Recommended fix: Build a Users/Invite/Permissions area gated behind the new role-guard work (AUD-P0-01).
- Acceptance criteria: An admin account can view all org users, invite a new one by email with an assigned role, and change an existing user's role; a non-admin cannot reach this area.

**AUD-P2-01 — Sortable table headers lack `aria-sort` / button semantics**
- Area: Accessibility
- Location: `Candidates/index.tsx` table headers
- Problem: See A11Y-01.
- Why it matters: Screen-reader users lose sort state and affordance entirely.
- Recommended fix: Make headers real `<button>`s with `aria-sort="ascending"|"descending"|"none"`.
- Acceptance criteria: VoiceOver/NVDA announces "Name, sortable column, sorted ascending" or equivalent.

**AUD-P2-02 — Inconsistent client state pattern (Context vs local `useState`)**
- Area: Technical
- Location: `CandidatesContext.tsx` vs `Jobs/index.tsx`
- Problem: See TECH-04.
- Why it matters: Adding `Interview`/`Application` entities on an inconsistent foundation compounds the inconsistency.
- Recommended fix: Standardise on context (or TanStack Query, already a dependency but apparently unused against the mock data layer) before adding new entities.
- Acceptance criteria: Jobs and Candidates read/write through the same state pattern; new entities (Interviews, Applications) follow it from the start.

**AUD-P2-03 — No quality gates (lint, typecheck-on-build, tests, CI)**
- Area: Technical
- Location: Repo root, `client/package.json`
- Problem: See TECH-01.
- Why it matters: Type errors and regressions can ship to the deployed demo silently, as already happened once (icon `stroke` typing).
- Recommended fix: Add ESLint (Mantine/React config), a `tsc --noEmit` step in `build`, and a minimal CI workflow that runs both on push.
- Acceptance criteria: `npm run build` fails on a type error; a GitHub Actions workflow runs lint + typecheck on every push/PR.

**AUD-P3-01 — Static design PNGs not linked to a live design source**
- Area: Case study
- Location: Repo root
- Problem: See TECH-05.
- Why it matters: A portfolio case study needs a live, explorable Figma file, not flattened exports.
- Recommended fix: Once the Figma file exists, link it from the README and case study; keep the PNGs as a dated "earlier exploration" reference rather than deleting them.
- Acceptance criteria: README links the live Figma file; PNGs are relocated to an `Archive` or `earlier-explorations` folder with a one-line note on what they were.

**AUD-P3-02 — `prefers-reduced-motion` not verified**
- Area: Accessibility
- Location: Global (Mantine transitions)
- Problem: See A11Y-06.
- Recommended fix: Verify Mantine's motion respects the OS setting; add an explicit override if it doesn't.
- Acceptance criteria: With reduced motion enabled at the OS level, drawer/modal transitions are instant or minimal.
