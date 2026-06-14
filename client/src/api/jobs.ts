import { api } from './client';
import { Job, PaginatedResponse } from '../types';

export interface JobFilters {
  search?: string;
  status?: string;
  companyId?: string;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export const jobsApi = {
  getAll: async (filters: JobFilters = {}): Promise<PaginatedResponse<Job>> => {
    const { data } = await api.get('/jobs', { params: filters });
    return data;
  },

  getById: async (id: string): Promise<Job> => {
    const { data } = await api.get(`/jobs/${id}`);
    return data;
  },

  create: async (job: Partial<Job>): Promise<Job> => {
    const { data } = await api.post('/jobs', job);
    return data;
  },

  update: async (id: string, job: Partial<Job>): Promise<Job> => {
    const { data } = await api.put(`/jobs/${id}`, job);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/jobs/${id}`);
  },
};
