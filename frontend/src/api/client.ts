import axios from 'axios';

export const apiClient = axios.create({
  // Relies on Vite proxy pointing to localhost:5000
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 10000,
});