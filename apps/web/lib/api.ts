import axios, { AxiosError, AxiosHeaders, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

type RetryConfig = InternalAxiosRequestConfig & { _retry?: boolean };

const api = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000'}/api/v1`,
  withCredentials: true
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  return config;
});

let refreshing = false;
let refreshPromise: Promise<string | null> | null = null;

const refreshAccessToken = async (): Promise<string | null> => {
  if (!refreshing) {
    refreshing = true;
    refreshPromise = api
      .post('/auth/refresh')
      .then((res: AxiosResponse) => {
        const token = res.data?.data?.accessToken as string | undefined;
        if (token && typeof window !== 'undefined') {
          localStorage.setItem('accessToken', token);
          document.cookie = `accessToken=${token}; path=/`;
          return token;
        }

        return null;
      })
      .catch(() => null)
      .finally(() => {
        refreshing = false;
      });
  }

  return refreshPromise;
};

api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const original = (error.config ?? null) as RetryConfig | null;

    if (error.response?.status === 401 && original && !original._retry) {
      original._retry = true;
      const token = await refreshAccessToken();
      if (token) {
        if (original.headers instanceof AxiosHeaders) {
          original.headers.set('Authorization', `Bearer ${token}`);
        } else {
          const headers = new AxiosHeaders();
          headers.set('Authorization', `Bearer ${token}`);
          original.headers = headers;
        }
        return api(original);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
