export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  role: string;
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

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
