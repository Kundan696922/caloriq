import axios from 'axios';

// In development this falls back to the local Express server.
// In production, VITE_API_URL must point at the deployed Render backend.
const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: `${baseURL}/api`,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach the JWT (once auth exists) from localStorage to every request.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('caloriq_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Normalize error messages so components can rely on `error.message`.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ||
      (error.request ? 'Unable to reach the server. Please try again.' : error.message);
    return Promise.reject(new Error(message));
  }
);

export default api;
