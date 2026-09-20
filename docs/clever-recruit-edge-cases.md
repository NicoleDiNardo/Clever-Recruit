# Clever Recruit — Edge Cases & Product States

Every item below is either handled today, or specified here for Figma (Phase 6–11) and implementation (Phase 13) to pick up. Status: **[Handled]** already works in the app · **[Spec]** designed here, not yet built · **[Partially handled]** exists but incompletely.

| Edge case | Status | Where it applies | Behaviour |
|---|---|---|---|
| No jobs exist | [Spec] | `/jobs` (public + internal) | Empty state: "No open roles yet" (public) / "Create your first job" with a primary CTA (internal) — never an empty table with no explanation. |
| No candidates exist | [Partially handled] | `/candidates`, `/pipeline` | Candidates list has an `EmptyState` component already (`components/EmptyState.tsx`); pipeline board needs the same treatment per column. |
| No search results | [Handled] | Candidates search/filter | Distinct from the true-empty state — existing pattern to extend to Jobs directory and Pipeline filters. |
| Candidate applies twice | [Spec] | Application form | Detected by email + job match; shown as "You've already applied" with a link to check status, not a silent duplicate record. |
| Candidate withdraws an application | [Spec] | Status page | See user flow 20 — confirmation required, reflected on both sides. |
| Job closes during application | [Spec] | Application form, mid-fill | If the job closes between page load and submit, submission is blocked with a clear message and the candidate's entered data isn't lost (offered a way to save/copy it, since there's nowhere to persist a closed-job application) — **[Assumption: this is rare enough to handle with a clear message rather than a save-draft mechanism]**. |
| Required field missing | [Handled pattern exists, extend] | All forms | Inline, field-level error on blur/submit; submit blocked until resolved; matches existing Mantine form validation pattern already used in Candidates/Jobs create forms. |
| Invalid email | [Spec, pattern exists] | Application form, invite form | Inline format validation, specific message ("Enter a valid email address"), not a generic "invalid input." |
| Invalid phone number | [Spec] | Application form | Format validation, allows international formats (existing candidate data already includes `+44 (452) 886 09 12` style numbers), so validation must not be overly strict. |
| Duplicate candidate | [Spec] | Application form, recruiter-created candidate | Same detection as "applies twice" for the public form; internal candidate creation checks email uniqueness (already a `@unique` constraint in Prisma) and surfaces a clear "a candidate with this email already exists" error rather than a raw constraint-violation message. |
| Candidate has no CV | [Spec] | Application form | See user flow 7 — CV required by default; a job-level "CV optional" toggle is Future scope. |
| Unsupported file type | [Spec] | CV upload | Specific message naming accepted types (PDF/DOC/DOCX), file rejected before upload attempt. |
| File too large | [Spec] | CV upload | Specific message stating the actual limit (e.g. "Max 5MB — your file is 8MB"). |
| Upload failure | [Spec] | CV upload | Retry without losing other form fields; distinct from "wrong file type/size." |
| Save failure | [Handled pattern exists, extend] | Any form | Existing Mantine `notifications` package used for toasts; extend to always preserve entered data on failure. |
| Network timeout | [Spec] | Any mutating action | See user flow 23 — the cross-cutting error pattern. |
| Session expiry | [Spec] | Any authenticated route | Redirect to `/login` with a "your session expired, please sign in again" message, and (where feasible) return to the originally intended route after re-auth — currently the app always lands on `/dashboard`, which is a minor but real gap (see IA doc, Exit points). |
| Insufficient permissions | [Spec] | Any role-gated route/action | Dedicated Permission-denied state (see IA doc) — never a blank page, unstyled 403 text, or silent redirect with no explanation. |
| Archived candidate | [Spec] | Candidates list, pipeline | A candidate with a closed-out assignment (hired/rejected/withdrawn on all their assignments) is visually de-emphasised and filterable separately, not deleted — preserves history. |
| Accidental rejection | [Spec] | Reject action | See user flow 14 — confirmation dialog + short undo window, specifically to prevent this. |
| Bulk action affects zero records | [Spec] | Bulk actions (flow 19) | Action control is disabled (not just a no-op on click) when selection is empty, with the reason visible on hover/focus. |
| Partial bulk-action failure | [Spec] | Bulk actions | Explicit "X updated, Y failed" result with retry for the failed subset — never reported as a flat success. |
| Interview conflict | [Spec] | Interview scheduling | Warning shown if an interviewer already has an interview at the chosen time; scheduling can proceed with acknowledgement (default assumption, see flow 15) rather than being hard-blocked. |
| Time-zone mismatch | [Spec] | Interview scheduling | Time shown in both the interviewer's and candidate's local time zones explicitly, not just one, when they differ. |
| Deleted job | [Handled pattern exists, extend] | Any place a job is referenced (candidate assignment, interview) | Existing delete confirmation on Jobs to extend to: referencing candidate/interview records show "role no longer available" rather than breaking or showing blank data. |
| Long names | [Spec] | Everywhere a name renders (tables, cards, headers) | Text truncates with an ellipsis + full name on hover/focus (tooltip), never breaks layout or overflows a container — ties to the existing "Fix Jobs table overflow" fix, extended as a general rule. |
| Long text | [Spec] | Job descriptions, notes, feedback comments | Line-clamped in list/card contexts with a "read more" expansion; full text always available in detail views. |
| Special characters | [Spec] | All free-text fields | No client-side sanitisation that mangles legitimate input (accented names, ampersands, etc.); server-side (if ever deployed) would be responsible for injection safety, not the UI layer. |
| Large candidate list | [Handled pattern exists] | `/candidates` | Existing pagination handles this; pipeline board needs equivalent handling (column virtualisation or per-column pagination) for a job with hundreds of applicants — **[Spec]** for the board specifically. |
| Keyboard-only usage | [Partially handled] | Candidate drawer (prev/next/close have aria-labels and are keyboard-reachable today); needs a full pass across new surfaces (pipeline drag-and-drop needs a keyboard alternative — see flow 12) and the audit's A11Y findings resolved. |
| Screen-reader usage | [Partially handled] | See audit A11Y-01, A11Y-02, A11Y-05 — sortable headers and notification counts need proper semantics; needs a real screen-reader pass in QA (Phase 15), not just static review. |
| Mobile layout | [Handled pattern exists, extend to new surfaces] | Existing responsive sidebar/embed fixes; new surfaces (public jobs board, application form, pipeline board) need mobile design from the start, including the table-to-card and modal-to-drawer transformations specified in the IA/Figma responsive phase. |
| Slow connection | [Spec] | Any data fetch | Loading skeletons already exist for some surfaces (Candidates); extend consistently so nothing renders a blank white area while loading. |
| Reduced-motion preference | [Spec] | Global | See audit A11Y-06 — needs verification and, if Mantine's defaults don't already respect it, an explicit override. |
