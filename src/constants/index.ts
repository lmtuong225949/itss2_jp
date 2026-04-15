export const API_BASE_URL = __DEV__ ? 'http://localhost:3000/api' : 'https://api.parkingapp.com/api';

export const STORAGE_KEYS = {
  AUTH_TOKEN: '@auth_token',
  USER_DATA: '@user_data',
  THEME: '@theme',
  LANGUAGE: '@language',
};

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
  },
  PARKING: {
    GET_LOTS: '/parking/lots',
    GET_DETAILS: '/parking/details',
    BOOK: '/parking/book',
    CANCEL: '/parking/cancel',
  },
  USER: {
    PROFILE: '/user/profile',
    UPDATE_PROFILE: '/user/update',
  },
};

export const VALIDATION_RULES = {
  PASSWORD_MIN_LENGTH: 6,
  PASSWORD_MAX_LENGTH: 20,
  EMAIL_MAX_LENGTH: 50,
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 50,
};

export const APP_CONFIG = {
  VERSION: '1.0.0',
  NAME: 'ParkingApp',
  SUPPORT_EMAIL: 'support@parkingapp.com',
  REFRESH_TOKEN_THRESHOLD: 15 * 60 * 1000, // 15 minutes in milliseconds
};
