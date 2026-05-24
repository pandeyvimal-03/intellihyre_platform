import api from './api';
import { RecruiterProfile } from './profileServiceTypes';

export const recruiterProfileService = {
  async getMyProfile(): Promise<RecruiterProfile> {
    const response = await api.get<RecruiterProfile>('/recruiter-profiles/me');
    return response.data;
  },
  async createMyProfile(profileData: Partial<RecruiterProfile>): Promise<RecruiterProfile> {
    const response = await api.post<RecruiterProfile>('/recruiter-profiles/me', profileData);
    return response.data;
  },
  async updateMyProfile(profileData: Partial<RecruiterProfile>): Promise<RecruiterProfile> {
    const response = await api.put<RecruiterProfile>('/recruiter-profiles/me', profileData);
    return response.data;
  },
};
