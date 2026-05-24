import api from './api';
import { useAuthStore, User, UserRoleBackend } from '@/store/authStore'; // Import User and UserRoleBackend from authStore

export interface SignupData {
  name: string;
  email: string;
  password: string;
  role: UserRoleBackend; // Use UserRoleBackend
}

export const authService = {
  async login(formData: FormData): Promise<User> {
    const response = await api.post<User>('/auth/login', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    return response.data;
  },

  async signup(data: SignupData): Promise<User> {
    const response = await api.post<User>('/auth/signup', data);
    return response.data;
  },

  async me(): Promise<User> {
    const response = await api.get<User>('/auth/me');
    return response.data;
  },

  async refresh(): Promise<User> {
    const response = await api.post<User>('/auth/refresh-token');
    return response.data;
  },

  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Backend logout call failed, forcing local cleanup:', error);
    } finally {
      useAuthStore.getState().logout();
      window.location.href = '/'; // Forced reload/navigation to root
    }
  }
};
