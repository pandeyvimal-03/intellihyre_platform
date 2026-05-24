import api from './api';
import { CandidateProfile } from './profileServiceTypes';

export const candidateProfileService = {
  async getMyProfile(): Promise<CandidateProfile> {
    const response = await api.get<CandidateProfile>('/candidate-profiles/me');
    return response.data;
  },
  async createMyProfile(profileData: Partial<CandidateProfile>): Promise<CandidateProfile> {
    const response = await api.post<CandidateProfile>('/candidate-profiles/me', profileData);
    return response.data;
  },
  async updateMyProfile(profileData: Partial<CandidateProfile>): Promise<CandidateProfile> {
    const response = await api.put<CandidateProfile>('/candidate-profiles/me', profileData);
    return response.data;
  },
  async uploadResume(file: File): Promise<CandidateProfile> {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post<CandidateProfile>('/candidate-profiles/me/upload-resume', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }
};
