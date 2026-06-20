import axios from 'axios';

const api = axios.create({
  // If REACT_APP_API_URL is unset, fall back to the local backend.
  // This avoids login failures when the frontend runs on a different port.
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('commerce_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
