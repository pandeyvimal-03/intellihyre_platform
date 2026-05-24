import api from './api';

export enum InterviewStatus {
  PENDING = 'pending',
  ONGOING = 'ongoing',
  COMPLETED = 'completed',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled',
}

export interface Interview {
  id: number;
  application_id: number;
  token: string;
  scheduled_at: string;
  expires_at: string;
  status: InterviewStatus;
}

export const interviewService = {
  async validateToken(token: string): Promise<Interview> {
    const response = await api.get<Interview>(`/interviews/validate/${token}`);
    return response.data;
  },

  async schedule(applicationId: number, scheduledAt: string): Promise<Interview> {
    const response = await api.post<Interview>('/interviews/schedule', {
      application_id: applicationId,
      scheduled_at: scheduledAt,
    });
    return response.data;
  },

  async getByApplicationId(applicationId: number): Promise<Interview> {
    const response = await api.get<Interview>(`/interviews/application/${applicationId}`);
    return response.data;
  },

  async getMyAppointments(): Promise<Interview[]> {
    const response = await api.get<Interview[]>('/interviews/me');
    return response.data;
  },
};
