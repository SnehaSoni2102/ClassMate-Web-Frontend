// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  errors?: ApiError[];
  meta?: ApiMeta;
}

export interface ApiError {
  field?: string;
  message: string;
  code?: string;
}

export interface ApiMeta {
  page?: number;
  limit?: number;
  total?: number;
  totalPages?: number;
  hasNext?: boolean;
  hasPrev?: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: ApiMeta;
}

// Error Types
export enum ErrorType {
  NETWORK_ERROR = 'NETWORK_ERROR',
  AUTH_ERROR = 'AUTH_ERROR',
  PERMISSION_ERROR = 'PERMISSION_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  SERVER_ERROR = 'SERVER_ERROR',
  NOT_FOUND_ERROR = 'NOT_FOUND_ERROR',
  RATE_LIMIT_ERROR = 'RATE_LIMIT_ERROR'
}

export interface AppError {
  type: ErrorType;
  message: string;
  code?: string;
  details?: any;
  statusCode?: number;
}

// Request Types
export interface ApiRequestConfig {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  url: string;
  data?: any;
  params?: Record<string, any>;
  headers?: Record<string, string>;
  timeout?: number;
  retries?: number;
}

// Environment Configuration
export interface EnvironmentConfig {
  API_BASE_URL: string;
  APP_ENV: 'development' | 'staging' | 'production';
  ENABLE_ANALYTICS: boolean;
  LOG_LEVEL: 'debug' | 'info' | 'warn' | 'error';
  API_TIMEOUT: number;
  MAX_RETRIES: number;
}

// Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'classmate_auth_token',
  REFRESH_TOKEN: 'classmate_refresh_token',
  TEMP_TOKEN: 'classmate_temp_token',
  USER_DATA: 'classmate_user_data',
  PREFERENCES: 'classmate_preferences',
  THEME: 'classmate_theme'
} as const;

// API Endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/users/login',
    VERIFY_OTP: '/users/verify-otp',
    REFRESH_TOKEN: '/auth/refresh-token',
    LOGOUT: '/auth/logout'
  },
  USER: {
    PROFILE: '/users/me',
    UPDATE_PROFILE: '/users/update',
    STATS: '/users/stats',
    GROUPS: '/group/your-groups', // groups created by the user
    TESTS: '/users/tests'
  },
  GROUPS: {
    MY_GROUPS: '/group/my-groups', // groups the user is joined to
    ALL_GROUPS: '/group/all', // all groups for discovery
    LIST: '/group',
    CREATE: '/group/create',
    DETAIL: (id: string) => `/group/one/${id}`,
    UPDATE: (id: string) => `/group/${id}`,
    DELETE: (id: string) => `/group/${id}`,
    JOIN: (id: string) => `/group/${id}/join`,
    JOIN_REQUEST: (id: string) => `/group/join-request/${id}`,
    LEAVE: (id: string) => `/group/${id}/leave`,
    MEMBERS: (id: string) => `/group/${id}/members`,
    SEARCH_MEMBERS: (id: string) => `/group/${id}/search-members`,
    REQUESTS: (id: string) => `/group/${id}/requests`,
    STATS: (id: string) => `/group/${id}/stats`,
    FETCH_TESTS: (id: string) => `/group/group-tests/${id}`
  },
  TESTS: {
    LIST: '/tests',
    CREATE: '/tests',
    DETAIL: (id: string) => `/tests/${id}`,
    UPDATE: (id: string) => `/tests/${id}`,
    DELETE: (id: string) => `/tests/${id}`,
    START: (id: string) => `/tests/${id}/start`,
    SUBMIT: (id: string) => `/tests/${id}/submit`,
    RESULTS: (id: string) => `/tests/${id}/results`,
    PUBLISH: (id: string) => `/tests/${id}/publish`
  },
  GROUP_TESTS: {
    CREATE: (groupId: string) => `/group/create-test/${groupId}`,
    DETAIL: (groupId: string, testId: string) => `/test/${testId}`,
    UPDATE: (groupId: string, testId: string) => `/group/${groupId}/edit-test/${testId}`,
    DELETE: (groupId: string, testId: string) => `/group/${groupId}/test/${testId}`,
    LIST: (groupId: string) => `/group/fetch-test/${groupId}`
  },
  QUIZ: {
    GROUP_ACTIVE: (groupId: string) => `/quiz/group/${groupId}/active`,
    CREATE_GROUP: (groupId: string) => `/quiz/create/group/${groupId}`
  }
} as const;