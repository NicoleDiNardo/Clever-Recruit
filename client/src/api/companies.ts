import { api } from './client';
import { Company, PaginatedResponse } from '../types';

export interface CompanyFilters {
  search?: string;
  industry?: string;
  page?: number;
  pageSize?: number;
}

export const companiesApi = {
  getAll: async (filters: CompanyFilters = {}): Promise<PaginatedResponse<Company>> => {
    const { data } = await api.get('/companies', { params: filters });
    return data;
  },

  getById: async (id: string): Promise<Company> => {
    const { data } = await api.get(`/companies/${id}`);
    return data;
  },

  create: async (company: Partial<Company>): Promise<Company> => {
    const { data } = await api.post('/companies', company);
    return data;
  },

  update: async (id: string, company: Partial<Company>): Promise<Company> => {
    const { data } = await api.put(`/companies/${id}`, company);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/companies/${id}`);
  },
};
