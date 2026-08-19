import axios from 'axios';

const apiClient = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token automatically
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('farmsetu_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for token expiration handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // If unauthorized on protected route, clean local auth state
      if (!window.location.pathname.includes('/login')) {
        // Option to logout gracefully
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
