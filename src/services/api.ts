import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000/api/v1';

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
};

export default api;