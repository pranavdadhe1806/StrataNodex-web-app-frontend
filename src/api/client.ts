import axios from 'axios';
import { getToken, clearToken } from '../utils/token';

const LANDING_AUTH_URL = 'https://stratanodex-landing-page.vercel.app/#auth';

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: { 'Content-Type': 'application/json' },
});

client.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearToken();
      window.location.href = LANDING_AUTH_URL;
    }
    return Promise.reject(error);
  }
);

export default client;
