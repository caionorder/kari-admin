import axios, { AxiosError, AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

const getApiUrl = (): string => {
  // If explicitly set in environment, use that
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }

  // Check if we're running in a Docker container or production domain
  const hostname = window?.location?.hostname || 'localhost';

  // Production domains
  if (hostname === 'kariajuda.com' || hostname === 'www.kariajuda.com') {
    return 'https://api.kariajuda.com';
  }

  // Docker container (site service connects to api service)
  if (hostname === 'site' || hostname === 'kariajuda-site') {
    return 'http://api:8000';
  }

  // Default URLs based on environment
  switch (process.env.NODE_ENV) {
    case 'production':
      return 'https://api.kariajuda.com';
    case 'development':
      return 'http://localhost:8000';
    case 'test':
      return 'http://localhost:8000';
    default:
      return 'http://localhost:8000';
  }
};

const API_BASE_URL = getApiUrl();

// Log the API URL for debugging
console.log('Admin Panel API URL:', API_BASE_URL);

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
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
    votes: '/voting/votes',
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
