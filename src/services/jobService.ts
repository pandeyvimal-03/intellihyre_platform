import api from './api';

export enum JobStatus {
  ACTIVE = 'ACTIVE',
  CLOSED = 'CLOSED',
  DRAFT = 'DRAFT',
}

export interface Job {
  id: number;
  title: string;
  organization_name: string;
  role: string;
  experience_required: string;
  work_mode: 'REMOTE' | 'ONSITE' | 'HYBRID' | 'ANY';
  location: string;
  salary_range?: string;
  skills_required: string;
  description: string;
  status: JobStatus;
  recruiter_id: number;
  created_at: string;
}

export interface JobCreate {
  title: string;
  organization_name: string;
  role: string;
  experience_required: string;
  work_mode: 'REMOTE' | 'ONSITE' | 'HYBRID' | 'ANY';
  location: string;
  salary_range?: string;
  skills_required: string;
  description: string;
  status?: JobStatus;
}

export const jobService = {
  async getAll(): Promise<Job[]> {
    const response = await api.get<Job[]>('/jobs/');
    return response.data;
  },

  async getById(id: number): Promise<Job> {
    const response = await api.get<Job>(`/jobs/${id}`);
    return response.data;
  },

  async create(data: JobCreate): Promise<Job> {
    const response = await api.post<Job>('/jobs/', data);
    return response.data;
  },

  async update(id: number, data: Partial<JobCreate>): Promise<Job> {
    const response = await api.put<Job>(`/jobs/${id}`, data);
    return response.data;
  },
  async deactivate(id: number): Promise<Job> {
    const response = await api.put<Job>(`/jobs/${id}`, { status: JobStatus.CLOSED });
    return response.data;
  },
};
