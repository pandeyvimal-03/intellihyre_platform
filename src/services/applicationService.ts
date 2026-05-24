import api from './api';

export enum ApplicationStatus {
  APPLIED = 'APPLIED',
  PARSED = 'PARSED',
  SHORTLISTED = 'SHORTLISTED',
  REJECTED = 'REJECTED',
  INTERVIEW_SCHEDULED = 'INTERVIEW_SCHEDULED',
  COMPLETED = 'COMPLETED',
}

export interface Application {
  id: number;
  job_id: number;
  candidate_id: number;
  resume_url: string;
  match_score?: number;
  status: ApplicationStatus;
  created_at: string;
  candidate?: {
    id: number;
    name: string;
    email: string;
  };
  job?: {
    id: number;
    title: string;
    organization_name: string;
  };
  interview_status?: string;
  interview_result?: {
    id: number;
    total_score: number;
    recommendation: string;
    summary: string;
  };
}

export const applicationService = {
  async apply(jobId: number): Promise<Application> {
    const formData = new FormData();
    formData.append('job_id', jobId.toString());

    const response = await api.post<Application>('/applications/apply', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async getMyApplications(): Promise<Application[]> {
    const response = await api.get<Application[]>('/applications/me');
    return response.data;
  },

  async getJobApplications(jobId: number): Promise<Application[]> {
    const response = await api.get<Application[]>(`/applications/job/${jobId}`);
    return response.data;
  },

  async getAllApplications(): Promise<Application[]> {
    const response = await api.get<Application[]>('/applications/');
    return response.data;
  },

  async updateStatus(applicationId: number, status: ApplicationStatus): Promise<Application> {
    const response = await api.patch<Application>(`/applications/${applicationId}/status`, { status });
    return response.data;
  },
};
