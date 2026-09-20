# Clever Recruit — Product Definition

Status label key used throughout this document:
**[Implemented]** exists in the deployed app today · **[New scope — approved]** confirmed with Nicole to be built as part of this engagement · **[Assumption]** a judgement call made to keep the product coherent, stated so it can be challenged · **[Future scope]** deliberately out of scope for now.

## Product vision

Clever Recruit is a recruitment and applicant-tracking product that lets a small in-house talent team run the full hiring lifecycle — publish a role, receive and review applications, move candidates through a pipeline, collaborate with the hiring manager who owns the role, schedule interviews, and keep candidates informed — in one coherent tool, without needing a separate careers-page builder or spreadsheet-based pipeline tracking.

## Target users

1. **Recruiter** [Implemented] — owns jobs and the candidate pipeline day to day.
2. **Hiring manager** [Implemented] — reviews and decides on candidates; not scoped to "their own open roles" specifically — see the Pipeline board note below, this app has no data linking a hiring manager to particular jobs, so every hiring manager sees the same full board. Does not manage jobs, pipeline stages generally, or other recruiters' roles — that part is real, enforced by `usePermissions.ts`.
3. **Candidate** [Implemented] — an external, unauthenticated user who discovers, applies to, and tracks a single application via email + application reference (not a full account with a password, per the assumption below).
4. **Administrator** [Implemented] — manages users, invites, role assignment, and (added since) a read-only roles reference and minimal organisation settings. Full organisation-settings and audit-log surfaces stay **[Future scope]** (see MVP scope below) — building a full audit-log system for a portfolio demo with no real security boundary to audit would be scope without payoff.

## Jobs to be done

- *When I have a new role to fill, I want to publish it somewhere candidates can find it, so I can start receiving applications without a separate careers page.*
- *When candidates apply, I want to see them all in one place, ranked/filtered by what matters, so I don't lose track of anyone.*
- *When I need a second opinion on a candidate, I want the hiring manager to review and leave feedback inside the same tool, so we're not doing it over email.*
- *When I move a candidate forward, I want to schedule the interview and have the candidate notified, without switching tools.*
- *As a candidate, when I apply, I want to know it worked and be able to check where I stand, so I'm not left wondering.*
- *As an admin, when someone joins the team, I want to invite them with the right role in under a minute.*

## User problems (what's wrong today)

- Recruiters lose visual read of pipeline health — stage changes are one dropdown per candidate, not a board (see audit AUD-P1-01).
- There's no candidate-side experience at all, so "applicant tracking" only covers the second half of the process (AUD-P0-02).
- Nothing distinguishes what a hiring manager or admin can do from what a recruiter can do (AUD-P0-01).
- Interviews aren't a real entity, so scheduling one leaves no trace anywhere a candidate or hiring manager would see it (AUD-P1-02).

## Product principles

1. **Real states over happy paths.** Every screen ships with loading, empty, error, and (where relevant) permission-denied states — not just the populated default.
2. **One system, not two.** Design tokens and components are shared between recruiter-facing and candidate-facing surfaces; a candidate should never land on a page that looks like a different product.
3. **Permission is a design problem, not just a database column.** If a role can't do something, the UI says so clearly rather than hiding the control or failing silently.
4. **Honest data, honest claims.** No invented metrics, client names, or outcomes — proposed success metrics are labelled as proposed, not measured.
5. **Preserve what works.** Existing recruiter-side patterns (stage colour system, candidate drawer, filter/sort/paginate table) are the foundation the rest of the product extends, not a first draft to discard.

## In-scope features

**Doc correction**: every bullet below was still marked `[New scope — approved]` well after it shipped — the tree in `clever-recruit-information-architecture.md` already listed `/pipeline`, `/interviews` and the whole admin block as `[Implemented]`, this file was just never brought in line. Corrected here, item by item, rather than left to understate what's actually live.

**Recruiter** [Implemented]
- Job creation, editing, draft → preview → publish, close [Implemented]
- Candidate list: search, filter, sort, paginate [Implemented]
- Candidate pipeline board view with stage changes [Implemented] — drag-and-drop plus a keyboard-operable "Move to…" menu, `pages/Pipeline/index.tsx`
- Candidate detail: profile, notes, tasks, assignments [Implemented]
- Interview scheduling from a candidate's profile [Implemented] — `ScheduleInterviewModal`, shared by the candidate profile, `/interviews` and Calendar
- Bulk candidate actions (multi-select stage change / reject) [Implemented] — including the "affecting zero records" disabled state

**Hiring manager** [Implemented]
- View candidates for jobs they're assigned to [Implemented, not scoped] — sees the same full board/list as everyone else; there's no data model linking a hiring manager to specific jobs, so "their own roles" isn't real yet, only the permission boundary (no create/edit/free-stage-move rights) is
- Shortlist / reject [Implemented] — **not** "with a reason": `onReject` in `CandidateDetail.tsx` takes no reason argument, this bullet overclaimed
- Leave structured feedback visible to the recruiter [Implemented] — the Feedback tab on candidate detail
- See interview schedule for their roles [Implemented, not scoped] — same caveat as above: read-only access to the same interview list everyone sees, not filtered to "their" roles

**Candidate** [Implemented]
- Browse public job listings, view job detail [Implemented] — `/careers`, `/careers/:jobId`
- Apply with a form + CV/file upload [Implemented] — `/careers/:jobId/apply`
- Receive an application confirmation [Implemented] — `/careers/apply/:applicationId/confirmation`
- Check application status via a status page [Implemented] — `/careers/status`, email + reference lookup

**Administrator** [Implemented]
- View organisation users and their roles [Implemented]
- Invite a new user by email with an assigned role [Implemented] — simulated invite, no real email sent (no backend to send from)
- View/change an existing user's role [Implemented] — includes the sole-remaining-admin guard
- Read-only roles & permissions reference (not a second place to change a role) [Implemented] — `/admin/roles`
- Minimal organisation settings: name and logo [Implemented] — `/admin/organisation`

## Out-of-scope features

- Payment/billing, since this is a demo product with no organisation-tier concept.
- Full audit-log / system-activity history — **[Future scope]**, noted in the case study as a natural next step rather than built now.
- Real email delivery (invitations, confirmations, status changes) — simulated in-product (toast/confirmation UI) rather than actually sent, since there is no backend deployed to send from. **[Assumption]**
- Real authentication/session security for the candidate-facing status lookup — a lightweight, clearly-labelled demo mechanism (e.g. email + application reference) rather than a production-grade auth system. **[Assumption]**
- Native mobile apps — responsive web only, per the brief.
- Real payroll/HRIS integrations, background-check integrations, calendar-provider sync (Google/Outlook) — plausible future integrations, not built.

## Assumptions

- The deployed backend (Express/Prisma/Postgres) stays undeployed; new entities (`Interview`, `Application`) are added to the Prisma schema for data-model completeness and portfolio credibility, but the live app continues to run on an extended mock-data layer, exactly like today. **[Assumption — flagged for Nicole to confirm before implementation if this should change.]**
- "Organisation" is a single implicit org (no multi-tenant switching) — matches the existing product, which has no org-switcher anywhere.
- Candidate accounts are not full user accounts with passwords; status lookup uses application reference + email, consistent with most real-world ATS candidate portals and avoiding a second, unnecessary auth system.

## Risks

- Scope risk: candidate + hiring-manager + admin surfaces roughly double the screen count of the existing app. Sequenced delivery (this document → IA/flows → Figma → highest-priority code) mitigates this by allowing a checkpoint before the largest effort (Figma + implementation).
- Consistency risk: extending an existing, already-opinionated design (Mantine v7 defaults, existing stage-colour system) with new candidate-facing screens risks a visual seam between "old" and "new" parts of the product if the design system work in Figma doesn't explicitly unify them.
- Credibility risk: because the backend isn't deployed, every new "role-gated" or "persisted" behaviour must be honestly labelled as demo-state (e.g., React state / localStorage) versus real persistence, or the case study would misrepresent what was actually built.

## Proposed success metrics

*(Proposed only — nothing below is a measured outcome. These are the kind of metrics this product would be validated against if it had real users and analytics, included to show product thinking, not as claimed results.)*

- Recruiter: median time from "job created" to "first candidate reviewed."
- Recruiter: % of candidates with a stage set within 48 hours of applying (pipeline hygiene).
- Candidate: application completion rate (started vs. submitted).
- Candidate: % of applicants who check their status page at least once (signal that the status page is discoverable and trusted).
- Hiring manager: median time from "candidate shared" to "feedback left."
- Admin: time to invite and correctly role a new team member.

## MVP scope (this engagement)

Recruiter pipeline board + interview scheduling + bulk actions; candidate browse → apply → confirm → status flow; hiring-manager review/shortlist/reject/feedback; admin user list + invite + role display/change. All with full state coverage (loading/empty/error/permission) and a matching Figma design system.

## Future scope

Full audit-log/activity history, real email delivery, calendar-provider sync, background-check/e-signature integrations, multi-organisation support, candidate self-service profile editing beyond a single application, saved candidate searches, and AI-assisted resume screening (deliberately excluded now — it's a meaningfully different, higher-risk product surface that deserves its own scoping rather than being bolted on).
