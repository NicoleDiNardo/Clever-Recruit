# Clever Recruit — Product Definition

Status label key used throughout this document:
**[Implemented]** exists in the deployed app today · **[New scope — approved]** confirmed with Nicole to be built as part of this engagement · **[Assumption]** a judgement call made to keep the product coherent, stated so it can be challenged · **[Future scope]** deliberately out of scope for now.

## Product vision

Clever Recruit is a recruitment and applicant-tracking product that lets a small in-house talent team run the full hiring lifecycle — publish a role, receive and review applications, move candidates through a pipeline, collaborate with the hiring manager who owns the role, schedule interviews, and keep candidates informed — in one coherent tool, without needing a separate careers-page builder or spreadsheet-based pipeline tracking.

## Target users

1. **Recruiter** [Implemented, partial] — owns jobs and the candidate pipeline day to day.
2. **Hiring manager** [New scope — approved] — reviews and decides on candidates for their own open roles; does not manage jobs, pipeline stages generally, or other recruiters' roles.
3. **Candidate** [New scope — approved] — an external, unauthenticated (or lightly authenticated via a status-lookup token/email) user who discovers, applies to, and tracks a single application.
4. **Administrator** [New scope — approved, reduced] — manages users, invites, and role assignment. Full organisation-settings and audit-log surfaces are scoped as **[Future scope]** (see MVP scope below) — the highest-value admin behaviour is user/role management, and building a full audit-log system for a portfolio demo with no real security boundary to audit would be scope without payoff.

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

**Recruiter** [Implemented, extending]
- Job creation, editing, draft → preview → publish, close [publish/preview flow is New scope — approved; CRUD is Implemented]
- Candidate list: search, filter, sort, paginate [Implemented]
- Candidate pipeline board view with stage changes [New scope — approved]
- Candidate detail: profile, notes, tasks, assignments [Implemented]
- Interview scheduling from a candidate's profile [New scope — approved]
- Bulk candidate actions (multi-select stage change / reject) [New scope — approved]

**Hiring manager** [New scope — approved]
- View candidates for jobs they're assigned to
- Shortlist / reject with a reason
- Leave structured feedback visible to the recruiter
- See interview schedule for their roles

**Candidate** [New scope — approved]
- Browse public job listings, view job detail
- Apply with a form + CV/file upload
- Receive an application confirmation
- Check application status via a status page

**Administrator** [New scope — approved, reduced]
- View organisation users and their roles
- Invite a new user by email with an assigned role
- View/change an existing user's role
- Read-only roles & permissions reference (not a second place to change a role)
- Minimal organisation settings: name and logo

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
