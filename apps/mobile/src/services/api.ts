import axios from 'axios';

const BASE_URL = process.env.LAMBDA_BASE_URL ?? 'https://REPLACE_WITH_CLOUDFRONT_DOMAIN';

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15_000,
  headers: {
    'Content-Type': 'application/json',
    'X-Api-Key': process.env.API_ORIGIN_KEY ?? '',
  },
});

api.interceptors.response.use(
  response => response,
  error => {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      const data = error.response?.data as { message?: string } | undefined;
      const message = data?.message ?? error.message;
      const enhancedError = new Error(message);
      (enhancedError as Error & { status?: number }).status = status;
      return Promise.reject(enhancedError);
    }
    return Promise.reject(error);
  }
);
