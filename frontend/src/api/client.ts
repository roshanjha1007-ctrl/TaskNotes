import axios, { AxiosError } from 'axios';

let authToken: string | null = null;

export function setApiAuthToken(token: string | null) {
  authToken = token;
}

const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000',
  headers: { 'Content-Type': 'application/json' },
  timeout: 10_000,
});

client.interceptors.request.use((config) => {
  if (authToken) {
    config.headers.Authorization = `Bearer ${authToken}`;
  } else if (config.headers.Authorization) {
    delete config.headers.Authorization;
  }

  return config;
});

// Normalise error shape — always throw { message, errors? }
client.interceptors.response.use(
  (res) => res,
  (err: AxiosError<{ message?: string; errors?: Record<string, string> }>) => {
    const message =
      err.response?.data?.message ?? err.message ?? 'An unexpected error occurred.';
    const errors = err.response?.data?.errors;
    return Promise.reject({ message, errors });
  },
);

export default client;
