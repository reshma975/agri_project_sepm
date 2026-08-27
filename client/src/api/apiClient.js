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
      // If user does not exist or token is invalid, clear stale token
      const msg = error.response.data?.message;
      if (msg === 'User not found' || msg?.includes('Not authorized') || msg?.includes('token invalid')) {
        try {
          localStorage.removeItem('farmsetu_token');
        } catch (e) {
          console.warn('Could not remove farmsetu_token', e);
        }
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
