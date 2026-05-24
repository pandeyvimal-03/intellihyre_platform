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
  async (error) => {
    const originalRequest = error.config;

    // If error status is 401 and it's not a retry request
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Mark the request as retried
      originalRequest._retry = true;

      // If currently refreshing, queue the request
      if (isRefreshing) {
        return new Promise(function(resolve, reject) {
          failedQueue.push({ resolve, reject });
        }).then(() => { // No token to pass back as it's in cookie
          return api(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      isRefreshing = true;

      try {
        // Attempt to refresh token. Backend will set new cookies.
        await authService.refresh();
        
        processQueue(null); // Resolve all queued requests
        return api(originalRequest); // Retry the original failed request
      } catch (refreshError) {
        // If refresh fails (e.g., refresh token expired or invalid), logout
        processQueue(refreshError);
        await authService.logout(); // Clears local state and calls backend /logout to clear cookies
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    
    // For any other error or if not a 401 requiring refresh
    return Promise.reject(error);
  }
);

export default api;
