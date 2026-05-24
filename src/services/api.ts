import axios from 'axios';
import { useAuthStore } from '@/store/authStore';
import { authService } from './authService'; // Import authService

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.defaults.withCredentials = true; // Crucial for sending cookies

let isRefreshing = false;
let failedQueue: Array<{ resolve: (value: any) => void; reject: (reason?: any) => void }> = [];

const processQueue = (error: any | null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(null); // Tokens are now in cookies, no need to pass a token
    }
  });
  failedQueue = [];
};

// Request interceptor: No longer manually adding Authorization header as cookies are sent automatically

// Response interceptor for API calls
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If error status is 401, logout and redirect to login
    if (error.response?.status === 401) {
      const currentPath = window.location.pathname;
      if (currentPath !== '/login' && currentPath !== '/register') {
        console.log("Interceptor: 401 detected, logging out");
        useAuthStore.getState().logout();
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
