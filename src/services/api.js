import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true, // Enable cookies for CORS
})

// Request interceptor - add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor - handle responses and errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token')
      // Only redirect if not already on login page
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login'
      }
    }

    // Handle 403 Forbidden
    if (error.response?.status === 403) {
      console.error('Access forbidden:', error.response?.data?.message)
    }

    // Handle 429 Too Many Requests (Rate Limiting)
    if (error.response?.status === 429) {
      const retryAfter = error.response?.headers?.['retry-after'];
      const endpoint = error.config?.url || '';

      let message = 'Too many requests. Please slow down.';

      // Customize message based on endpoint
      if (endpoint.includes('/login')) {
        message = 'Too many login attempts. Please wait a moment and try again.';
      } else if (endpoint.includes('/register')) {
        message = 'Too many registration attempts. Please try again in an hour.';
      } else if (endpoint.includes('/posts') && error.config?.method === 'post') {
        message = "You've reached your daily post limit (50 posts). Please try again tomorrow.";
      } else if (endpoint.includes('/comments')) {
        message = "You've reached your daily comment limit (100 comments). Please try again tomorrow.";
      }

      if (retryAfter) {
        const minutes = Math.ceil(retryAfter / 60);
        message += ` Try again in ${minutes} minute${minutes > 1 ? 's' : ''}.`;
      }

      console.warn('Rate limit exceeded:', message);
      error.rateLimitMessage = message;
    }

    // Handle 500 Server Error
    if (error.response?.status >= 500) {
      console.error('Server error:', error.response?.data?.message)
    }

    return Promise.reject(error)
  }
)

export default api
