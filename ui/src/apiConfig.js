import axios from 'axios';

const rawBaseUrl = import.meta.env.VITE_API_URL || '';
const API_BASE_URL = rawBaseUrl.replace(/\/$/, '');

if (import.meta.env.PROD) {
  if (!API_BASE_URL) {
    console.warn('[apiConfig] VITE_API_URL is not set. API requests will use the frontend origin and may fail in production.');
  } else {
    console.log(`[apiConfig] Using API_BASE_URL=${API_BASE_URL}`);
  }
}

const normalizeUrl = (url) => {
  if (typeof url !== 'string') return url;

  if (url.startsWith('http://localhost:5000')) {
    return url.replace('http://localhost:5000', API_BASE_URL || '');
  }

  if (url.startsWith('/')) {
    return API_BASE_URL ? `${API_BASE_URL}${url}` : url;
  }

  if (url.startsWith('api/')) {
    return API_BASE_URL ? `${API_BASE_URL}/${url}` : `/${url}`;
  }

  return url;
};

export const installApiConfig = () => {
  axios.defaults.baseURL = API_BASE_URL || '';

  axios.interceptors.request.use((config) => {
    if (config.url) {
      config.url = normalizeUrl(config.url);
    }
    return config;
  });

  const originalFetch = window.fetch.bind(window);
  window.fetch = (input, init) => {
    const resolvedInput = typeof input === 'string' ? normalizeUrl(input) : input;
    return originalFetch(resolvedInput, init);
  };
};
