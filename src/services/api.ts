import axios, { AxiosError, AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

const getApiUrl = (): string => {
  // Check for runtime config first (highest priority)
  if ((window as any).RUNTIME_CONFIG?.API_URL) {
    return (window as any).RUNTIME_CONFIG.API_URL;
  }
  
  // If explicitly set in environment, use that
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }

  // Check hostname and protocol
  const hostname = window?.location?.hostname || 'localhost';
  const protocol = window?.location?.protocol || 'http:';

  // Admin production domain - MUST use HTTPS with /api/v1 path
  if (hostname === 'admin.kariajuda.com' || hostname === 'www.admin.kariajuda.com') {
    return 'https://api.kariajuda.com/api/v1';
  }

  // If accessing via HTTPS anywhere, use HTTPS for API
  if (protocol === 'https:') {
    return 'https://api.kariajuda.com/api/v1';
  }

  // Docker container (admin service connects to api service)
  if (hostname === 'admin' || hostname === 'kariajuda-admin') {
    return 'http://api:8000/api/v1';
  }

  // Development
  return 'http://127.0.0.1:8000/api/v1';
};

// Create axios instance without baseURL initially
const api: AxiosInstance = axios.create({
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Request interceptor to add auth token and dynamic base URL
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // FORCE HTTPS in production
    const hostname = window?.location?.hostname || 'localhost';
    const isProduction = hostname.includes('kariajuda.com');
    
    // Always use HTTPS in production
    const apiUrl = isProduction 
      ? 'https://api.kariajuda.com/api/v1'
      : getApiUrl();
    
    // Log for debugging
    console.log('Request URL:', config.url, 'Base URL:', apiUrl, 'Production:', isProduction);
    
    // Build full URL
    if (config.url && !config.url.startsWith('http')) {
      config.url = apiUrl + config.url;
    }
    
    // CRITICAL: Force HTTPS if URL still has HTTP in production
    if (isProduction && config.url && config.url.startsWith('http://')) {
      config.url = config.url.replace('http://', 'https://');
      console.warn('FORCED HTTPS:', config.url);
    }
    
    const token = localStorage.getItem('authToken');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API endpoints
export const endpoints = {
  // Auth
  auth: {
    login: '/login/access-token',
    logout: '/auth/logout',
    refresh: '/auth/refresh',
    profile: '/users/me',
  },
  // Campaigns
  campaigns: {
    list: '/campaigns',
    detail: (id: string) => `/campaigns/${id}`,
    create: '/campaigns',
    update: (id: string) => `/campaigns/${id}`,
    delete: (id: string) => `/campaigns/${id}`,
  },
  // Participants
  participants: {
    list: '/participants',
    detail: (id: string) => `/participants/${id}`,
    create: '/participants',
    update: (id: string) => `/participants/${id}`,
    delete: (id: string) => `/participants/${id}`,
    byCampaign: (campaignId: string) => `/campaigns/${campaignId}/participants`,
  },
  // Voting
  voting: {
    results: '/voting/results',
    votes: '/votes',
    votesByCampaign: (campaignId: string) => `/campaigns/${campaignId}/votes`,
    stats: '/voting/statistics',
  },
  // Winners
  winners: {
    list: '/winners',
    declare: '/winners/declare',
    byCampaign: (campaignId: string) => `/campaigns/${campaignId}/winners`,
  },
  // Content
  content: {
    list: '/content',
    detail: (id: string) => `/content/${id}`,
    update: (id: string) => `/content/${id}`,
  },
  // Users
  users: {
    list: '/users',
    detail: (id: string) => `/users/${id}`,
    create: '/users',
    update: (id: string) => `/users/${id}`,
    delete: (id: string) => `/users/${id}`,
  },
  // Statistics
  stats: {
    dashboard: '/statistics/dashboard',
    campaigns: '/statistics/campaigns',
    participants: '/statistics/participants',
    voting: '/statistics/voting',
  },
  // Upload
  upload: {
    image: '/upload/image',
    delete: (filename: string) => `/upload/image/${filename}`,
  },
};

export default api;
