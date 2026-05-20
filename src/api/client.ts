import axios from 'axios';
import { getToken, clearToken } from '../utils/token';

// In dev, redirect to local landing page; in prod, to deployed Vercel app
const LANDING_BASE_URL =
  import.meta.env.VITE_LANDING_URL ?? 'https://stratanodex-landing-page.vercel.app';

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
      // Include ?redirect= so the landing page can bounce the user back after login
      const returnTo = encodeURIComponent(window.location.href);
      window.location.href = `${LANDING_BASE_URL}/?redirect=${returnTo}#auth`;
    }
    return Promise.reject(error);
  }
);

export default client;
