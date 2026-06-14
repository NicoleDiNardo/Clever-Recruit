import { api } from './client';
import { User } from '../types';

export interface TeamMemberStats extends User {
  candidatesCount: number;
  activeAssignments: number;
  placements: number;
}

export const teamApi = {
  getAll: async (): Promise<TeamMemberStats[]> => {
    const { data } = await api.get('/team');
    return data;
  },

  getById: async (id: string): Promise<TeamMemberStats> => {
    const { data } = await api.get(`/team/${id}`);
    return data;
  },
};
