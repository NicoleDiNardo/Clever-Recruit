import { api } from './client';
import { Candidate, PaginatedResponse } from '../types';

export interface CandidateFilters {
  search?: string;
  status?: string;
  stage?: string;
  jobTitle?: string;
  ownOnly?: boolean;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export const candidatesApi = {
  getAll: async (filters: CandidateFilters = {}): Promise<PaginatedResponse<Candidate>> => {
    const { data } = await api.get('/candidates', { params: filters });
    return data;
  },

  getById: async (id: string): Promise<Candidate> => {
    const { data } = await api.get(`/candidates/${id}`);
    return data;
  },

  create: async (candidate: Partial<Candidate>): Promise<Candidate> => {
    const { data } = await api.post('/candidates', candidate);
    return data;
  },

  update: async (id: string, candidate: Partial<Candidate>): Promise<Candidate> => {
    const { data } = await api.put(`/candidates/${id}`, candidate);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/candidates/${id}`);
  },
};
