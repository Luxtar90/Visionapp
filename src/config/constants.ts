// API Configuration
export const API_URL = 'https://api.visionapp.com/v1';

// App Configuration
export const APP_CONFIG = {
  name: 'VisionApp',
  version: '1.0.0',
  defaultLanguage: 'es',
  defaultTheme: 'light',
};

// Cache Configuration
export const CACHE_CONFIG = {
  defaultDuration: 5, // minutes
  maxItems: 100,
};

// Auth Configuration
export const AUTH_CONFIG = {
  tokenKey: 'token',
  userIdKey: 'userId',
  defaultRole: 'client',
};

// Navigation Routes
export const ROUTES = {
  auth: {
    login: '/login',
    register: '/register',
    forgotPassword: '/forgot-password',
  },
  app: {
    home: '/',
    profile: '/profile',
    appointments: '/appointments',
    studios: '/studios',
  },
};

// Storage Keys
export const STORAGE_KEYS = {
  token: '@VisionApp:token',
  user: '@VisionApp:user',
  theme: '@VisionApp:theme',
  language: '@VisionApp:language',
};

// API Endpoints
export const API_ENDPOINTS = {
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    forgotPassword: '/auth/forgot-password',
    resetPassword: '/auth/reset-password',
  },
  user: {
    profile: '/users/profile',
    update: '/users/update',
    changePassword: '/users/change-password',
  },
  appointments: {
    list: '/appointments',
    create: '/appointments',
    update: '/appointments/:id',
    delete: '/appointments/:id',
  },
  studios: {
    list: '/studios',
    details: '/studios/:id',
    services: '/studios/:id/services',
  },
}; 