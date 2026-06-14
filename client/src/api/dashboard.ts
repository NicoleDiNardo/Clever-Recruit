import { api } from './client';

export interface DashboardStats {
  totalCandidates: number;
  activeJobs: number;
  interviewsScheduled: number;
  placements: number;
  recentActivity: ActivityItem[];
  pipelineData: PipelineStage[];
}

export interface ActivityItem {
  id: string;
  type: string;
  description: string;
  timestamp: string;
  user?: { firstName: string; lastName: string; avatar?: string };
}

export interface PipelineStage {
  stage: string;
  count: number;
}

export const dashboardApi = {
  getStats: async (): Promise<DashboardStats> => {
    const { data } = await api.get('/dashboard');
    return data;
  },
};
