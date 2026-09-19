/**
 * Recruiter and admin manage jobs/candidates freely. Hiring manager reviews
 * candidates on jobs they're assigned to and can shortlist/reject/leave
 * feedback, but can't create jobs or freely move pipeline stages. See
 * /docs/clever-recruit-information-architecture.md for the full permission
 * boundary table this type backs.
 */
export type Role = 'recruiter' | 'hiring_manager' | 'admin';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  role: Role;
  /** IANA zone, e.g. 'America/Los_Angeles'. Not real per-person data — every
   *  mock user is given the org's own HQ zone (see utils/timezones.ts) since
   *  nothing in this dataset says where a given recruiter actually sits.
   *  Used only for the interview time-zone-mismatch notice — AUD-P1-02. */
  timezone?: string;
  createdAt: string;
}

/** A User plus invite state, for the admin Users screen only — the rest of
 *  the app never needs to know whether someone has accepted an invite yet. */
export interface OrgUser extends User {
  status: 'active' | 'pending';
}

/** A hiring manager's structured review of a candidate — flow 17 in the user-flows doc. */
export interface Feedback {
  id: string;
  recommendation: 'yes' | 'no' | 'maybe';
  comment?: string;
  authorId: string;
  authorName: string;
  createdAt: string;
}

export interface Candidate {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  avatar?: string;
  jobTitle?: string;
  score?: number;
  status: string;
  /** Pipeline position. 'withdrawn' (candidate-initiated) is distinct from
   *  'rejected' (recruiter/hiring-manager-initiated) even though both are
   *  terminal — see edge-cases doc. */
  stage?: string;
  location?: string;
  currentPosition?: string;
  currentOrganization?: string;
  employmentStatus?: string;
  ownerId?: string;
  owner?: User;
  assignments?: Assignment[];
  notes?: Note[];
  tasks?: Task[];
  /** Set by a hiring manager flagging a strong candidate — flow 13. */
  shortlisted?: boolean;
  feedback?: Feedback[];
  createdAt: string;
  updatedAt: string;
}

export interface Company {
  id: string;
  name: string;
  logo?: string;
  industry?: string;
  website?: string;
  location?: string;
  size?: string;
  jobs?: Job[];
  createdAt: string;
}

export interface Job {
  id: string;
  title: string;
  description?: string;
  location?: string;
  type?: string;
  salary?: string;
  /** 'draft' | 'open' | 'paused' | 'closed'. Only 'open' jobs are visible on
   *  the public careers site — see AUD-P1-03. */
  status: string;
  companyId: string;
  company?: Company;
  assignments?: Assignment[];
  createdAt: string;
}

export interface Assignment {
  id: string;
  stage: string;
  type?: string;
  candidateId: string;
  candidate?: Candidate;
  jobId: string;
  job?: Job;
  companyId: string;
  company?: Company;
  createdAt: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  candidateId: string;
  authorId: string;
  author?: User;
  createdAt: string;
}

export interface Task {
  id: string;
  title: string;
  content?: string;
  dueDate?: string;
  completed: boolean;
  candidateId: string;
  assigneeId: string;
  assignee?: User;
  createdAt: string;
}

/**
 * A thin, candidate-facing join between a public applicant and the internal
 * Candidate record their application created. Looked up by email + id
 * (the "reference code" a candidate is given at confirmation) rather than
 * requiring a real account — see product-definition.md's candidate-account
 * assumption.
 */
export interface Application {
  id: string;
  candidateId: string;
  jobId: string;
  jobTitle: string;
  applicantName: string;
  email: string;
  phone?: string;
  coverNote?: string;
  cvFileName?: string;
  createdAt: string;
}

/**
 * A scheduled interview between one candidate and one or more interviewers
 * for a job — AUD-P1-02. Unlike the Calendar page's old local `Interview`
 * type (free-text candidate/role/company strings with no relationship to
 * anything), this ties directly to a real Candidate, Job and User records.
 */
export interface Interview {
  id: string;
  candidateId: string;
  candidate?: Candidate;
  jobId?: string;
  job?: Job;
  interviewerIds: string[];
  interviewers?: User[];
  /** ISO datetime, UTC. */
  scheduledAt: string;
  durationMinutes: number;
  type: 'video' | 'phone' | 'onsite';
  status: 'scheduled' | 'completed' | 'cancelled';
  /** Only meaningful once status is 'completed'; unset otherwise. */
  outcome?: 'advance' | 'reject' | 'undecided';
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
