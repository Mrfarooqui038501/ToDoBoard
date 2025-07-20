import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to add Authorization header with token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export const API_URLS = {
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  TASKS: '/tasks',
  TASK_BY_ID: (id) => `/tasks/${id}`,
  SMART_ASSIGN: (id) => `/tasks/smart-assign/${id}`,
  ACTIONS: '/actions',
};

export default api;